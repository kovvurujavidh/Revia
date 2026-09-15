// Importers/Callers: Next.js App Router route /reports, Desktop sidebar and mobile navigation.
// Affected API: Reports & CSV Export page (Financial summaries, CSV download, segment breakdown).
// Data Schemas: Customer, Visit, Business, User from src/lib/types.ts.
// User's Verbatim Instruction: "WHEN THE STAF LOGIN USING GAMIL THEY CAN OLY ENTER DATA MAKE IT LIKE OWNER CAN ONLY SEE THE ANALYTICS AND REPORT"

"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import {
  BarChart2,
  Download,
  Calendar,
  CreditCard,
  Users,
  Trophy,
  Lock,
  ArrowRight,
} from "lucide-react";
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from "date-fns";

export default function ReportsPage() {
  const { customers, visits, activeBusiness, currentUser } = useApp();
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">("30d");

  // Staff Access Gate: Staff members only have access to Visit Data Entry
  if (currentUser.role === "staff") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 animate-fade-in">
        <div className="max-w-md w-full brand-card p-8 text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#6C4DFF]/10 text-[#6C4DFF]">
            <Lock className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black text-[#111439]">Staff Access Restricted</h1>
            <p className="text-xs text-[#667085] leading-relaxed">
              Financial and analytical reports are restricted to Business Owners. Staff accounts are configured for fast customer visit data entry and counter check-ins.
            </p>
          </div>

          <div className="rounded-2xl bg-[#F8F8F9] p-4 text-left border border-[#E8E8ED] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#111439]">
              <span>Current Role:</span>
              <span className="capitalize px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                {currentUser.role}
              </span>
            </div>
            <p className="text-[11px] text-[#667085]">
              Logged in as <strong>{currentUser.email}</strong>
            </p>
          </div>

          <Link
            href="/add-visit"
            className="w-full flex items-center justify-center gap-2 rounded-xl brand-gradient py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-95 transition-opacity"
          >
            <span>Go to Add Visit Entry</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: activeBusiness.currency || "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredVisits = useMemo(() => {
    if (dateRange === "all") return visits;
    const end = endOfDay(new Date());
    let start = startOfDay(new Date());
    if (dateRange === "7d") start = subDays(start, 7);
    if (dateRange === "30d") start = subDays(start, 30);
    if (dateRange === "90d") start = subDays(start, 90);
    return visits.filter((v) => isWithinInterval(new Date(v.created_at), { start, end }));
  }, [visits, dateRange]);

  const totalRevenue = filteredVisits.reduce((sum, v) => sum + v.amount, 0);
  const totalVisits = filteredVisits.length;
  const uniqueVisitorCount = new Set(filteredVisits.map((v) => v.customer_id).filter(Boolean)).size;

  const segmentStats = useMemo(() => {
    const stats: Record<string, { revenue: number; count: number }> = {
      VIP: { revenue: 0, count: 0 },
      Regular: { revenue: 0, count: 0 },
      New: { revenue: 0, count: 0 },
      "Becoming Inactive": { revenue: 0, count: 0 },
      Inactive: { revenue: 0, count: 0 },
      Anonymous: { revenue: 0, count: 0 },
    };
    filteredVisits.forEach((visit) => {
      let segment = "Anonymous";
      if (visit.customer_id) {
        const cust = customers.find((c) => c.id === visit.customer_id);
        if (cust) segment = cust.segment;
      }
      if (stats[segment]) {
        stats[segment].revenue += visit.amount;
        stats[segment].count += 1;
      }
    });
    return Object.entries(stats)
      .filter(([_, data]) => data.count > 0)
      .sort((a, b) => b[1].revenue - a[1].revenue);
  }, [filteredVisits, customers]);

  const topCustomers = useMemo(() => {
    const custSpend: Record<string, { name: string; phone: string; visits: number; spend: number }> = {};
    filteredVisits.forEach((visit) => {
      if (!visit.customer_id) return;
      const cust = customers.find((c) => c.id === visit.customer_id);
      if (!cust) return;
      if (!custSpend[cust.id]) {
        custSpend[cust.id] = { name: cust.name, phone: cust.phone, visits: 0, spend: 0 };
      }
      custSpend[cust.id].visits += 1;
      custSpend[cust.id].spend += visit.amount;
    });
    return Object.values(custSpend)
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 5);
  }, [filteredVisits, customers]);

  const downloadCSV = (type: "customers" | "visits") => {
    let csvData = "";
    let filename = "";
    if (type === "customers") {
      const headers = ["ID", "Name", "Phone", "Segment", "Total Visits", "Last Visit At", "Created At"];
      const rows = customers.map(c => [
        `"${c.id}"`, `"${c.name}"`, `"${c.phone}"`, `"${c.segment}"`, c.total_visits, `"${c.last_visit_date}"`, `"${c.created_at}"`
      ]);
      csvData = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      filename = `${activeBusiness.name}_Customers_${format(new Date(), "yyyy-MM-dd")}.csv`;
    } else {
      const headers = ["Visit ID", "Customer ID", "Customer Name", "Amount", "Notes", "Timestamp"];
      const rows = filteredVisits.map(v => {
        const custName = v.customer_id ? (customers.find(c => c.id === v.customer_id)?.name || "Unknown") : "Anonymous";
        return [`"${v.id}"`, `"${v.customer_id || ""}"`, `"${custName}"`, v.amount, `"${v.notes || ""}"`, `"${v.created_at}"`];
      });
      csvData = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      filename = `${activeBusiness.name}_Visits_${format(new Date(), "yyyy-MM-dd")}.csv`;
    }
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#111439]">Reports & Data Export</h1>
            <span className="rounded-full bg-[#3B82F6]/10 px-2.5 py-0.5 text-xs font-bold text-[#3B82F6]">
              {filteredVisits.length} Records
            </span>
          </div>
          <p className="text-xs text-[#667085] mt-1">Financial breakdown, segment contribution, and customer leaderboard.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white p-1 border border-[#E8E8ED] shadow-xs">
          {[{ label: "7 Days", val: "7d" }, { label: "30 Days", val: "30d" }, { label: "90 Days", val: "90d" }, { label: "All Time", val: "all" }].map((rng) => (
            <button key={rng.val} onClick={() => setDateRange(rng.val as any)} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${dateRange === rng.val ? "bg-[#6C4DFF] text-white" : "text-[#667085] hover:text-[#111439] hover:bg-[#F8F8F9]"}`}>{rng.label}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="brand-card p-5"><div className="flex items-center gap-2 mb-2 text-[#667085]"><CreditCard className="h-4 w-4" /><h3 className="text-xs font-bold uppercase tracking-wider">Total Revenue</h3></div><p className="text-2xl font-black text-[#111439]">{formatCurrency(totalRevenue)}</p></div>
        <div className="brand-card p-5"><div className="flex items-center gap-2 mb-2 text-[#667085]"><Calendar className="h-4 w-4" /><h3 className="text-xs font-bold uppercase tracking-wider">Total Visits</h3></div><p className="text-2xl font-black text-[#6C4DFF]">{totalVisits}</p></div>
        <div className="brand-card p-5"><div className="flex items-center gap-2 mb-2 text-[#667085]"><Users className="h-4 w-4" /><h3 className="text-xs font-bold uppercase tracking-wider">Unique Customers</h3></div><p className="text-2xl font-black text-[#16A34A]">{uniqueVisitorCount}</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="brand-card p-6">
          <div className="flex items-center gap-2 mb-6 border-b border-[#E8E8ED] pb-3"><BarChart2 className="h-5 w-5 text-[#3B82F6]" /><h2 className="text-sm font-bold text-[#111439]">Segment Revenue Breakdown</h2></div>
          <div className="space-y-4">
            {segmentStats.map(([segment, data]) => {
              const bgClass = segment === "VIP" ? "bg-[#6C4DFF]" : segment === "Regular" ? "bg-[#3B82F6]" : segment === "New" ? "bg-[#16A34A]" : segment === "Becoming Inactive" ? "bg-[#F59E0B]" : segment === "Inactive" ? "bg-[#EF4444]" : "bg-gray-400";
              const percentage = totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0;
              return (
                <div key={segment}>
                  <div className="flex items-center justify-between text-xs mb-1"><span className="font-bold text-[#111439]">{segment}</span><div className="text-right"><span className="font-bold">{formatCurrency(data.revenue)}</span><span className="text-[#667085] ml-2">({data.count} visits)</span></div></div>
                  <div className="w-full bg-[#E8E8ED] rounded-full h-2"><div className={`h-2 rounded-full ${bgClass}`} style={{ width: `${Math.max(percentage, 2)}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="brand-card p-6 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4 border-b border-[#E8E8ED] pb-3"><Trophy className="h-5 w-5 text-[#F59E0B]" /><h2 className="text-sm font-bold text-[#111439]">Top Customers Leaderboard</h2></div>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
            {topCustomers.map((cust, idx) => (
              <div key={cust.name} className="flex items-center justify-between p-3 rounded-xl border border-[#E8E8ED] bg-[#F8F8F9] hover:bg-white transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full font-black text-xs ${idx === 0 ? "bg-[#F59E0B]/20 text-[#F59E0B]" : idx === 1 ? "bg-gray-200 text-gray-500" : idx === 2 ? "bg-[#B45309]/20 text-[#B45309]" : "bg-[#E8E8ED] text-[#667085]"}`}>#{idx + 1}</div>
                  <div><p className="text-xs font-bold text-[#111439]">{cust.name}</p><p className="text-[10px] text-[#667085]">{cust.phone}</p></div>
                </div>
                <div className="text-right"><p className="text-xs font-bold text-[#16A34A]">{formatCurrency(cust.spend)}</p><p className="text-[10px] text-[#667085]">{cust.visits} visits</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="brand-card p-6">
        <h2 className="text-sm font-bold text-[#111439] mb-4">Export Full Data Records (.CSV)</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => downloadCSV("customers")} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#E8E8ED] bg-white py-3 text-xs font-bold text-[#111439] hover:bg-gray-50 transition-colors shadow-2xs">
            <Download className="h-4 w-4 text-[#6C4DFF]" /><span>Download All Customers CSV</span>
          </button>
          <button onClick={() => downloadCSV("visits")} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#E8E8ED] bg-white py-3 text-xs font-bold text-[#111439] hover:bg-gray-50 transition-colors shadow-2xs">
            <Download className="h-4 w-4 text-[#3B82F6]" /><span>Download {dateRange !== "all" ? "Filtered" : "All"} Visits CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
}
