// Importers/Callers: src/app/analytics/page.tsx
// Affected API: SalonAnalytics React component (Dedicated lightweight business intelligence & retention analytics for salon_spa)
// Data Schemas: Business, Customer, Visit, Opportunity from src/lib/types.ts
// User's Verbatim Instruction: "c:\AI\Revia_Salon_Final_Update_Claude_Code_Prompt.docx  Cheque the whole file and Make a todo list of the updates and Please update What are I mentioned in this document And after completing one by one Up update the  To do list"

"use client";

import React, { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Users,
  UserPlus,
  UserCheck,
  CreditCard,
  TrendingUp,
  Award,
  AlertTriangle,
  Scissors,
  Sparkles,
  Calendar,
  DollarSign,
  Activity,
  MessageCircle,
  Clock,
  Tag,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { buildWhatsAppLink } from "@/lib/intelligence";
import Link from "next/link";

export function SalonAnalytics() {
  const { activeBusiness, customers, visits, logWhatsAppSend } = useApp();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "all">("30d");

  const currencySymbol = activeBusiness?.currency_symbol || "₹";

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const now = new Date();

  // 1. Core Filtered Visits
  const filteredVisits = useMemo(() => {
    if (timeRange === "all") return visits;
    const days = timeRange === "7d" ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return visits.filter((v) => new Date(v.created_at || v.date) >= cutoff);
  }, [visits, timeRange]);

  // 2. Computed Metrics
  const totalCustomers = customers.length;
  const newCustomersCount = customers.filter((c) => c.total_visits <= 1 || c.segment === "new").length;
  const returningCustomersCount = customers.filter((c) => c.total_visits > 1).length;
  const repeatRate = totalCustomers > 0 ? Math.round((returningCustomersCount / totalCustomers) * 100) : 0;

  // Today's metrics
  const todayVisits = visits.filter((v) => isSameDay(new Date(v.created_at || v.date), now));
  const todayRevenue = todayVisits.reduce((sum, v) => sum + (v.amount || 0), 0);

  // This Week's metrics (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thisWeekVisits = visits.filter((v) => new Date(v.created_at || v.date) >= sevenDaysAgo);
  const thisWeekRevenue = thisWeekVisits.reduce((sum, v) => sum + (v.amount || 0), 0);

  // This Month's metrics
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthVisits = visits.filter((v) => new Date(v.created_at || v.date) >= startOfMonth);
  const thisMonthRevenue = thisMonthVisits.reduce((sum, v) => sum + (v.amount || 0), 0);

  // Total Lifetime Revenue
  const totalRevenue = visits.reduce((sum, v) => sum + (v.amount || 0), 0);
  const averageTicket = visits.length > 0 ? Math.round(totalRevenue / visits.length) : 0;

  // Inactive / Churn risk customers
  const inactiveCustomers = useMemo(() => {
    return customers
      .filter((c) => c.segment === "inactive" || c.segment === "becoming_inactive")
      .sort((a, b) => new Date(a.last_visit_date).getTime() - new Date(b.last_visit_date).getTime());
  }, [customers]);

  // Top Spenders Leaderboard
  const topSpenders = useMemo(() => {
    return [...customers]
      .sort((a, b) => (b.total_spend || 0) - (a.total_spend || 0))
      .slice(0, 6);
  }, [customers]);

  // Popular Services Breakdown
  const serviceStats = useMemo(() => {
    const counts: Record<string, { count: number; revenue: number }> = {};
    for (const v of visits) {
      const items = v.items && v.items.length > 0 ? v.items : ["General Salon Service"];
      for (const item of items) {
        if (!counts[item]) counts[item] = { count: 0, revenue: 0 };
        counts[item].count += 1;
        counts[item].revenue += Math.round(v.amount / items.length);
      }
    }
    return Object.entries(counts)
      .map(([name, stat]) => ({ name, ...stat }))
      .sort((a, b) => b.count - a.count);
  }, [visits]);

  // 14-Day Visual Trend
  const dailyTrend = useMemo(() => {
    const days: { day: string; dateStr: string; visits: number; revenue: number }[] = [];
    const count = timeRange === "7d" ? 7 : 14;
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayVisits = visits.filter((v) => isSameDay(new Date(v.created_at || v.date), d));
      const rev = dayVisits.reduce((sum, v) => sum + v.amount, 0);
      days.push({
        day: d.toLocaleDateString("en-IN", { weekday: "short" }),
        dateStr: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
        visits: dayVisits.length,
        revenue: rev,
      });
    }
    return days;
  }, [visits, timeRange]);

  const maxDailyRevenue = Math.max(...dailyTrend.map((d) => d.revenue), 1000);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Filter */}
      <div className="rounded-3xl bg-gradient-to-r from-[#FAF5FF] via-[#F5F3FF] to-[#FFFFFF] p-6 sm:p-8 border border-[#E9D5FF] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="rounded-full bg-[#9333EA]/10 border border-[#9333EA]/20 px-3 py-1 text-xs font-bold text-[#9333EA] inline-flex items-center gap-1.5">
              <Scissors className="h-3.5 w-3.5" />
              Salon Intelligence &amp; Analytics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E1B4B] tracking-tight">
            Revenue &amp; Client Retention Insights
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1 font-medium">
            Clear, actionable salon metrics computed in real-time from your database.
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex rounded-2xl bg-white p-1.5 border border-[#E9D5FF] shadow-xs">
          <button
            onClick={() => setTimeRange("7d")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              timeRange === "7d"
                ? "bg-[#9333EA] text-white shadow-sm"
                : "text-[#6B7280] hover:text-[#1E1B4B]"
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange("30d")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              timeRange === "30d"
                ? "bg-[#9333EA] text-white shadow-sm"
                : "text-[#6B7280] hover:text-[#1E1B4B]"
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setTimeRange("all")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              timeRange === "all"
                ? "bg-[#9333EA] text-white shadow-sm"
                : "text-[#6B7280] hover:text-[#1E1B4B]"
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* 4 Primary Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Revenue */}
        <div className="rounded-2xl border border-[#EDE9FE] bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Today's Revenue</span>
            <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-black text-[#1E1B4B] tabular-nums">
              {currencySymbol}{todayRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-purple-600 font-bold mt-1">{todayVisits.length} visits logged today</p>
          </div>
        </div>

        {/* This Week / Month Revenue */}
        <div className="rounded-2xl border border-[#EDE9FE] bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">This Month Sales</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-black text-[#1E1B4B] tabular-nums">
              {currencySymbol}{thisMonthRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-emerald-600 font-bold mt-1">Week: {currencySymbol}{thisWeekRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Average Ticket Size */}
        <div className="rounded-2xl border border-[#EDE9FE] bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Average Ticket</span>
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-black text-[#1E1B4B] tabular-nums">
              {currencySymbol}{averageTicket.toLocaleString()}
            </p>
            <p className="text-xs text-blue-600 font-bold mt-1">Average spend per visit</p>
          </div>
        </div>

        {/* Repeat Customer Rate */}
        <div className="rounded-2xl border border-[#EDE9FE] bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Repeat Client Rate</span>
            <div className="h-8 w-8 rounded-xl bg-pink-50 text-pink-600 border border-pink-100 flex items-center justify-center">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-black text-[#1E1B4B] tabular-nums">{repeatRate}%</p>
            <p className="text-xs text-pink-600 font-bold mt-1">{returningCustomersCount} returning clients</p>
          </div>
        </div>
      </div>

      {/* Revenue Progression Bar Chart */}
      <div className="rounded-3xl border border-[#EDE9FE] bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#F5F3FF] pb-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-[#1E1B4B] flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#9333EA]" />
              <span>Daily Revenue &amp; Visit Velocity</span>
            </h2>
            <p className="text-xs text-[#6B7280]">Daily salon income trend based on recorded visits</p>
          </div>
          <span className="text-xs font-bold text-[#9333EA] bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
            Total {filteredVisits.length} visits in period
          </span>
        </div>

        {/* Daily Bar Chart */}
        <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 items-end min-h-[200px] pt-8 pb-3">
          {dailyTrend.map((item, idx) => {
            const heightPct = Math.max(10, Math.round((item.revenue / maxDailyRevenue) * 100));
            return (
              <div key={idx} className="flex flex-col items-center gap-2 group">
                <span className="text-[10px] font-bold text-[#6B7280] tabular-nums opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {currencySymbol}{item.revenue}
                </span>
                <div className="w-full bg-[#FAF5FF] rounded-xl h-36 flex items-end p-1">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full rounded-lg bg-gradient-to-t from-[#9333EA] to-[#C084FC] group-hover:from-[#7E22CE] group-hover:to-[#A855F7] transition-all shadow-xs flex items-center justify-center text-[10px] font-bold text-white"
                  >
                    {item.visits > 0 ? item.visits : ""}
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-[#6B7280] truncate w-full text-center">
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Popular Salon Services & New vs Returning Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Services Demand */}
        <div className="rounded-3xl border border-[#EDE9FE] bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#F5F3FF] pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#1E1B4B] flex items-center gap-2">
                  <Scissors className="h-4 w-4 text-[#9333EA]" />
                  <span>Popular Salon Services</span>
                </h3>
                <p className="text-xs text-[#6B7280]">Most frequently booked services &amp; generated revenue</p>
              </div>
            </div>

            {serviceStats.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#6B7280]">
                <p>No service breakdown available yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {serviceStats.slice(0, 5).map((srv, idx) => {
                  const maxCount = serviceStats[0]?.count || 1;
                  const pct = Math.round((srv.count / maxCount) * 100);
                  return (
                    <div key={srv.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#1E1B4B] flex items-center gap-2">
                          <Tag className="h-3 w-3 text-[#9333EA]" />
                          {srv.name}
                        </span>
                        <div className="text-right">
                          <strong className="text-[#9333EA] tabular-nums font-bold">
                            {currencySymbol}{srv.revenue.toLocaleString()}
                          </strong>
                          <span className="text-[#6B7280] text-[11px] ml-1.5">({srv.count} visits)</span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[#FAF5FF] overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full bg-gradient-to-r from-[#9333EA] to-[#C084FC] rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Customer Base Composition & Insights */}
        <div className="rounded-3xl border border-[#EDE9FE] bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#F5F3FF] pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#1E1B4B] flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#9333EA]" />
                  <span>Client Retention Composition</span>
                </h3>
                <p className="text-xs text-[#6B7280]">New clients vs repeating regulars</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 my-2">
              <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4">
                <span className="text-xs font-bold text-[#9333EA]">Regular Clients</span>
                <p className="text-2xl font-black text-[#1E1B4B] mt-1 tabular-nums">{returningCustomersCount}</p>
                <p className="text-[11px] text-[#6B7280] mt-0.5">{repeatRate}% repeat client base</p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                <span className="text-xs font-bold text-blue-600">New Clients</span>
                <p className="text-2xl font-black text-[#1E1B4B] mt-1 tabular-nums">{newCustomersCount}</p>
                <p className="text-[11px] text-[#6B7280] mt-0.5">{100 - repeatRate}% single-visit visitors</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 space-y-1 mt-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Retention Health Summary</span>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed font-medium">
              Your average ticket size of {currencySymbol}{averageTicket} indicates healthy client spending. Retaining just 5 additional regular clients monthly adds approx {currencySymbol}{(5 * averageTicket * 2).toLocaleString()} in repeat revenue!
            </p>
          </div>
        </div>
      </div>

      {/* Inactive Customer Churn Win-Back & Top VIP Spenders Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inactive Customer Churn Alert Table */}
        <div className="rounded-3xl border border-[#EDE9FE] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#F5F3FF] pb-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#1E1B4B] flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                <span>Inactive Clients (Overdue for Service)</span>
              </h3>
              <p className="text-xs text-[#6B7280]">Clients who haven't visited in 35+ days</p>
            </div>
            <span className="rounded-full bg-rose-50 text-rose-700 text-xs font-bold px-2.5 py-0.5 border border-rose-200">
              {inactiveCustomers.length} At Risk
            </span>
          </div>

          {inactiveCustomers.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#6B7280]">
              <p className="font-bold text-emerald-600">Zero inactive clients!</p>
              <p className="text-[11px] mt-1">All registered salon clients have visited recently.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {inactiveCustomers.slice(0, 6).map((cust) => {
                const daysSince = cust.last_visit_date
                  ? Math.max(1, Math.floor((Date.now() - new Date(cust.last_visit_date).getTime()) / 86400000))
                  : 45;
                return (
                  <div
                    key={cust.id}
                    className="p-3 rounded-2xl border border-rose-100 bg-rose-50/30 flex items-center justify-between gap-3 text-xs hover:bg-rose-50/70 transition-colors"
                  >
                    <div>
                      <p className="font-bold text-[#1E1B4B]">{cust.name}</p>
                      <p className="text-[11px] text-[#6B7280]">{cust.phone} • {daysSince} days since last visit</p>
                    </div>

                    <a
                      href={buildWhatsAppLink(
                        cust.phone,
                        `Hi ${cust.name}! We miss seeing you at *${activeBusiness.name}*! ✨ Enjoy a special comeback discount on your next visit this week.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        logWhatsAppSend({
                          business_id: activeBusiness.id,
                          customer_id: cust.id,
                          phone: cust.phone,
                          customer_name: cust.name,
                          template_name: "winback_offer",
                          message_sent: "Inactive winback WhatsApp message",
                        });
                      }}
                      className="inline-flex items-center gap-1 rounded-xl bg-[#25D366] px-3 py-1.5 text-[11px] font-bold text-white shadow-xs hover:brightness-105 transition-all shrink-0"
                    >
                      <MessageCircle className="h-3 w-3" />
                      <span>Win Back</span>
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top VIP Clients Leaderboard */}
        <div className="rounded-3xl border border-[#EDE9FE] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#F5F3FF] pb-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#1E1B4B] flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" />
                <span>Top VIP Spenders Leaderboard</span>
              </h3>
              <p className="text-xs text-[#6B7280]">Your most valuable lifetime salon clients</p>
            </div>
            <Link
              href="/customers"
              className="text-xs font-bold text-[#9333EA] hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {topSpenders.map((cust, idx) => (
              <div
                key={cust.id}
                className="p-3 rounded-2xl border border-purple-100 bg-purple-50/30 flex items-center justify-between gap-3 text-xs hover:bg-purple-50/70 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white text-xs font-black text-[#9333EA] border border-purple-100 shadow-xs">
                    #{idx + 1}
                  </span>
                  <div>
                    <p className="font-bold text-[#1E1B4B]">{cust.name}</p>
                    <p className="text-[11px] text-[#6B7280]">{cust.phone} • {cust.total_visits} visits</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-black text-[#9333EA] tabular-nums text-sm">
                    {currencySymbol}{(cust.total_spend || 0).toLocaleString()}
                  </p>
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-100">
                    VIP Member
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
