// Importers/Callers: Next.js App Router route `/reports`, AppSidebar, MobileNav
// Affected API: Reports & CSV Export page (Financial summaries, CSV download, segment breakdown)
// Data Schemas: Customer, Visit, Business, User from src/lib/types.ts
// User's Verbatim Instruction: "https://emilkowal.ski/skill https://github.com/emilkowalski/skills https://www.ui-skills.com/skills INSTALL AND AUTOMATICALLY USE THIS SKILLS AND REDESIGH MY WEBSITE CONCEPT IS SAME CODE IS SAME JUST DESINE AND LOOK IF YOU HAVE PROBLEM MAKE A V1 VERSION AND SAVE ALL OLD VERSION AND USE THE NEW VERSION TO TEST"

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
  TrendingUp,
} from "lucide-react";
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from "date-fns";

export default function ReportsPage() {
  const { customers, visits, activeBusiness, currentUser } = useApp();
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">("30d");

  // Staff Access Gate: Staff members only have access to Visit Data Entry
  if (currentUser?.role === "staff") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 animate-fade-in">
        <div className="max-w-md w-full brand-card p-8 text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
            <Lock className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black text-white tracking-tight">Staff Access Restricted</h1>
            <p className="text-xs text-[#71717a] leading-relaxed">
              Financial and analytical reports are restricted to Business Owners. Staff accounts are configured for fast customer visit data entry and counter check-ins.
            </p>
          </div>

          <div className="rounded-xl bg-white/[0.03] p-4 text-left border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span>Current Role:</span>
              <span className="capitalize px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[10px] font-bold">
                {currentUser.role}
              </span>
            </div>
            <p className="text-[11px] text-[#71717a]">
              Logged in as <strong className="text-white">{currentUser.email}</strong>
            </p>
          </div>

          <Link
            href="/add-visit"
            className="w-full flex items-center justify-center gap-2 rounded-xl brand-gradient py-3 text-xs font-bold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:opacity-95 transition-all btn-interactive"
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Reports &amp; Data Export</h1>
            <span className="rounded-full bg-blue-500/15 border border-blue-500/30 px-2.5 py-0.5 text-xs font-bold text-blue-400 tabular-nums">
              {filteredVisits.length} Records
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#71717a] mt-1">Financial breakdown, segment contribution, and customer leaderboard.</p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-1.5 rounded-xl bg-white/[0.03] p-1 border border-white/[0.08]">
          {[
            { label: "7 Days", val: "7d" },
            { label: "30 Days", val: "30d" },
            { label: "90 Days", val: "90d" },
            { label: "All Time", val: "all" },
          ].map((rng) => (
            <button
              key={rng.val}
              onClick={() => setDateRange(rng.val as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all btn-interactive ${
                dateRange === rng.val
                  ? "bg-purple-500 text-white shadow-md shadow-purple-500/25"
                  : "text-[#a1a1aa] hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {rng.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="brand-card p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-2 text-[#71717a]">
            <CreditCard className="h-4 w-4 text-purple-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa]">Total Revenue</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">{formatCurrency(totalRevenue)}</p>
        </div>

        <div className="brand-card p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-2 text-[#71717a]">
            <Calendar className="h-4 w-4 text-purple-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa]">Total Visits</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-400 tabular-nums">{totalVisits}</p>
        </div>

        <div className="brand-card p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-2 text-[#71717a]">
            <Users className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa]">Unique Customers</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 tabular-nums">{uniqueVisitorCount}</p>
        </div>
      </div>

      {/* Segment Breakdown & Top Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Segment Revenue Breakdown */}
        <div className="brand-card p-6">
          <div className="flex items-center gap-2 mb-6 border-b border-white/[0.08] pb-3">
            <BarChart2 className="h-4 w-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">Segment Revenue Breakdown</h2>
          </div>
          <div className="space-y-4">
            {segmentStats.map(([segment, data]) => {
              const bgClass =
                segment === "VIP"
                  ? "bg-purple-500"
                  : segment === "Regular"
                  ? "bg-blue-500"
                  : segment === "New"
                  ? "bg-emerald-500"
                  : segment === "Becoming Inactive"
                  ? "bg-amber-500"
                  : segment === "Inactive"
                  ? "bg-red-500"
                  : "bg-zinc-600";
              const percentage = totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0;
              return (
                <div key={segment} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{segment}</span>
                    <div className="text-right">
                      <span className="font-bold text-white tabular-nums">{formatCurrency(data.revenue)}</span>
                      <span className="text-[#71717a] ml-2 tabular-nums">({data.count} visits)</span>
                    </div>
                  </div>
                  <div className="w-full bg-white/[0.05] rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${bgClass} transition-all duration-500`}
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Customers Leaderboard */}
        <div className="brand-card p-6 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4 border-b border-white/[0.08] pb-3">
            <Trophy className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">Top Customers Leaderboard</h2>
          </div>
          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
            {topCustomers.map((cust, idx) => (
              <div
                key={cust.name}
                className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl font-black text-xs ${
                      idx === 0
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : idx === 1
                        ? "bg-zinc-300/20 text-zinc-300 border border-zinc-300/30"
                        : idx === 2
                        ? "bg-amber-700/20 text-amber-500 border border-amber-700/30"
                        : "bg-white/[0.05] text-[#71717a] border border-white/[0.08]"
                    }`}
                  >
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{cust.name}</p>
                    <p className="text-[10px] text-[#71717a] tabular-nums">{cust.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-400 tabular-nums">{formatCurrency(cust.spend)}</p>
                  <p className="text-[10px] text-[#71717a] tabular-nums">{cust.visits} visits</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSV Export Bar */}
      <div className="brand-card p-6 sm:p-7">
        <h2 className="text-sm font-bold text-white mb-1">Export Full Data Records (.CSV)</h2>
        <p className="text-xs text-[#71717a] mb-4">Download complete raw transaction and customer spreadsheets for external accounting.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => downloadCSV("customers")}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 text-xs font-bold text-white hover:bg-white/[0.08] transition-colors btn-interactive"
          >
            <Download className="h-4 w-4 text-purple-400" />
            <span>Download All Customers CSV</span>
          </button>
          <button
            onClick={() => downloadCSV("visits")}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 text-xs font-bold text-white hover:bg-white/[0.08] transition-colors btn-interactive"
          >
            <Download className="h-4 w-4 text-blue-400" />
            <span>Download {dateRange !== "all" ? "Filtered" : "All"} Visits CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
}
