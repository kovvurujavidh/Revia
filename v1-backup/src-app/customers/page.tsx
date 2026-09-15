// Importers/Callers: Next.js route `/customers`
// Affected API: CustomersPage React component
// Data Schemas: Customer { id, name, phone, segment: "new" | "regular" | "vip" | "becoming_inactive" | "inactive", total_visits, last_visit_date, ... }, Visit
// User's Verbatim Instruction: "Customer Directory In this directory when I click VIP or any other Category it not showing related category Template LibraryOnly show the life in libraries according to their company or a business Show discounts and EverythingIn settings there is a staff and permissions what is that and When I click in on Google login when I click on it I have access to the super admin So I is that only for me or is that available for any user if it is available for any user it is a loss for me right It needs to be only for Me and Build the Analytics tab for our Customer Return SaaS exactly in the style and information hierarchy of the provided analytics reference."

"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import {
  Search,
  ChevronRight,
  User,
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

  const getSegmentColor = (segment: string) => {
    switch (segment.toLowerCase()) {
      case "vip": return "bg-[#6C4DFF]/10 text-[#6C4DFF]";
      case "regular": return "bg-[#3B82F6]/10 text-[#3B82F6]";
      case "new": return "bg-[#16A34A]/10 text-[#16A34A]";
      case "becoming_inactive": return "bg-[#F59E0B]/10 text-[#F59E0B]";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#111439]">Customer Directory</h1>
          <p className="text-xs text-[#667085] mt-1">
            Manage your customer database and analyze retention segments.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-[#E8E8ED]">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-[#E8E8ED] bg-[#F8F8F9] pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#6C4DFF]"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto custom-scrollbar pb-2 sm:pb-0">
          {segments.map((seg) => (
            <button
              key={seg}
              onClick={() => setSelectedSegment(seg)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                selectedSegment === seg
                  ? "bg-[#111439] text-white"
                  : "bg-white text-[#667085] border border-[#E8E8ED] hover:bg-gray-50"
              }`}
            >
              {seg}
            </button>
          ))}
        </div>
      </div>

      {/* Customer List Table */}
      <div className="bg-white rounded-2xl border border-[#E8E8ED] overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8F8F9] text-[#667085] font-bold uppercase text-[10px]">
            <tr>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Segment</th>
              <th className="px-6 py-4">Total Visits</th>
              <th className="px-6 py-4">Last Visit</th>
              <th className="px-6 py-4">Lifetime Value</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E8ED]">
            {filteredCustomers.map((cust) => {
              const custVisits = visits.filter(v => v.customer_id === cust.id);
              const totalSpent = custVisits.reduce((sum, v) => sum + v.amount, 0);
              return (
                <tr key={cust.id} className="hover:bg-[#F8F8F9]/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-[#111439]">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#E8E8ED] flex items-center justify-center text-[#667085]">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p>{cust.name}</p>
                        <p className="text-[10px] text-[#667085]">{cust.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full font-bold ${getSegmentColor(cust.segment)}`}>
                      {cust.segment}
                    </span>
                  </td>
                  <td className="px-6 py-4">{cust.total_visits}</td>
                  <td className="px-6 py-4 text-[#667085]">
                     {formatDistanceToNow(new Date(cust.last_visit_date))} ago
                  </td>
                  <td className="px-6 py-4 font-bold text-[#111439]">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: activeBusiness.currency || "INR",
                      maximumFractionDigits: 0,
                    }).format(totalSpent)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <ChevronRight className="h-4 w-4 text-[#667085]" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
