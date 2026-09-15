// Importers/Callers: Next.js route `/customers`
// Affected API: CustomersPage React component
// Data Schemas: Customer { id, name, phone, segment: "new" | "regular" | "vip" | "becoming_inactive" | "inactive", total_visits, last_visit_date, ... }, Visit
// User's Verbatim Instruction: "https://emilkowal.ski/skill https://github.com/emilkowalski/skills https://www.ui-skills.com/skills INSTALL AND AUTOMATICALLY USE THIS SKILLS AND REDESIGH MY WEBSITE CONCEPT IS SAME CODE IS SAME JUST DESINE AND LOOK IF YOU HAVE PROBLEM MAKE A V1 VERSION AND SAVE ALL OLD VERSION AND USE THE NEW VERSION TO TEST"

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
        return "bg-purple-500/15 text-purple-400 border border-purple-500/30";
      case "regular":
        return "bg-blue-500/15 text-blue-400 border border-blue-500/30";
      case "new":
        return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
      case "becoming_inactive":
        return "bg-amber-500/15 text-amber-400 border border-amber-500/30";
      case "inactive":
        return "bg-red-500/15 text-red-400 border border-red-500/30";
      default:
        return "bg-white/[0.05] text-[#a1a1aa] border border-white/[0.08]";
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Customer Directory</h1>
            <span className="rounded-full bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 text-xs font-bold text-purple-400 tabular-nums">
              {filteredCustomers.length} total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#71717a] mt-1">
            Manage your customer database and analyze retention segments.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between brand-card p-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52525b]" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-[#52525b] focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.06] transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {segments.map((seg) => (
            <button
              key={seg}
              onClick={() => setSelectedSegment(seg)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all btn-interactive ${
                selectedSegment === seg
                  ? "bg-purple-500 text-white shadow-md shadow-purple-500/25"
                  : "bg-white/[0.03] text-[#a1a1aa] border border-white/[0.08] hover:bg-white/[0.06] hover:text-white"
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
            <div className="h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto text-[#52525b]">
              <Users className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-white">No customers found</p>
            <p className="text-xs text-[#71717a]">
              Try adjusting your search query or selecting another segment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] border-b border-white/[0.08] text-[#71717a] font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Segment</th>
                  <th className="px-6 py-4">Total Visits</th>
                  <th className="px-6 py-4">Last Visit</th>
                  <th className="px-6 py-4">Lifetime Value</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredCustomers.map((cust) => {
                  const custVisits = visits.filter(v => v.customer_id === cust.id);
                  const totalSpent = custVisits.reduce((sum, v) => sum + v.amount, 0);
                  return (
                    <tr key={cust.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 font-semibold text-white">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[#a1a1aa] group-hover:text-purple-400 group-hover:border-purple-500/30 transition-colors">
                            <User className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{cust.name}</p>
                            <p className="text-[10px] text-[#71717a] tabular-nums">{cust.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getSegmentBadge(cust.segment)}`}>
                          {cust.segment}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white tabular-nums font-semibold">{cust.total_visits}</td>
                      <td className="px-6 py-4 text-[#71717a] tabular-nums">
                        {formatDistanceToNow(new Date(cust.last_visit_date))} ago
                      </td>
                      <td className="px-6 py-4 font-bold text-white tabular-nums">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: activeBusiness.currency || "INR",
                          maximumFractionDigits: 0,
                        }).format(totalSpent)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 rounded-lg text-[#71717a] hover:text-white hover:bg-white/[0.06] transition-colors btn-interactive">
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
