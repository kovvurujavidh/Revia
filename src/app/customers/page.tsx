// Importers/Callers: Next.js App Router route /customers, AppSidebar, MobileNav, AppHeader
// Affected API: CustomersPage React page component (Specialized Salon Customer Table/Cards, Segment Filters, Lightweight Profile Modal with Visit History)
// Data Schemas: Customer, Visit, Business from src/lib/types.ts
// User's Verbatim Instruction: "c:\AI\Revia_Salon_Final_Update_Claude_Code_Prompt.docx  Cheque the whole file and Make a todo list of the updates and Please update What are I mentioned in this document And after completing one by one Up update the  To do list"

"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import {
  Search,
  ChevronRight,
  User,
  Users,
  Sparkles,
  Scissors,
  Phone,
  Calendar,
  CreditCard,
  History,
  X,
  MessageCircle,
  Clock,
  Tag,
  Eye,
  PlusCircle,
  RefreshCw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { buildWhatsAppLink } from "@/lib/intelligence";
import Link from "next/link";
import { Customer } from "@/lib/types";

export default function CustomersPage() {
  const { customers, visits, activeBusiness, logWhatsAppSend } = useApp();
  const isSalon = activeBusiness?.industry === "salon_spa";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSegment, setSelectedSegment] = useState<string>("All");
  const [selectedCustomerForModal, setSelectedCustomerForModal] = useState<Customer | null>(null);

  const segments = isSalon
    ? ["All", "Regular", "New", "Inactive"]
    : ["All", "VIP", "Regular", "New", "Becoming Inactive", "Inactive"];

  const segmentMap: Record<string, string> = {
    "All": "All",
    "VIP": "vip",
    "Regular": "regular",
    "New": "new",
    "Becoming Inactive": "becoming_inactive",
    "Inactive": "inactive",
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm);
      const targetSegmentValue = segmentMap[selectedSegment];
      let matchesSegment = true;
      if (selectedSegment !== "All") {
        if (selectedSegment === "Regular") {
          matchesSegment = c.segment === "regular" || c.segment === "vip" || c.total_visits > 1;
        } else if (selectedSegment === "New") {
          matchesSegment = c.segment === "new" || c.total_visits <= 1;
        } else if (selectedSegment === "Inactive") {
          matchesSegment = c.segment === "inactive" || c.segment === "becoming_inactive";
        } else {
          matchesSegment = c.segment === targetSegmentValue;
        }
      }
      return matchesSearch && matchesSegment;
    });
  }, [customers, searchTerm, selectedSegment]);

  const getSegmentBadge = (segment: string) => {
    switch (segment?.toLowerCase()) {
      case "vip":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "regular":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "new":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "becoming_inactive":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "inactive":
        return "bg-rose-100 text-rose-800 border border-rose-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  // Helper to retrieve customer's visits
  const getCustomerVisits = (cust: Customer) => {
    return visits
      .filter((v) => v.customer_id === cust.id || (v.customer_phone && v.customer_phone === cust.phone))
      .sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime());
  };

  const currencySymbol = activeBusiness?.currency_symbol || "₹";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Customer Profile Modal */}
      {selectedCustomerForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111439]/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-xl rounded-3xl border border-[#EDE9FE] bg-white p-6 sm:p-8 shadow-2xl space-y-6 text-[#1E1B4B] max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#F5F3FF] pb-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9333EA] to-[#7E22CE] text-white font-black text-lg shadow-md shadow-purple-500/20">
                  {selectedCustomerForModal.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-[#1E1B4B]">
                      {selectedCustomerForModal.name}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${getSegmentBadge(selectedCustomerForModal.segment)}`}>
                      {selectedCustomerForModal.segment}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] font-medium flex items-center gap-1.5 mt-0.5">
                    <Phone className="h-3 w-3 text-[#9333EA]" />
                    <span>{selectedCustomerForModal.phone}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomerForModal(null)}
                className="rounded-full p-2 text-[#6B7280] hover:bg-[#F3E8FF] hover:text-[#1E1B4B] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-3">
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Total Visits</span>
                <p className="text-lg font-black text-[#1E1B4B] mt-1 tabular-nums">
                  {selectedCustomerForModal.total_visits}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3">
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Total Spend</span>
                <p className="text-lg font-black text-[#1E1B4B] mt-1 tabular-nums">
                  {currencySymbol}{(selectedCustomerForModal.total_spend || 0).toLocaleString()}
                </p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-3">
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">First Visit</span>
                <p className="text-xs font-bold text-[#1E1B4B] mt-1.5">
                  {selectedCustomerForModal.first_visit_date
                    ? new Date(selectedCustomerForModal.first_visit_date).toLocaleDateString()
                    : "Initial visit"}
                </p>
              </div>

              <div className="rounded-2xl border border-pink-100 bg-pink-50/50 p-3">
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Last Seen</span>
                <p className="text-xs font-bold text-[#1E1B4B] mt-1.5">
                  {selectedCustomerForModal.last_visit_date
                    ? new Date(selectedCustomerForModal.last_visit_date).toLocaleDateString()
                    : "Today"}
                </p>
              </div>
            </div>

            {/* Visit History Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <History className="h-4 w-4 text-[#9333EA]" />
                <h4 className="text-xs font-bold text-[#1E1B4B] uppercase tracking-wider">
                  Complete Visit History
                </h4>
              </div>

              {getCustomerVisits(selectedCustomerForModal).length === 0 ? (
                <div className="p-6 text-center text-xs text-[#6B7280] bg-[#FAF5FF] rounded-2xl border border-purple-100">
                  <p>1 registration recorded on {new Date(selectedCustomerForModal.created_at).toLocaleDateString()}.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {getCustomerVisits(selectedCustomerForModal).map((v) => (
                    <div
                      key={v.id}
                      className="p-3 rounded-xl border border-purple-100 bg-purple-50/30 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <p className="font-bold text-[#1E1B4B]">
                          {v.items && v.items.length > 0 ? v.items.join(", ") : "Salon Service"}
                        </p>
                        <p className="text-[11px] text-[#6B7280] flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(v.created_at || v.date).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</span>
                        </p>
                        {v.notes && <p className="text-[10px] text-[#9333EA] italic">Note: {v.notes}</p>}
                      </div>
                      <span className="font-black text-[#1E1B4B] tabular-nums text-sm">
                        {currencySymbol}{v.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <a
                href={buildWhatsAppLink(
                  selectedCustomerForModal.phone,
                  `Hi ${selectedCustomerForModal.name}! Greetings from *${activeBusiness?.name}*. We look forward to seeing you for your next salon session! ✨`
                )}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  logWhatsAppSend({
                    business_id: activeBusiness.id,
                    customer_id: selectedCustomerForModal.id,
                    phone: selectedCustomerForModal.phone,
                    customer_name: selectedCustomerForModal.name,
                    template_name: "custom_chat",
                    message_sent: "Direct customer WhatsApp message",
                  });
                }}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:brightness-105 transition-all btn-interactive"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Message on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => setSelectedCustomerForModal(null)}
                className="rounded-2xl border border-[#EDE9FE] bg-white px-5 py-3 text-xs font-bold text-[#6B7280] hover:bg-[#FAF5FF] hover:text-[#1E1B4B] transition-colors cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[#111439] tracking-tight">
              {isSalon ? "Salon Client Directory" : "Customer Directory"}
            </h1>
            <span className="rounded-full bg-purple-100 text-purple-700 border border-purple-200 px-2.5 py-0.5 text-xs font-bold tabular-nums">
              {filteredCustomers.length} total {isSalon ? "clients" : "customers"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#667085] mt-1 font-medium">
            {isSalon
              ? "View client visit frequency, recent services, lifetime spend, and customer profiles."
              : "Manage your customer database and analyze retention segments."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 rounded-xl border border-[#EAECF0] bg-[#FFFFFF] px-3.5 py-2.5 text-xs font-bold text-[#667085] hover:bg-[#F8F8F9] hover:border-[#D0D5DD] hover:text-[#111439] transition-all shadow-xs btn-interactive"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <Link
            href="/add-visit"
            className="flex items-center gap-1.5 rounded-xl brand-gradient px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-500/25 hover:shadow-purple-500/40 hover:opacity-95 transition-all btn-interactive"
          >
            <PlusCircle className="h-4 w-4" />
            <span>{isSalon ? "Record Client Visit" : "Add Customer Visit"}</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between brand-card p-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder={isSalon ? "Search client by name or phone..." : "Search by name or phone..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#111439] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6C4DFF] focus:bg-[#FFFFFF] transition-colors"
          />
        </div>

        {/* Segment Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {segments.map((seg) => (
            <button
              key={seg}
              onClick={() => setSelectedSegment(seg)}
              className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all btn-interactive cursor-pointer ${
                selectedSegment === seg
                  ? "brand-gradient text-white shadow-md shadow-purple-500/20"
                  : "bg-[#F8F8F9] text-[#667085] border border-[#EAECF0] hover:bg-[#F1F1F4] hover:text-[#111439]"
              }`}
            >
              {seg}
            </button>
          ))}
        </div>
      </div>

      {/* Customer List Table */}
      <div className="brand-card overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-[#F8F8F9] border border-[#EAECF0] flex items-center justify-center mx-auto text-[#94A3B8]">
              <Users className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-[#111439]">No clients found</p>
            <p className="text-xs text-[#667085]">
              Try adjusting your search query or selecting another filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F8F9] border-b border-[#EAECF0] text-[#667085] font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Client Name &amp; Phone</th>
                  {isSalon && <th className="px-6 py-4">Service Taken</th>}
                  <th className="px-6 py-4">Client Type</th>
                  <th className="px-6 py-4">Total Visits</th>
                  <th className="px-6 py-4">Last Visit</th>
                  <th className="px-6 py-4">Total Spent</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAECF0]">
                {filteredCustomers.map((cust) => {
                  const custVisits = getCustomerVisits(cust);
                  const lastVisit = custVisits[0];
                  const lastService =
                    lastVisit?.items && lastVisit.items.length > 0
                      ? lastVisit.items[0]
                      : cust.favorite_items && cust.favorite_items.length > 0
                      ? cust.favorite_items[0]
                      : "Salon Service";

                  const totalSpent = custVisits.reduce((sum, v) => sum + v.amount, 0) || cust.total_spend || 0;

                  return (
                    <tr
                      key={cust.id}
                      onClick={() => setSelectedCustomerForModal(cust)}
                      className="hover:bg-[#FAF5FF]/70 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4 font-semibold text-[#111439]">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#9333EA] font-bold text-xs group-hover:bg-[#9333EA] group-hover:text-white transition-colors">
                            {cust.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#111439]">{cust.name}</p>
                            <p className="text-[10px] text-[#667085] tabular-nums">{cust.phone}</p>
                          </div>
                        </div>
                      </td>

                      {/* Salon Service Column */}
                      {isSalon && (
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-[#FAF5FF] border border-purple-100 px-2.5 py-1 text-[11px] font-medium text-[#7E22CE]">
                            <Scissors className="h-3 w-3 opacity-70" />
                            {lastService}
                          </span>
                        </td>
                      )}

                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getSegmentBadge(cust.segment)}`}>
                          {cust.segment}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-[#111439] tabular-nums font-semibold">
                        {cust.total_visits} {cust.total_visits === 1 ? "visit" : "visits"}
                      </td>

                      <td className="px-6 py-4 text-[#667085] tabular-nums">
                        {cust.last_visit_date ? (
                          `${formatDistanceToNow(new Date(cust.last_visit_date))} ago`
                        ) : (
                          "Recent"
                        )}
                      </td>

                      <td className="px-6 py-4 font-bold text-[#111439] tabular-nums">
                        {currencySymbol}{totalSpent.toLocaleString()}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomerForModal(cust);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-purple-200 bg-purple-50/60 text-[#9333EA] hover:bg-[#9333EA] hover:text-white transition-all text-xs font-bold btn-interactive cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Profile</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
