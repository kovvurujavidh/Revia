// Importers/Callers: src/app/dashboard/page.tsx
// Affected API: PGDashboard React component for pg_hostel tenants (Real data metrics, bed capacity, due date alerts, WhatsApp reminders)
// Data Schemas: Business, Customer, Visit, Opportunity from src/lib/types.ts
// User's Verbatim Instruction: "c:\AI\Revia_Final_All_Three_Business_Updates_Claude_Code_Prompt.docx now this make todo and complete updaate"

"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import {
  Home,
  Users,
  BedDouble,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  CreditCard,
  PlusCircle,
  Phone,
  MessageCircle,
  ArrowRight,
  TrendingUp,
  Search,
  X,
  Sparkles,
  DollarSign,
  AlertCircle,
  Building,
} from "lucide-react";
import Link from "next/link";
import { parsePGResident, ParsedPGResident, calculateDaysLeft } from "@/lib/pgUtils";
import { buildWhatsAppLink } from "@/lib/intelligence";

export function PGDashboard() {
  const { activeBusiness, customers, visits, addCustomer, addVisit, logWhatsAppSend } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDue, setFilterDue] = useState<"all" | "overdue" | "due_soon" | "due_today">("all");
  const [isAddResidentModalOpen, setIsAddResidentModalOpen] = useState(false);
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);
  const [selectedResidentForPayment, setSelectedResidentForPayment] = useState<ParsedPGResident | null>(null);

  // Form State for Quick Payment
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Form State for Add Resident
  const [newResidentName, setNewResidentName] = useState("");
  const [newResidentPhone, setNewResidentPhone] = useState("");
  const [newResidentRent, setNewResidentRent] = useState("5000");
  const [newResidentPlan, setNewResidentPlan] = useState<"monthly" | "half_monthly" | "yearly">("monthly");
  const [newResidentRoom, setNewResidentRoom] = useState("101");
  const [newResidentBed, setNewResidentBed] = useState("A");
  const [newResidentJoining, setNewResidentJoining] = useState(new Date().toISOString().split("T")[0]);

  // Parse real residents
  const residents = useMemo(() => {
    return customers.map((c) => parsePGResident(c, visits));
  }, [customers, visits]);

  const activeResidents = residents.filter((r) => r.status === "active");

  // Metrics calculation
  const totalResidents = activeResidents.length;
  const totalRoomsCount = Math.max(5, Math.ceil(totalResidents / 2) + 2);
  const totalBedsCapacity = totalRoomsCount * 2; // Assuming 2 beds per room by default
  const occupiedBeds = totalResidents;
  const availableBeds = Math.max(0, totalBedsCapacity - occupiedBeds);
  const occupancyRate = totalBedsCapacity > 0 ? Math.round((occupiedBeds / totalBedsCapacity) * 100) : 0;

  // Due counts
  const overdueResidents = activeResidents.filter((r) => r.dueStatus === "overdue");
  const dueTodayResidents = activeResidents.filter((r) => r.dueStatus === "due_today");
  const dueSoonResidents = activeResidents.filter((r) => r.dueStatus === "due_soon");

  // Revenue calculation (this month)
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthPayments = visits.filter((v) => new Date(v.created_at || v.date) >= firstDayOfMonth);
  const totalCollectedThisMonth = thisMonthPayments.reduce((acc, v) => acc + (v.amount || 0), 0);

  // Pending rent estimation
  const totalPendingRent = [...overdueResidents, ...dueTodayResidents].reduce(
    (acc, r) => acc + (r.rentAmount || 0),
    0
  );

  const currencySymbol = activeBusiness?.currency_symbol || "₹";

  // Filtered residents for list
  const filteredResidents = activeResidents.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phone.includes(searchTerm) ||
      r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterDue === "overdue") return r.dueStatus === "overdue";
    if (filterDue === "due_today") return r.dueStatus === "due_today";
    if (filterDue === "due_soon") return r.dueStatus === "due_soon";
    return true;
  });

  const handleQuickAddResident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResidentName.trim() || !newResidentPhone.trim()) return;

    const { serializePGMetadata, calculateNextDueDate } = await import("@/lib/pgUtils");
    const nextDueDate = calculateNextDueDate(newResidentJoining, newResidentPlan);

    const metaString = serializePGMetadata({
      payment_plan: newResidentPlan,
      rent_amount: Number(newResidentRent) || 5000,
      room_number: newResidentRoom.trim(),
      bed_number: newResidentBed.trim(),
      joining_date: newResidentJoining,
      next_due_date: nextDueDate,
      status: "active",
    });

    await addCustomer({
      name: newResidentName.trim(),
      phone: newResidentPhone.trim(),
      business_id: activeBusiness.id,
      is_anonymous: false,
      segment: "new",
      total_visits: 0,
      total_spend: 0,
      avg_bill: Number(newResidentRent) || 5000,
      avg_visit_interval_days: 30,
      first_visit_date: new Date(newResidentJoining).toISOString(),
      last_visit_date: new Date(newResidentJoining).toISOString(),
      tags: ["pg_resident", newResidentPlan],
      favorite_items: [`Room ${newResidentRoom.trim()}`, `Bed ${newResidentBed.trim()}`],
      notes: metaString,
    });

    setIsAddResidentModalOpen(false);
    setNewResidentName("");
    setNewResidentPhone("");
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResidentForPayment || !paymentAmount) return;

    setIsSubmittingPayment(true);
    const amountNum = Number(paymentAmount) || selectedResidentForPayment.rentAmount;

    // Add rent payment visit
    await addVisit({
      customer_id: selectedResidentForPayment.id,
      customer_name: selectedResidentForPayment.name,
      customer_phone: selectedResidentForPayment.phone,
      amount: amountNum,
      is_anonymous: false,
      items: [`PG Rent: Room ${selectedResidentForPayment.roomNumber} (Bed ${selectedResidentForPayment.bedNumber})`],
      notes: `Method: ${paymentMethod}, Cycle: ${selectedResidentForPayment.paymentPlan}`,
      date: new Date().toISOString(),
    });

    // Update customer next due date
    const { calculateNextDueDate, serializePGMetadata } = await import("@/lib/pgUtils");
    const newDueDate = calculateNextDueDate(new Date().toISOString().split("T")[0], selectedResidentForPayment.paymentPlan);

    const { updateCustomer } = await import("@/lib/store").then((m) => ({ updateCustomer: m.AppStore.getInstance().updateCustomer.bind(m.AppStore.getInstance()) }));

    const updatedRaw = {
      ...selectedResidentForPayment.rawCustomer,
      total_visits: selectedResidentForPayment.rawCustomer.total_visits + 1,
      total_spend: selectedResidentForPayment.rawCustomer.total_spend + amountNum,
      last_visit_date: new Date().toISOString(),
      notes: serializePGMetadata({
        payment_plan: selectedResidentForPayment.paymentPlan,
        rent_amount: selectedResidentForPayment.rentAmount,
        room_number: selectedResidentForPayment.roomNumber,
        bed_number: selectedResidentForPayment.bedNumber,
        joining_date: selectedResidentForPayment.joiningDate,
        next_due_date: newDueDate,
        status: "active",
      }),
    };

    await updateCustomer(updatedRaw);

    setIsSubmittingPayment(false);
    setIsRecordPaymentModalOpen(false);
    setSelectedResidentForPayment(null);
    setPaymentAmount("");
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#111439] to-[#1E2260] text-white p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] tracking-wide uppercase border border-emerald-500/30 flex items-center gap-1">
              <Building className="h-3 w-3" /> PG & Hostel Workspace
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">{activeBusiness.name}</h1>
          <p className="text-xs text-slate-300">
            Resident occupancy, room & bed management, and dynamic rent cycle tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAddResidentModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6C4DFF] hover:bg-[#5835FF] text-white text-xs font-bold shadow-lg shadow-purple-500/20 transition-all cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Resident</span>
          </button>
          <Link
            href="/customers"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/10 transition-all"
          >
            <Users className="h-4 w-4" />
            <span>All Residents ({totalResidents})</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Residents */}
        <div className="rounded-2xl border border-[#EAECF0] bg-[#FFFFFF] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">Total Residents</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#6C4DFF]/10 text-[#6C4DFF]">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#111439] mt-2">{totalResidents}</p>
          <p className="text-[11px] text-[#667085] mt-0.5">Active residing tenants</p>
        </div>

        {/* Beds Occupancy */}
        <div className="rounded-2xl border border-[#EAECF0] bg-[#FFFFFF] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">Occupancy Rate</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <BedDouble className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-xl sm:text-2xl font-black text-[#111439]">{occupancyRate}%</p>
            <span className="text-[11px] font-bold text-emerald-600">
              {occupiedBeds}/{totalBedsCapacity} Beds
            </span>
          </div>
          <p className="text-[11px] text-[#667085] mt-0.5">{availableBeds} beds vacant</p>
        </div>

        {/* Collected This Month */}
        <div className="rounded-2xl border border-[#EAECF0] bg-[#FFFFFF] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">Rent Collected</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#111439] mt-2">
            {currencySymbol}{totalCollectedThisMonth.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-blue-600 font-semibold mt-0.5">
            {thisMonthPayments.length} payments recorded this month
          </p>
        </div>

        {/* Overdue / Pending */}
        <div className="rounded-2xl border border-[#EAECF0] bg-[#FFFFFF] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">Pending / Overdue</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#EF4444] mt-2">
            {overdueResidents.length + dueTodayResidents.length} Residents
          </p>
          <p className="text-[11px] text-rose-600 font-semibold mt-0.5">
            ~{currencySymbol}{totalPendingRent.toLocaleString("en-IN")} pending
          </p>
        </div>
      </div>

      {/* Due Status Filter Tabs & Action Section */}
      <div className="rounded-3xl border border-[#EAECF0] bg-[#FFFFFF] p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAECF0] pb-4">
          <div>
            <h2 className="text-base font-bold text-[#111439]">Resident Rent Schedule & Status</h2>
            <p className="text-xs text-[#667085]">
              Real-time payment cycles: Monthly (+30d), Half-Monthly (+15d), and Yearly (+365d).
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#F8F8F9] p-1 rounded-xl border border-[#EAECF0]">
            <button
              onClick={() => setFilterDue("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterDue === "all" ? "bg-[#FFFFFF] text-[#111439] shadow-xs" : "text-[#667085] hover:text-[#111439]"
              }`}
            >
              All ({activeResidents.length})
            </button>
            <button
              onClick={() => setFilterDue("overdue")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterDue === "overdue" ? "bg-rose-500 text-white shadow-xs" : "text-rose-600 hover:bg-rose-50"
              }`}
            >
              Overdue ({overdueResidents.length})
            </button>
            <button
              onClick={() => setFilterDue("due_today")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterDue === "due_today" ? "bg-amber-500 text-white shadow-xs" : "text-amber-600 hover:bg-amber-50"
              }`}
            >
              Due Today ({dueTodayResidents.length})
            </button>
            <button
              onClick={() => setFilterDue("due_soon")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterDue === "due_soon" ? "bg-blue-500 text-white shadow-xs" : "text-blue-600 hover:bg-blue-50"
              }`}
            >
              Due Soon ({dueSoonResidents.length})
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search resident by name, phone, or room (e.g. 101, Rahul)..."
            className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] pl-10 pr-4 py-2 text-xs text-[#111439] placeholder:text-[#94A3B8] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none transition-colors"
          />
        </div>

        {/* Resident Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#111439]">
            <thead className="bg-[#F8F8F9] text-[10px] font-bold uppercase tracking-wider text-[#667085] border-y border-[#EAECF0]">
              <tr>
                <th className="py-3 px-4">Resident</th>
                <th className="py-3 px-3">Room / Bed</th>
                <th className="py-3 px-3">Payment Cycle</th>
                <th className="py-3 px-3">Rent Amount</th>
                <th className="py-3 px-3">Next Due Date</th>
                <th className="py-3 px-3">Days Left</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAECF0]">
              {filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#667085]">
                    No residents matching your filter.
                  </td>
                </tr>
              ) : (
                filteredResidents.map((resident) => {
                  const whatsappReminderMsg = `Hi ${resident.name}! 🏠 Gentle reminder from ${activeBusiness.name} that your PG rent of ${currencySymbol}${resident.rentAmount} is due on ${resident.nextDueDate}. Kindly clear your dues via UPI or cash. Thank you!`;
                  const whatsappLink = buildWhatsAppLink(resident.phone, whatsappReminderMsg);

                  return (
                    <tr key={resident.id} className="hover:bg-[#F8F8F9]/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold">
                        <div className="font-bold text-[#111439]">{resident.name}</div>
                        <div className="text-[11px] text-[#667085] font-mono">{resident.phone}</div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-[#6C4DFF] border border-purple-100 font-bold text-[11px]">
                          Room {resident.roomNumber} · Bed {resident.bedNumber}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="capitalize font-medium text-[#475467]">
                          {resident.paymentPlan.replace("_", " ")}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 font-bold text-[#111439]">
                        {currencySymbol}{resident.rentAmount.toLocaleString("en-IN")}
                      </td>

                      <td className="py-3.5 px-3 font-mono text-[11px]">
                        {resident.nextDueDate}
                      </td>

                      <td className="py-3.5 px-3 font-bold">
                        {resident.daysLeft < 0 ? (
                          <span className="text-rose-600">{Math.abs(resident.daysLeft)} days overdue</span>
                        ) : resident.daysLeft === 0 ? (
                          <span className="text-amber-600">Due Today</span>
                        ) : (
                          <span className="text-emerald-600">{resident.daysLeft} days left</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        {resident.dueStatus === "overdue" && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-200">
                            Overdue
                          </span>
                        )}
                        {resident.dueStatus === "due_today" && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200">
                            Due Today
                          </span>
                        )}
                        {resident.dueStatus === "due_soon" && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold border border-blue-200">
                            Due Soon
                          </span>
                        )}
                        {resident.dueStatus === "paid_active" && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                            Active
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedResidentForPayment(resident);
                              setPaymentAmount(String(resident.rentAmount));
                              setIsRecordPaymentModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#16A34A] hover:bg-emerald-600 text-white font-bold text-[11px] shadow-xs transition-colors cursor-pointer"
                            title="Record Rent Payment"
                          >
                            Pay Rent
                          </button>

                          <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              logWhatsAppSend({
                                customer_id: resident.id,
                                customer_name: resident.name,
                                customer_phone: resident.phone,
                                template_name: "PG Rent Due Reminder",
                                message_sent: whatsappReminderMsg,
                              });
                            }}
                            className="p-1.5 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors"
                            title="Send WhatsApp Due Reminder"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Rent Payment Modal */}
      {isRecordPaymentModalOpen && selectedResidentForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111439]/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[#EAECF0] bg-[#FFFFFF] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAECF0] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#111439]">Record Rent Payment</h3>
                <p className="text-[11px] text-[#667085]">
                  {selectedResidentForPayment.name} (Room {selectedResidentForPayment.roomNumber})
                </p>
              </div>
              <button
                onClick={() => setIsRecordPaymentModalOpen(false)}
                className="rounded-full p-1.5 text-[#667085] hover:bg-[#F1F1F4]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5">
                  Amount Received ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2.5 text-xs font-bold text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5">
                  Payment Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["UPI", "Cash", "Bank Transfer"].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMethod(mode)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                        paymentMethod === mode
                          ? "border-[#6C4DFF] bg-[#6C4DFF]/10 text-[#6C4DFF]"
                          : "border-[#EAECF0] bg-[#F8F8F9] text-[#667085]"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-[11px] text-blue-800">
                Recording payment will automatically advance the resident's next due date based on their{" "}
                <span className="font-bold">{selectedResidentForPayment.paymentPlan.replace("_", " ")}</span> plan.
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRecordPaymentModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#EAECF0] bg-[#F8F8F9] text-xs font-bold text-[#667085]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="flex-1 py-2.5 rounded-xl bg-[#16A34A] hover:bg-emerald-600 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingPayment ? "Saving..." : "Confirm Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add Resident Modal */}
      {isAddResidentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111439]/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-[#EAECF0] bg-[#FFFFFF] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAECF0] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#111439]">Add PG Resident</h3>
                <p className="text-[11px] text-[#667085]">Enter personal & rent details (PG business info already saved)</p>
              </div>
              <button
                onClick={() => setIsAddResidentModalOpen(false)}
                className="rounded-full p-1.5 text-[#667085] hover:bg-[#F1F1F4]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleQuickAddResident} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5">
                    Resident Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newResidentName}
                    onChange={(e) => setNewResidentName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2 text-xs text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5">
                    Phone Number (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newResidentPhone}
                    onChange={(e) => setNewResidentPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2 text-xs text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5">
                    Room Number
                  </label>
                  <input
                    type="text"
                    value={newResidentRoom}
                    onChange={(e) => setNewResidentRoom(e.target.value)}
                    placeholder="e.g. 101"
                    className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2 text-xs text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5">
                    Bed Identifier
                  </label>
                  <input
                    type="text"
                    value={newResidentBed}
                    onChange={(e) => setNewResidentBed(e.target.value)}
                    placeholder="e.g. A or 1"
                    className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2 text-xs text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5">
                    Payment Plan
                  </label>
                  <select
                    value={newResidentPlan}
                    onChange={(e) => setNewResidentPlan(e.target.value as any)}
                    className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2 text-xs font-bold text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none"
                  >
                    <option value="monthly">Monthly (30 Days)</option>
                    <option value="half_monthly">Half-Monthly (15 Days)</option>
                    <option value="yearly">Yearly (365 Days)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5">
                    Rent Amount ({currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newResidentRent}
                    onChange={(e) => setNewResidentRent(e.target.value)}
                    className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2 text-xs font-bold text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5">
                  Joining / Payment Start Date
                </label>
                <input
                  type="date"
                  value={newResidentJoining}
                  onChange={(e) => setNewResidentJoining(e.target.value)}
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2 text-xs text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddResidentModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#EAECF0] bg-[#F8F8F9] text-xs font-bold text-[#667085]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl brand-gradient text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Resident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
