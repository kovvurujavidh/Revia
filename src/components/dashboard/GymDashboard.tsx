// Importers/Callers: src/app/dashboard/page.tsx
// Affected API: GymDashboard React component for gym & fitness studio tenants (Attendance metrics, member renewals, WhatsApp expiry alerts)
// Data Schemas: Business, Customer, Visit, GymMember, GymAttendanceRecord from src/lib/types.ts
// User's Verbatim Instruction: "c:\AI\Revia_Final_All_Three_Business_Updates_Claude_Code_Prompt.docx now this make todo and complete updaate"

"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import {
  Dumbbell,
  Users,
  CalendarCheck,
  AlertTriangle,
  Clock,
  PlusCircle,
  CheckCircle2,
  MessageCircle,
  Search,
  X,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { parseGymMember, ParsedGymMember, calculateGymDaysLeft } from "@/lib/gymUtils";
import { buildWhatsAppLink } from "@/lib/intelligence";

export function GymDashboard() {
  const { activeBusiness, customers, visits, addCustomer, addVisit, logWhatsAppSend } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "expiring_soon" | "expired">("all");
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [selectedMemberForRenew, setSelectedMemberForRenew] = useState<ParsedGymMember | null>(null);

  // Quick Member form state
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [newMemberPlan, setNewMemberPlan] = useState("Monthly Fitness");
  const [newMemberMonths, setNewMemberMonths] = useState(1);
  const [newMemberPrice, setNewMemberPrice] = useState("1500");
  const [newMemberStartDate, setNewMemberStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [newMemberEmergency, setNewMemberEmergency] = useState("");

  // Renewal form state
  const [renewMonths, setRenewMonths] = useState(1);
  const [renewAmount, setRenewAmount] = useState("1500");
  const [isSubmittingRenew, setIsSubmittingRenew] = useState(false);

  // Parse gym members from customers
  const members = useMemo(() => {
    return customers.map((c) => parseGymMember(c, visits));
  }, [customers, visits]);

  const activeMembers = members.filter((m) => m.status === "active");
  const expiringSoonMembers = members.filter((m) => m.status === "expiring_soon");
  const expiredMembers = members.filter((m) => m.status === "expired");

  // Today's attendance calculation
  const todayStr = new Date().toISOString().split("T")[0];
  const todayVisits = visits.filter((v) => {
    const vDate = (v.date || v.created_at).split("T")[0];
    return vDate === todayStr;
  });

  const currencySymbol = activeBusiness?.currency_symbol || "₹";

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm) ||
      m.planName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === "active") return m.status === "active";
    if (filterStatus === "expiring_soon") return m.status === "expiring_soon";
    if (filterStatus === "expired") return m.status === "expired";
    return true;
  });

  const handleQuickAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberPhone.trim()) return;

    const { serializeGymMetadata, calculateGymExpiryDate } = await import("@/lib/gymUtils");
    const expiryDate = calculateGymExpiryDate(newMemberStartDate, newMemberMonths);

    const metaString = serializeGymMetadata({
      plan_name: newMemberPlan,
      plan_duration_months: newMemberMonths,
      amount_paid: Number(newMemberPrice) || 1500,
      start_date: newMemberStartDate,
      expiry_date: expiryDate,
      emergency_contact: newMemberEmergency.trim(),
    });

    await addCustomer({
      name: newMemberName.trim(),
      phone: newMemberPhone.trim(),
      business_id: activeBusiness.id,
      is_anonymous: false,
      segment: "new",
      total_visits: 1,
      total_spend: Number(newMemberPrice) || 1500,
      avg_bill: Number(newMemberPrice) || 1500,
      avg_visit_interval_days: 2,
      first_visit_date: new Date(newMemberStartDate).toISOString(),
      last_visit_date: new Date().toISOString(),
      tags: ["gym_member", newMemberPlan],
      favorite_items: [newMemberPlan],
      notes: metaString,
    });

    // Record initial membership visit
    await addVisit({
      customer_name: newMemberName.trim(),
      customer_phone: newMemberPhone.trim(),
      amount: Number(newMemberPrice) || 1500,
      is_anonymous: false,
      items: [`Gym Plan: ${newMemberPlan} (${newMemberMonths} Months)`],
      notes: `New Member Registration - Valid till ${expiryDate}`,
      date: new Date().toISOString(),
    });

    setIsAddMemberModalOpen(false);
    setNewMemberName("");
    setNewMemberPhone("");
    setNewMemberEmergency("");
  };

  const handleManualCheckIn = async (member: ParsedGymMember) => {
    // Check if already checked in today
    const alreadyCheckedIn = todayVisits.some(
      (v) => v.customer_id === member.id || v.customer_phone === member.phone
    );

    if (alreadyCheckedIn) {
      alert(`⚠️ ${member.name} is already checked in for today!`);
      return;
    }

    await addVisit({
      customer_id: member.id,
      customer_name: member.name,
      customer_phone: member.phone,
      amount: 0,
      is_anonymous: false,
      items: ["Daily Workout Check-in"],
      notes: `Manual Check-in at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      date: new Date().toISOString(),
    });

    // Update customer last visit
    const { updateCustomer } = await import("@/lib/store").then((m) => ({ updateCustomer: m.AppStore.getInstance().updateCustomer.bind(m.AppStore.getInstance()) }));
    await updateCustomer({
      ...member.rawCustomer,
      total_visits: member.rawCustomer.total_visits + 1,
      last_visit_date: new Date().toISOString(),
    });
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberForRenew) return;

    setIsSubmittingRenew(true);
    const amountNum = Number(renewAmount) || 1500;

    const { calculateGymExpiryDate, serializeGymMetadata } = await import("@/lib/gymUtils");
    // If expired, renew from today. If active, extend from current expiry date.
    const baseDate = selectedMemberForRenew.daysLeft < 0
      ? new Date().toISOString().split("T")[0]
      : selectedMemberForRenew.expiryDate;

    const newExpiry = calculateGymExpiryDate(baseDate, renewMonths);

    // Add renewal payment visit
    await addVisit({
      customer_id: selectedMemberForRenew.id,
      customer_name: selectedMemberForRenew.name,
      customer_phone: selectedMemberForRenew.phone,
      amount: amountNum,
      is_anonymous: false,
      items: [`Membership Renewal: ${selectedMemberForRenew.planName} (+${renewMonths} mo)`],
      notes: `Renewed until ${newExpiry}`,
      date: new Date().toISOString(),
    });

    const { updateCustomer } = await import("@/lib/store").then((m) => ({ updateCustomer: m.AppStore.getInstance().updateCustomer.bind(m.AppStore.getInstance()) }));
    await updateCustomer({
      ...selectedMemberForRenew.rawCustomer,
      total_spend: selectedMemberForRenew.rawCustomer.total_spend + amountNum,
      last_visit_date: new Date().toISOString(),
      notes: serializeGymMetadata({
        plan_name: selectedMemberForRenew.planName,
        plan_duration_months: renewMonths,
        amount_paid: amountNum,
        start_date: selectedMemberForRenew.startDate,
        expiry_date: newExpiry,
        emergency_contact: selectedMemberForRenew.emergencyContact,
        is_frozen: false,
      }),
    });

    setIsSubmittingRenew(false);
    setIsRenewModalOpen(false);
    setSelectedMemberForRenew(null);
  };

  return (
    <div className="space-y-6">
      {/* Gym Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#111439] to-[#251749] text-white p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-bold text-[10px] tracking-wide uppercase border border-orange-500/30 flex items-center gap-1">
              <Dumbbell className="h-3 w-3" /> Gym &amp; Fitness Studio Workspace
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">{activeBusiness.name}</h1>
          <p className="text-xs text-slate-300">
            Real-time QR attendance, membership expiry alerts, and 1-click renewal reminders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAddMemberModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6C4DFF] hover:bg-[#5835FF] text-white text-xs font-bold shadow-lg shadow-purple-500/20 transition-all cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Active Members */}
        <div className="rounded-2xl border border-[#EAECF0] bg-[#FFFFFF] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">Active Members</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#111439] mt-2">{activeMembers.length}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Valid active passes</p>
        </div>

        {/* Expiring Soon (<7 days) */}
        <div className="rounded-2xl border border-[#EAECF0] bg-[#FFFFFF] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">Expiring in 7 Days</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-600 mt-2">{expiringSoonMembers.length}</p>
          <p className="text-[11px] text-[#667085] mt-0.5">Prompt for renewal</p>
        </div>

        {/* Expired Memberships */}
        <div className="rounded-2xl border border-[#EAECF0] bg-[#FFFFFF] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">Expired Passes</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-600 mt-2">{expiredMembers.length}</p>
          <p className="text-[11px] text-rose-600 font-semibold mt-0.5">Needs win-back offer</p>
        </div>
      </div>

      {/* Member Directory & Live Attendance Section */}
      <div className="rounded-3xl border border-[#EAECF0] bg-[#FFFFFF] p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAECF0] pb-4">
          <div>
            <h2 className="text-base font-bold text-[#111439]">Gym Member Roster &amp; Expiry Schedule</h2>
            <p className="text-xs text-[#667085]">
              Track workout check-ins, remaining validity, and 1-click WhatsApp renewals.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#F8F8F9] p-1 rounded-xl border border-[#EAECF0]">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterStatus === "all" ? "bg-[#FFFFFF] text-[#111439] shadow-xs" : "text-[#667085] hover:text-[#111439]"
              }`}
            >
              All ({members.length})
            </button>
            <button
              onClick={() => setFilterStatus("active")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterStatus === "active" ? "bg-emerald-500 text-white shadow-xs" : "text-emerald-600 hover:bg-emerald-50"
              }`}
            >
              Active ({activeMembers.length})
            </button>
            <button
              onClick={() => setFilterStatus("expiring_soon")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterStatus === "expiring_soon" ? "bg-amber-500 text-white shadow-xs" : "text-amber-600 hover:bg-amber-50"
              }`}
            >
              Expiring Soon ({expiringSoonMembers.length})
            </button>
            <button
              onClick={() => setFilterStatus("expired")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterStatus === "expired" ? "bg-rose-500 text-white shadow-xs" : "text-rose-600 hover:bg-rose-50"
              }`}
            >
              Expired ({expiredMembers.length})
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
            placeholder="Search member by name, phone number, or plan..."
            className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] pl-10 pr-4 py-2 text-xs text-[#111439] placeholder:text-[#94A3B8] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none transition-colors"
          />
        </div>

        {/* Members Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#111439]">
            <thead className="bg-[#F8F8F9] text-[10px] font-bold uppercase tracking-wider text-[#667085] border-y border-[#EAECF0]">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-3">Plan</th>
                <th className="py-3 px-3">Start Date</th>
                <th className="py-3 px-3">Expiry Date</th>
                <th className="py-3 px-3">Validity</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Total Workouts</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAECF0]">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#667085]">
                    No gym members matching your filter.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const whatsappRenewalMsg = `Hi ${member.name}! 💪 Reminder from ${activeBusiness.name}: Your gym membership is set to expire on ${member.expiryDate}. Renew today to keep your fitness momentum going without interruption!`;
                  const whatsappLink = buildWhatsAppLink(member.phone, whatsappRenewalMsg);

                  const checkedInToday = todayVisits.some(
                    (v) => v.customer_id === member.id || v.customer_phone === member.phone
                  );

                  return (
                    <tr key={member.id} className="hover:bg-[#F8F8F9]/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold">
                        <div className="font-bold text-[#111439]">{member.name}</div>
                        <div className="text-[11px] text-[#667085] font-mono">{member.phone}</div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 font-bold text-[11px]">
                          {member.planName}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 font-mono text-[11px] text-[#667085]">
                        {member.startDate}
                      </td>

                      <td className="py-3.5 px-3 font-mono text-[11px] font-bold text-[#111439]">
                        {member.expiryDate}
                      </td>

                      <td className="py-3.5 px-3 font-bold">
                        {member.daysLeft < 0 ? (
                          <span className="text-rose-600">{Math.abs(member.daysLeft)} days expired</span>
                        ) : member.daysLeft === 0 ? (
                          <span className="text-amber-600">Expires Today</span>
                        ) : member.daysLeft <= 7 ? (
                          <span className="text-amber-600">{member.daysLeft} days left</span>
                        ) : (
                          <span className="text-emerald-600">{member.daysLeft} days left</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        {member.status === "expired" && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-200">
                            Expired
                          </span>
                        )}
                        {member.status === "expiring_soon" && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200">
                            Expiring Soon
                          </span>
                        )}
                        {member.status === "active" && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                            Active
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 font-medium text-[#111439]">
                        <span className="font-bold">{member.totalWorkouts}</span> visits
                        {checkedInToday && (
                          <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                            Today ✓
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!checkedInToday && member.status !== "expired" && (
                            <button
                              onClick={() => handleManualCheckIn(member)}
                              className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-[11px] shadow-xs transition-colors cursor-pointer"
                              title="Check In Member Today"
                            >
                              Check-in
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setSelectedMemberForRenew(member);
                              setIsRenewModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#6C4DFF] hover:bg-[#5835FF] text-white font-bold text-[11px] shadow-xs transition-colors cursor-pointer"
                            title="Renew Membership"
                          >
                            Renew
                          </button>

                          <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              logWhatsAppSend({
                                customer_id: member.id,
                                customer_name: member.name,
                                customer_phone: member.phone,
                                template_name: "Gym Renewal Reminder",
                                message_sent: whatsappRenewalMsg,
                              });
                            }}
                            className="p-1.5 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors"
                            title="Send WhatsApp Renewal Reminder"
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

      {/* Renew Membership Modal */}
      {isRenewModalOpen && selectedMemberForRenew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111439]/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[#EAECF0] bg-[#FFFFFF] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAECF0] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#111439]">Renew Membership</h3>
                <p className="text-[11px] text-[#667085]">{selectedMemberForRenew.name} ({selectedMemberForRenew.phone})</p>
              </div>
              <button
                onClick={() => setIsRenewModalOpen(false)}
                className="rounded-full p-1.5 text-[#667085] hover:bg-[#F1F1F4]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRenewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5">
                  Extension Duration
                </label>
                <select
                  value={renewMonths}
                  onChange={(e) => {
                    const m = Number(e.target.value);
                    setRenewMonths(m);
                    setRenewAmount(String(m * 1500));
                  }}
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2.5 text-xs font-bold text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none"
                >
                  <option value={1}>1 Month Extension</option>
                  <option value={3}>3 Months (Quarterly)</option>
                  <option value={6}>6 Months (Half-Yearly)</option>
                  <option value={12}>12 Months (Annual Pass)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5">
                  Renewal Fee Received ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  required
                  value={renewAmount}
                  onChange={(e) => setRenewAmount(e.target.value)}
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2.5 text-xs font-bold text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none"
                />
              </div>

              <div className="rounded-xl bg-orange-50 border border-orange-200 p-3 text-[11px] text-orange-900">
                Extending pass for <span className="font-bold">{renewMonths} month(s)</span> from{" "}
                {selectedMemberForRenew.daysLeft < 0 ? "today" : selectedMemberForRenew.expiryDate}.
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRenewModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#EAECF0] bg-[#F8F8F9] text-xs font-bold text-[#667085]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRenew}
                  className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingRenew ? "Processing..." : "Confirm Renewal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Gym Member Modal */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111439]/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-[#EAECF0] bg-[#FFFFFF] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAECF0] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#111439]">Add Gym Member</h3>
                <p className="text-[11px] text-[#667085]">Register member name, mobile, and membership duration</p>
              </div>
              <button
                onClick={() => setIsAddMemberModalOpen(false)}
                className="rounded-full p-1.5 text-[#667085] hover:bg-[#F1F1F4]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleQuickAddMember} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5">
                    Member Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="e.g. Vikram Malhotra"
                    className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2 text-xs text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5">
                    Mobile Number (For Check-in) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newMemberPhone}
                    onChange={(e) => setNewMemberPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2 text-xs text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    value={newMemberPlan}
                    onChange={(e) => setNewMemberPlan(e.target.value)}
                    placeholder="e.g. Monthly Fitness, CrossFit"
                    className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2 text-xs text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5">
                    Duration (Months)
                  </label>
                  <select
                    value={newMemberMonths}
                    onChange={(e) => {
                      const m = Number(e.target.value);
                      setNewMemberMonths(m);
                      setNewMemberPrice(String(m * 1500));
                    }}
                    className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2 text-xs font-bold text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none"
                  >
                    <option value={1}>1 Month (Monthly)</option>
                    <option value={3}>3 Months (Quarterly)</option>
                    <option value={6}>6 Months (Half-Yearly)</option>
                    <option value={12}>12 Months (Annual)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5">
                    Amount Paid ({currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newMemberPrice}
                    onChange={(e) => setNewMemberPrice(e.target.value)}
                    className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2 text-xs font-bold text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newMemberStartDate}
                    onChange={(e) => setNewMemberStartDate(e.target.value)}
                    className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2 text-xs text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5">
                  Emergency Contact (Optional)
                </label>
                <input
                  type="text"
                  value={newMemberEmergency}
                  onChange={(e) => setNewMemberEmergency(e.target.value)}
                  placeholder="e.g. Brother: 98111 XXXXX"
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2 text-xs text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#EAECF0] bg-[#F8F8F9] text-xs font-bold text-[#667085]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Member Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
