// Importers/Callers: src/app/dashboard/page.tsx
// Affected API: SalonDashboard React component (Modern Light SaaS Direction for salon_spa)
// Data Schemas: Business, Customer, Visit, Opportunity from src/lib/types.ts
// User's Verbatim Instruction: "c:\AI\Revia_Salon_Final_Update_Claude_Code_Prompt.docx  Cheque the whole file and Make a todo list of the updates and Please update What are I mentioned in this document And after completing one by one Up update the  To do list"

"use client";

import React, { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import {
  Users,
  UserPlus,
  UserCheck,
  Calendar,
  CreditCard,
  TrendingUp,
  Clock,
  AlertCircle,
  Scissors,
  ArrowRight,
  MessageCircle,
  Sparkles,
  BarChart3,
  Award,
  ChevronRight,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";
import { buildWhatsAppLink } from "@/lib/intelligence";

export function SalonDashboard() {
  const { activeBusiness, customers, visits, opportunities } = useApp();

  // Helper date calculators
  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  // 1. Calculations from real tenant data
  const totalCustomers = customers.length;

  const newCustomersToday = customers.filter((c) => {
    if (!c.created_at) return false;
    return isSameDay(new Date(c.created_at), now);
  }).length;

  const regularCustomers = customers.filter(
    (c) => c.total_visits > 1 || c.segment === "regular" || c.segment === "vip"
  ).length;

  const todayVisits = visits.filter((v) => {
    const vDate = new Date(v.created_at || v.date);
    return isSameDay(vDate, now);
  });

  const todayRevenue = todayVisits.reduce((acc, v) => acc + (v.amount || 0), 0);

  // This Week Revenue (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thisWeekVisits = visits.filter((v) => {
    const vDate = new Date(v.created_at || v.date);
    return vDate >= sevenDaysAgo;
  });
  const thisWeekRevenue = thisWeekVisits.reduce((acc, v) => acc + (v.amount || 0), 0);

  // This Month Revenue
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthVisits = visits.filter((v) => {
    const vDate = new Date(v.created_at || v.date);
    return vDate >= firstDayOfMonth;
  });
  const thisMonthRevenue = thisMonthVisits.reduce((acc, v) => acc + (v.amount || 0), 0);

  // Inactive Customers
  const inactiveCustomers = customers.filter(
    (c) => c.segment === "inactive" || c.segment === "becoming_inactive"
  ).length;

  // New vs Returning calculations
  const returningCount = customers.filter((c) => c.total_visits > 1).length;
  const singleVisitCount = Math.max(0, totalCustomers - returningCount);
  const returningPercent = totalCustomers > 0 ? Math.round((returningCount / totalCustomers) * 100) : 0;
  const newPercent = 100 - returningPercent;

  // 7-day visit activity trend
  const last7DaysTrend = useMemo(() => {
    const days: { day: string; count: number; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString("en-IN", { weekday: "short" });
      const dayVisits = visits.filter((v) => isSameDay(new Date(v.created_at || v.date), d));
      const rev = dayVisits.reduce((sum, v) => sum + v.amount, 0);
      days.push({ day: dayName, count: dayVisits.length, revenue: rev });
    }
    return days;
  }, [visits]);

  const maxVisitsInWeek = Math.max(...last7DaysTrend.map((d) => d.count), 1);

  // Top Customers by Spending
  const topCustomers = useMemo(() => {
    return [...customers]
      .sort((a, b) => (b.total_spend || 0) - (a.total_spend || 0))
      .slice(0, 5);
  }, [customers]);

  // Recent Visits Feed
  const recentVisits = useMemo(() => {
    return [...visits]
      .sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime())
      .slice(0, 6);
  }, [visits]);

  const currencySymbol = activeBusiness?.currency_symbol || "₹";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Salon Welcome & Quick Actions Bar */}
      <div className="rounded-3xl bg-gradient-to-r from-[#FAF5FF] via-[#F5F3FF] to-[#FFFFFF] p-6 sm:p-8 border border-[#E9D5FF] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="rounded-full bg-[#9333EA]/10 border border-[#9333EA]/20 px-3 py-1 text-xs font-bold text-[#9333EA] inline-flex items-center gap-1.5">
              <Scissors className="h-3.5 w-3.5" />
              Salon &amp; Spa Workspace
            </span>
            <span className="rounded-full bg-[#16A34A]/10 text-[#16A34A] text-xs font-bold px-2.5 py-0.5 border border-[#16A34A]/20">
              Live Real-Time Data
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E1B4B] tracking-tight">
            {activeBusiness?.name || "Salon Dashboard"}
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1 font-medium max-w-xl">
            Track daily salon visitors, monitor client return cycles, and view revenue analytics without complicated settings.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <Link
            href="/add-visit"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#9333EA] to-[#7E22CE] px-5 py-3 text-xs font-bold text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 hover:brightness-105 transition-all btn-interactive"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Customer Visit</span>
          </Link>
          <Link
            href="/whatsapp"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:brightness-105 transition-all btn-interactive"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Send WhatsApp</span>
          </Link>
          <Link
            href="/customers"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl border border-[#E9D5FF] bg-white px-4 py-3 text-xs font-bold text-[#1E1B4B] hover:bg-[#FAF5FF] transition-all btn-interactive shadow-xs"
          >
            <Users className="h-4 w-4 text-[#9333EA]" />
            <span>All Clients</span>
          </Link>
        </div>
      </div>

      {/* 8 Primary Real-Time Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Customers */}
        <div className="rounded-2xl border border-[#F3E8FF] bg-white p-4 sm:p-5 shadow-xs hover:border-[#D8B4FE] transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Total Customers</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-[#1E1B4B] tabular-nums">{totalCustomers.toLocaleString()}</p>
            <p className="text-[11px] text-[#6B7280] mt-0.5">Registered client base</p>
          </div>
        </div>

        {/* New Customers Today */}
        <div className="rounded-2xl border border-[#F3E8FF] bg-white p-4 sm:p-5 shadow-xs hover:border-[#D8B4FE] transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">New Today</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <UserPlus className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-[#1E1B4B] tabular-nums">{newCustomersToday}</p>
            <p className="text-[11px] text-blue-600 font-semibold mt-0.5">First-time visitors today</p>
          </div>
        </div>

        {/* Regular / Returning Customers */}
        <div className="rounded-2xl border border-[#F3E8FF] bg-white p-4 sm:p-5 shadow-xs hover:border-[#D8B4FE] transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Regular Clients</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-[#1E1B4B] tabular-nums">{regularCustomers}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">{returningPercent}% repeat loyalty</p>
          </div>
        </div>

        {/* Customers Today */}
        <div className="rounded-2xl border border-[#F3E8FF] bg-white p-4 sm:p-5 shadow-xs hover:border-[#D8B4FE] transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Visits Today</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-50 text-pink-600 border border-pink-100">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-[#1E1B4B] tabular-nums">{todayVisits.length}</p>
            <p className="text-[11px] text-[#6B7280] mt-0.5">Walk-ins served today</p>
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="rounded-2xl border border-[#F3E8FF] bg-white p-4 sm:p-5 shadow-xs hover:border-[#D8B4FE] transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Today's Revenue</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-[#1E1B4B] tabular-nums">
              {currencySymbol}{todayRevenue.toLocaleString()}
            </p>
            <p className="text-[11px] text-purple-600 font-semibold mt-0.5">Daily salon earnings</p>
          </div>
        </div>

        {/* This Week Revenue */}
        <div className="rounded-2xl border border-[#F3E8FF] bg-white p-4 sm:p-5 shadow-xs hover:border-[#D8B4FE] transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">This Week</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-[#1E1B4B] tabular-nums">
              {currencySymbol}{thisWeekRevenue.toLocaleString()}
            </p>
            <p className="text-[11px] text-[#6B7280] mt-0.5">Last 7 days total</p>
          </div>
        </div>

        {/* This Month Revenue */}
        <div className="rounded-2xl border border-[#F3E8FF] bg-white p-4 sm:p-5 shadow-xs hover:border-[#D8B4FE] transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">This Month</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-[#1E1B4B] tabular-nums">
              {currencySymbol}{thisMonthRevenue.toLocaleString()}
            </p>
            <p className="text-[11px] text-[#6B7280] mt-0.5">Month-to-date sales</p>
          </div>
        </div>

        {/* Inactive Customers */}
        <div className="rounded-2xl border border-[#F3E8FF] bg-white p-4 sm:p-5 shadow-xs hover:border-[#D8B4FE] transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Inactive Alert</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-[#1E1B4B] tabular-nums">{inactiveCustomers}</p>
            <p className="text-[11px] text-rose-600 font-semibold mt-0.5">Overdue for salon visit</p>
          </div>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Growth & Weekly Visits Bar Chart */}
        <div className="lg:col-span-2 rounded-3xl border border-[#EDE9FE] bg-white p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#F5F3FF] pb-4 mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#1E1B4B] flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[#9333EA]" />
                <span>Customer Visit Activity (Last 7 Days)</span>
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">Daily salon visits and revenue progression</p>
            </div>
            <Link
              href="/analytics"
              className="text-xs font-bold text-[#9333EA] hover:text-[#7E22CE] flex items-center gap-1 transition-colors"
            >
              <span>Full Analytics</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* 7-Day Bar Visualization */}
          <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end pt-6 pb-2 min-h-[180px]">
            {last7DaysTrend.map((item, idx) => {
              const heightPercent = Math.max(12, Math.round((item.count / maxVisitsInWeek) * 100));
              return (
                <div key={idx} className="flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-bold text-[#6B7280] tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">
                    {currencySymbol}{item.revenue}
                  </span>
                  <div className="w-full bg-[#FAF5FF] rounded-xl h-32 flex items-end p-1">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full rounded-lg bg-gradient-to-t from-[#9333EA] to-[#C084FC] group-hover:from-[#7E22CE] group-hover:to-[#A855F7] transition-all shadow-xs flex items-center justify-center text-[10px] font-bold text-white"
                    >
                      {item.count > 0 ? item.count : ""}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#4B5563]">{item.day}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-[#F5F3FF] flex items-center justify-between text-xs text-[#6B7280]">
            <span>Weekly visits total: <strong className="text-[#1E1B4B] font-bold">{thisWeekVisits.length}</strong></span>
            <span>Avg spend: <strong className="text-[#9333EA] font-bold">{currencySymbol}{thisWeekVisits.length > 0 ? Math.round(thisWeekRevenue / thisWeekVisits.length) : 0}</strong> / client</span>
          </div>
        </div>

        {/* New vs Returning Customers Ratio Card */}
        <div className="rounded-3xl border border-[#EDE9FE] bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#1E1B4B] flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-[#9333EA]" />
              <span>New vs Returning Clients</span>
            </h2>
            <p className="text-xs text-[#6B7280]">Client retention ratio breakdown</p>
          </div>

          <div className="my-6 space-y-4">
            {/* Visual Multi-Segment Bar */}
            <div className="h-4 w-full rounded-full bg-[#F3E8FF] overflow-hidden flex">
              <div
                style={{ width: `${returningPercent}%` }}
                className="bg-[#9333EA] h-full transition-all"
                title={`Returning: ${returningPercent}%`}
              />
              <div
                style={{ width: `${newPercent}%` }}
                className="bg-[#3B82F6] h-full transition-all"
                title={`New: ${newPercent}%`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-purple-100 bg-purple-50/60 p-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#9333EA]">
                  <div className="h-2 w-2 rounded-full bg-[#9333EA]" />
                  <span>Returning</span>
                </div>
                <p className="text-xl font-black text-[#1E1B4B] mt-1 tabular-nums">{returningCount}</p>
                <p className="text-[10px] text-[#6B7280]">{returningPercent}% of total base</p>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600">
                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                  <span>1st Time</span>
                </div>
                <p className="text-xl font-black text-[#1E1B4B] mt-1 tabular-nums">{singleVisitCount}</p>
                <p className="text-[10px] text-[#6B7280]">{newPercent}% single visit</p>
              </div>
            </div>
          </div>

          {/* Retention Insight Banner */}
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5 flex items-start gap-2.5 text-xs">
            <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-emerald-900 leading-relaxed font-medium">
              {returningPercent >= 40
                ? "Your salon has strong repeat loyalty! Keep engaging regulars with loyalty perks."
                : "Focus on converting first-time visitors into 2nd visit appointments with WhatsApp vouchers."}
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Feeds: Recent Visits & Top Spender Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Customers Feed */}
        <div className="lg:col-span-2 rounded-3xl border border-[#EDE9FE] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#F5F3FF] pb-4 mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#1E1B4B] flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#9333EA]" />
                <span>Recent Salon Client Activity</span>
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">Live stream of latest recorded services</p>
            </div>
            <Link
              href="/customers"
              className="text-xs font-bold text-[#9333EA] hover:text-[#7E22CE] flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentVisits.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#6B7280]">
              <Scissors className="h-8 w-8 text-[#C084FC] mx-auto mb-2 opacity-50" />
              <p className="font-bold">No visits recorded yet today</p>
              <p className="mt-1 text-[11px]">Click "Add Customer Visit" to record your first client of the day.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F5F3FF]">
              {recentVisits.map((v) => {
                const isReturning = (v.customer_phone && customers.find((c) => c.phone === v.customer_phone)?.total_visits || 1) > 1;
                return (
                  <div key={v.id} className="py-3.5 flex items-center justify-between gap-3 hover:bg-[#FAF5FF]/60 px-2 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700 font-bold text-xs shrink-0">
                        {v.customer_name?.charAt(0) || "C"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-[#1E1B4B]">{v.customer_name || "Walk-in Guest"}</p>
                          {isReturning ? (
                            <span className="rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.2 border border-emerald-200">
                              Regular
                            </span>
                          ) : (
                            <span className="rounded-full bg-blue-50 text-blue-700 text-[9px] font-bold px-1.5 py-0.2 border border-blue-200">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#6B7280]">
                          {v.items && v.items.length > 0 ? v.items.join(", ") : "Salon Service"}
                          {v.customer_phone && ` • ${v.customer_phone}`}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold text-[#1E1B4B] tabular-nums">
                        {currencySymbol}{v.amount.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-[#6B7280]">
                        {new Date(v.created_at || v.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Spending Clients Leaderboard */}
        <div className="rounded-3xl border border-[#EDE9FE] bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#F5F3FF] pb-4 mb-4">
              <div>
                <h2 className="text-sm font-bold text-[#1E1B4B] flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" />
                  <span>Top Salon Clients</span>
                </h2>
                <p className="text-xs text-[#6B7280] mt-0.5">Highest lifetime spenders</p>
              </div>
            </div>

            {topCustomers.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#6B7280]">
                <p>No client records yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topCustomers.map((cust, idx) => (
                  <div key={cust.id} className="flex items-center justify-between p-2.5 rounded-xl border border-purple-50 bg-purple-50/30 hover:bg-purple-50/80 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-[#9333EA] border border-purple-100 shadow-xs">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-[#1E1B4B]">{cust.name}</p>
                        <p className="text-[10px] text-[#6B7280]">{cust.total_visits} visits</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#9333EA] tabular-nums">
                        {currencySymbol}{(cust.total_spend || 0).toLocaleString()}
                      </p>
                      <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
                        VIP Tier
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[#F5F3FF]">
            <Link
              href="/whatsapp"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#9333EA] py-2.5 text-xs font-bold transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>Send VIP Appreciation Perk</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
