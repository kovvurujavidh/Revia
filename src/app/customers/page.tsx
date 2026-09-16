// Importers/Callers: Next.js App Router route /customers, AppSidebar, MobileNav, AppHeader
// Affected API: CustomersPage React page component
// Data Schemas: Customer, Visit from src/lib/types.ts
// User's Verbatim Instruction: "AFTER LOGIN THE LEFT SIDE BAR IS GOOD NOT FIT FOR MOBILE OK SEE THE WHOLE DOT CHANGECONCEPTOR CODE PLESE CHECH MOBILE FRENDLY AND THE COLORS WE CHOOSE NOW AND REQUIREMETS DOC IS DIFFERENT KEEP ANIMATIONS ONLY CHANGE COLORS TO MACTH PRODUCTION LEVEL WEBSITE"

"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import {
  Search,
  ChevronRight,
  User,
  Users,
  Sparkles,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function CustomersPage() {
  const { customers, visits, activeBusiness } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSegment, setSelectedSegment] = useState<string>("All");

  const segmentMap: Record<string, string> = {
    "All": "All",
    "VIP": "vip",
    "Regular": "regular",
    "New": "new",
    "Becoming Inactive": "becoming_inactive",
    "Inactive": "inactive",
  };

  const segments = ["All", "VIP", "Regular", "New", "Becoming Inactive", "Inactive"];

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm);
      const targetSegmentValue = segmentMap[selectedSegment];
      const matchesSegment =
        selectedSegment === "All" || c.segment === targetSegmentValue;
      return matchesSearch && matchesSegment;
    });
  }, [customers, searchTerm, selectedSegment]);

  const getSegmentBadge = (segment: string) => {
    switch (segment?.toLowerCase()) {
      case "vip":
        return "bg-[#6C4DFF]/10 text-[#6C4DFF] border border-[#6C4DFF]/20";
      case "regular":
        return "bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20";
      case "new":
        return "bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20";
      case "becoming_inactive":
        return "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20";
      case "inactive":
        return "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20";
      default:
        return "bg-[#F8F8F9] text-[#667085] border border-[#EAECF0]";
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[#111439] tracking-tight">Customer Directory</h1>
            <span className="rounded-full bg-[#6C4DFF]/10 border border-[#6C4DFF]/20 px-2.5 py-0.5 text-xs font-bold text-[#6C4DFF] tabular-nums">
              {filteredCustomers.length} total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#667085] mt-1 font-medium">
            Manage your customer database and analyze retention segments.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between brand-card p-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#111439] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6C4DFF] focus:bg-[#FFFFFF] transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {segments.map((seg) => (
            <button
              key={seg}
              onClick={() => setSelectedSegment(seg)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all btn-interactive ${
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
            <p className="text-sm font-bold text-[#111439]">No customers found</p>
            <p className="text-xs text-[#667085]">
              Try adjusting your search query or selecting another segment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F8F9] border-b border-[#EAECF0] text-[#667085] font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Segment</th>
                  <th className="px-6 py-4">Total Visits</th>
                  <th className="px-6 py-4">Last Visit</th>
                  <th className="px-6 py-4">Lifetime Value</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAECF0]">
                {filteredCustomers.map((cust) => {
                  const custVisits = visits.filter(v => v.customer_id === cust.id);
                  const totalSpent = custVisits.reduce((sum, v) => sum + v.amount, 0);
                  return (
                    <tr key={cust.id} className="hover:bg-[#F8F8F9] transition-colors group">
                      <td className="px-6 py-4 font-semibold text-[#111439]">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-xl bg-[#F8F8F9] border border-[#EAECF0] flex items-center justify-center text-[#667085] group-hover:text-[#6C4DFF] group-hover:border-[#6C4DFF]/30 transition-colors">
                            <User className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#111439]">{cust.name}</p>
                            <p className="text-[10px] text-[#667085] tabular-nums">{cust.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getSegmentBadge(cust.segment)}`}>
                          {cust.segment}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#111439] tabular-nums font-semibold">{cust.total_visits}</td>
                      <td className="px-6 py-4 text-[#667085] tabular-nums">
                        {formatDistanceToNow(new Date(cust.last_visit_date))} ago
                      </td>
                      <td className="px-6 py-4 font-bold text-[#111439] tabular-nums">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: activeBusiness.currency || "INR",
                          maximumFractionDigits: 0,
                        }).format(totalSpent)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 rounded-lg text-[#667085] hover:text-[#111439] hover:bg-[#F1F1F4] transition-colors btn-interactive">
                          <ChevronRight className="h-4 w-4" />
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
