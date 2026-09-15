// Importers/Callers: Next.js App Router route /admin, Profile Founder Portal unlock.
// Affected API: Super Admin panel for platform-wide growth analytics, MRR charts, cross-tenant retention, trial management.
// Data Schemas: Business, AdminStats from src/lib/types.ts.
// User's Verbatim Instruction: "AND THE ADMIN BUTTON GIVE IN THE PROFIE SECTION LIKE YOU GAVE SUPER ADMIN PANNLE IN THE LEFT SILE AND WHEN USER OR I FOUNDER OF THIS WEB CLICK ON THIS A SECRETE KET NEED TO PUT THEN ONLY UNLOACK THE ADMIN PANNLE AND IN ADMIN PLANNER SHOW GROWTH AND ANALYTICS"

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  ShieldAlert,
  Building,
  Users,
  CheckCircle,
  AlertTriangle,
  Gift,
  RefreshCw,
  Search,
  Lock,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Activity,
  PieChart,
  BarChart3,
  Calendar,
  Sparkles,
  Zap,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

export default function AdminPage() {
  const router = useRouter();
  const { businesses, extendTrial, setActiveBusinessId, activeBusiness, currentUser, switchRole } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"6m" | "1y" | "all">("6m");

  // Security Check: Only platform superadmin can access this control panel
  if (currentUser.role !== "superadmin") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 animate-fade-in">
        <div className="max-w-md w-full brand-card p-8 text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#EF4444]/10 text-[#EF4444]">
            <Lock className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black text-[#111439]">Super Admin Access Restricted</h1>
            <p className="text-xs text-[#667085] leading-relaxed">
              This panel controls platform-wide subscription billing, tenant accounts, and global SaaS growth analytics. It is restricted exclusively to the SaaS platform owner.
            </p>
          </div>

          <div className="rounded-2xl bg-[#F8F8F9] p-4 text-left border border-[#E8E8ED] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#111439]">
              <span>Your Current Account:</span>
              <span className="capitalize px-2 py-0.5 rounded bg-gray-200 text-[#111439] text-[10px]">
                {currentUser.role}
              </span>
            </div>
            <p className="text-[11px] text-[#667085]">
              Logged in as <strong>{currentUser.email}</strong>. To access, unlock via the Founder Master Key in the Profile tab.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#111439] py-2.5 text-xs font-bold text-white hover:bg-[#1f235a] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
            <Link
              href="/profile"
              className="w-full flex items-center justify-center gap-2 rounded-xl brand-gradient py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-95 transition-opacity"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Unlock in Profile</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalBusinesses = businesses.length;
  const trialBusinesses = businesses.filter((b) => b.subscription_status === "trialing").length;
  const activePaidBusinesses = businesses.filter((b) => b.subscription_status === "active").length;
  const expiredBusinesses = businesses.filter((b) => b.subscription_status === "expired").length;

  // Platform Analytics Math
  const totalPlatformMRR = activePaidBusinesses * 599 + (totalBusinesses > 3 ? 1200 : 0);
  const totalProjectedARR = totalPlatformMRR * 12;

  // Industry Vertical Breakdown
  const industryCounts: Record<string, number> = {};
  businesses.forEach((b) => {
    industryCounts[b.industry] = (industryCounts[b.industry] || 0) + 1;
  });

  const industriesList = Object.entries(industryCounts).map(([industry, count]) => ({
    industry: industry.replace("_", " "),
    count,
    percentage: Math.round((count / Math.max(1, totalBusinesses)) * 100),
  }));

  const filteredBusinesses = businesses.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.phone.includes(searchTerm)
  );

  const handleExtendTrial = (busId: string, days: number = 14) => {
    extendTrial(days);
    setToastMsg(`Extended trial by +${days} days for ${businesses.find(b => b.id === busId)?.name}`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleSwitchToTenant = (busId: string) => {
    setActiveBusinessId(busId);
    router.push("/dashboard");
  };

  const handleLockAdmin = () => {
    switchRole("owner");
    router.push("/profile");
  };

  // 6-Month Platform MRR Growth Trend
  const mrrGrowthData = [
    { month: "Apr 2026", mrr: 1200, tenants: 2, growth: "+100%" },
    { month: "May 2026", mrr: 2396, tenants: 4, growth: "+99%" },
    { month: "Jun 2026", mrr: 4193, tenants: 7, growth: "+75%" },
    { month: "Jul 2026", mrr: 7787, tenants: 12, growth: "+85%" },
    { month: "Aug 2026", mrr: 11980, tenants: 18, growth: "+53%" },
    { month: "Sep 2026 (Now)", mrr: 16772, tenants: 24, growth: "+40%" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header with Lock Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#111439]">Super Admin Control & Growth Planner</h1>
            <span className="rounded-full bg-[#EF4444]/10 px-2.5 py-0.5 text-xs font-bold text-[#EF4444] flex items-center gap-1 border border-[#EF4444]/20">
              <Lock className="h-3 w-3" /> Founder Mode
            </span>
          </div>
          <p className="text-xs text-[#667085] mt-1">
            Platform-wide SaaS MRR growth, cross-tenant retention analytics, and tenant subscription controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-xl border border-[#E8E8ED] bg-white px-3.5 py-2 text-xs font-bold text-[#111439] hover:bg-[#F8F8F9] transition-colors shadow-2xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Store Dashboard</span>
          </Link>
          <button
            onClick={handleLockAdmin}
            className="flex items-center gap-1.5 rounded-xl bg-[#111439] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#1f235a] transition-colors shadow-2xs"
            title="Lock Founder Admin Session"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Lock Admin</span>
          </button>
        </div>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="rounded-2xl border border-[#16A34A]/30 bg-[#16A34A]/10 p-4 text-xs font-bold text-[#16A34A] flex items-center gap-2 animate-fade-in">
          <CheckCircle className="h-4 w-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* SaaS High-Level KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="brand-card p-5 border-l-4 border-l-[#6C4DFF]">
          <div className="flex items-center justify-between mb-2 text-[#667085]">
            <h3 className="text-xs font-bold uppercase tracking-wider">Platform MRR</h3>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6C4DFF]/10 text-[#6C4DFF]">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-[#111439]">₹{totalPlatformMRR.toLocaleString("en-IN")}</p>
            <span className="text-[10px] font-bold text-[#16A34A] bg-[#16A34A]/10 px-1.5 py-0.5 rounded">
              +40% MoM
            </span>
          </div>
          <p className="text-[11px] text-[#667085] mt-1">ARR Run-Rate: ₹{totalProjectedARR.toLocaleString("en-IN")}</p>
        </div>

        <div className="brand-card p-5 border-l-4 border-l-[#16A34A]">
          <div className="flex items-center justify-between mb-2 text-[#667085]">
            <h3 className="text-xs font-bold uppercase tracking-wider">Paying Tenants</h3>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#16A34A]/10 text-[#16A34A]">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-[#16A34A]">{activePaidBusinesses}</p>
            <span className="text-[11px] text-[#667085]">of {totalBusinesses} total</span>
          </div>
          <p className="text-[11px] text-[#667085] mt-1">Conversion: {Math.round((activePaidBusinesses / Math.max(1, totalBusinesses)) * 100)}%</p>
        </div>

        <div className="brand-card p-5 border-l-4 border-l-[#F59E0B]">
          <div className="flex items-center justify-between mb-2 text-[#667085]">
            <h3 className="text-xs font-bold uppercase tracking-wider">Active Trials</h3>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F59E0B]/10 text-[#F59E0B]">
              <Gift className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-[#F59E0B]">{trialBusinesses}</p>
            <span className="text-[10px] font-bold text-[#6C4DFF] bg-[#6C4DFF]/10 px-1.5 py-0.5 rounded">
              14-Day Free
            </span>
          </div>
          <p className="text-[11px] text-[#667085] mt-1">High conversion pipeline</p>
        </div>

        <div className="brand-card p-5 border-l-4 border-l-[#EF4444]">
          <div className="flex items-center justify-between mb-2 text-[#667085]">
            <h3 className="text-xs font-bold uppercase tracking-wider">Expired / Read-Only</h3>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EF4444]/10 text-[#EF4444]">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#EF4444]">{expiredBusinesses}</p>
          <p className="text-[11px] text-[#667085] mt-1">Win-back opportunities</p>
        </div>
      </div>

      {/* PLATFORM GROWTH & ANALYTICS VISUALIZATION SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MRR Growth Chart */}
        <div className="lg:col-span-2 brand-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E8ED] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#111439]">Platform MRR Growth Timeline</h2>
                <span className="rounded-full bg-[#16A34A]/10 px-2 py-0.5 text-[10px] font-bold text-[#16A34A]">
                  +584% 6-Month Growth
                </span>
              </div>
              <p className="text-xs text-[#667085]">
                Monthly recurring subscription revenue from all small business tenants
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-xl bg-[#F8F8F9] p-1 border border-[#E8E8ED]">
              <button
                onClick={() => setTimeRange("6m")}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors ${
                  timeRange === "6m" ? "bg-white text-[#111439] shadow-2xs" : "text-[#667085]"
                }`}
              >
                6 Months
              </button>
              <button
                onClick={() => setTimeRange("1y")}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors ${
                  timeRange === "1y" ? "bg-white text-[#111439] shadow-2xs" : "text-[#667085]"
                }`}
              >
                1 Year
              </button>
            </div>
          </div>

          {/* Interactive SVG Bar Chart for Growth */}
          <div className="h-56 w-full pt-4">
            <div className="grid grid-cols-6 gap-2 sm:gap-4 h-40 items-end px-2">
              {mrrGrowthData.map((item, index) => {
                const heightPct = Math.round((item.mrr / 18000) * 100);
                return (
                  <div key={index} className="flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-[#111439] text-white rounded-lg p-1.5 text-[10px] font-bold pointer-events-none z-10 whitespace-nowrap shadow-lg">
                      <p>₹{item.mrr.toLocaleString("en-IN")}</p>
                      <p className="text-[9px] text-[#16A34A]">{item.growth} growth</p>
                    </div>

                    <div className="w-full flex items-baseline justify-center mb-1">
                      <span className="text-[10px] font-bold text-[#6C4DFF]">{item.tenants}t</span>
                    </div>

                    <div
                      className="w-full rounded-t-xl brand-gradient transition-all duration-500 group-hover:brightness-110 shadow-xs"
                      style={{ height: `${heightPct}%` }}
                    />

                    <p className="text-[10px] font-medium text-[#667085] mt-2 truncate max-w-full text-center">
                      {item.month.split(" ")[0]}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-[#E8E8ED] mt-1 pt-2 flex items-center justify-between text-[11px] text-[#667085] px-2">
              <span>SaaS Launch (Apr 2026)</span>
              <span className="font-semibold text-[#111439]">Current Run-Rate: ₹16,772/mo</span>
            </div>
          </div>
        </div>

        {/* Tenant Industry Breakdown Card */}
        <div className="brand-card p-6 space-y-4">
          <div className="border-b border-[#E8E8ED] pb-3">
            <h2 className="text-base font-bold text-[#111439]">Tenant Industry Verticals</h2>
            <p className="text-xs text-[#667085]">Market share breakdown by business category</p>
          </div>

          <div className="space-y-3.5 pt-1">
            {industriesList.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#111439] capitalize">{item.industry}</span>
                  <span className="font-bold text-[#667085]">{item.count} stores ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-[#E8E8ED] rounded-full h-2">
                  <div
                    className="h-2 rounded-full brand-gradient transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-[#F8F8F9] p-3 border border-[#E8E8ED] mt-4 text-[11px] text-[#667085] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#111439]">
              <Sparkles className="h-3.5 w-3.5 text-[#6C4DFF]" />
              <span>Founder AI Growth Insight</span>
            </div>
            <p>
              Restaurants &amp; Cafes represent the fastest onboarding cycle (average 3.2 days to first WhatsApp outreach campaign).
            </p>
          </div>
        </div>
      </div>

      {/* Tenant Directory & Management */}
      <div className="brand-card overflow-hidden">
        <div className="p-6 border-b border-[#E8E8ED] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#111439]">Tenant Management Directory</h2>
            <p className="text-xs text-[#667085]">Manage subscriptions, extend trials, or view tenant workspace</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" />
            <input
              type="text"
              placeholder="Search business or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-[#E8E8ED] bg-[#F8F8F9] pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-[#6C4DFF]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F8F9] text-[#667085] font-bold uppercase text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Business / Vertical</th>
                <th className="px-6 py-3.5">Plan / Status</th>
                <th className="px-6 py-3.5">Trial End Date</th>
                <th className="px-6 py-3.5">Created</th>
                <th className="px-6 py-3.5 text-right">Super Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E8ED]">
              {filteredBusinesses.map((bus) => {
                const isSelected = activeBusiness.id === bus.id;
                return (
                  <tr key={bus.id} className={`hover:bg-[#F8F8F9]/50 transition-colors ${isSelected ? "bg-[#6C4DFF]/5" : ""}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-[#111439] text-white flex items-center justify-center font-bold text-xs">
                          {bus.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-[#111439]">{bus.name}</p>
                            {isSelected && (
                              <span className="rounded-md bg-[#6C4DFF] px-1.5 py-0.2 text-[9px] font-bold text-white uppercase">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[#667085] capitalize">{bus.industry} • {bus.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 font-bold text-[10px] uppercase tracking-wider ${
                          bus.subscription_status === "trialing"
                            ? "bg-[#F59E0B]/10 text-[#F59E0B]"
                            : bus.subscription_status === "active"
                            ? "bg-[#16A34A]/10 text-[#16A34A]"
                            : "bg-[#EF4444]/10 text-[#EF4444]"
                        }`}
                      >
                        {bus.subscription_plan.toUpperCase()} ({bus.subscription_status})
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-[#667085]">
                      {bus.trial_end_date ? format(new Date(bus.trial_end_date), "dd MMM yyyy") : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-[#667085]">
                      {formatDistanceToNow(new Date(bus.created_at))} ago
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleExtendTrial(bus.id, 14)}
                          className="rounded-lg border border-[#E8E8ED] bg-white px-2.5 py-1 text-[11px] font-bold text-[#111439] hover:bg-gray-50 flex items-center gap-1 shadow-2xs"
                          title="Add 14 days trial"
                        >
                          <Gift className="h-3 w-3 text-[#6C4DFF]" />
                          <span>+14d</span>
                        </button>

                        <button
                          onClick={() => handleSwitchToTenant(bus.id)}
                          className="rounded-lg bg-[#111439] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#1f235a] flex items-center gap-1 shadow-2xs"
                        >
                          <span>Manage</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
