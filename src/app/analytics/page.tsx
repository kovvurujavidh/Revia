"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Download,
  Search,
  Activity,
  Award,
  Target,
  Send,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Layers,
  RefreshCw,
  Minus,
  ChevronRight,
  Eye,
  UserCheck,
  Zap,
  Heart,
} from "lucide-react";
import { SalonAnalytics } from "@/components/analytics/SalonAnalytics";
import { format, subDays, isWithinInterval, startOfDay } from "date-fns";

type DateRangeOption = "today" | "7days" | "30days" | "90days" | "this_year";
type AnalyticsSubTab = "overview" | "behavior" | "patterns" | "revenue" | "rfm" | "predictions";

const TAB_OPTIONS: { key: AnalyticsSubTab; label: string; icon: React.ElementType }[] = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "behavior", label: "Behavior", icon: Users },
  { key: "patterns", label: "Patterns", icon: Activity },
  { key: "revenue", label: "Revenue", icon: DollarSign },
];

export default function AnalyticsPage() {
  const { customers, visits, activeBusiness, opportunities } = useApp();
  const isSalon = activeBusiness?.industry === "salon_spa";

  const [activeTab, setActiveTab] = useState<AnalyticsSubTab>("overview");
  const [dateRange, setDateRange] = useState<DateRangeOption>("30days");
  const [globalSearch, setGlobalSearch] = useState("");
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: activeBusiness.currency || "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Date Range Bounds
  const { startDate, endDate, prevStartDate, prevEndDate, daysCount } = useMemo(() => {
    const now = new Date();
    let start = subDays(now, 30);
    let days = 30;

    switch (dateRange) {
      case "today":
        start = startOfDay(now);
        days = 1;
        break;
      case "7days":
        start = subDays(now, 7);
        days = 7;
        break;
      case "30days":
        start = subDays(now, 30);
        days = 30;
        break;
      case "90days":
        start = subDays(now, 90);
        days = 90;
        break;
      case "this_year":
        start = new Date(now.getFullYear(), 0, 1);
        days = Math.max(1, Math.floor((now.getTime() - start.getTime()) / 86400000));
        break;
    }

    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = subDays(prevEnd, days);

    return {
      startDate: start,
      endDate: now,
      prevStartDate: prevStart,
      prevEndDate: prevEnd,
      daysCount: days,
    };
  }, [dateRange]);

  const currentVisits = useMemo(() => {
    return visits.filter((v) => {
      const vDate = new Date(v.created_at);
      return vDate >= startDate && vDate <= endDate;
    });
  }, [visits, startDate, endDate]);

  const previousVisits = useMemo(() => {
    return visits.filter((v) => {
      const vDate = new Date(v.created_at);
      return vDate >= prevStartDate && vDate <= prevEndDate;
    });
  }, [visits, prevStartDate, prevEndDate]);

  // Core KPIs
  const kpis = useMemo(() => {
    const currentRevenue = currentVisits.reduce((sum, v) => sum + v.amount, 0);
    const currentVisitCount = currentVisits.length;
    const currentCustomerIds = new Set(currentVisits.map((v) => v.customer_id).filter(Boolean));
    const currentUniqueCustomers = currentCustomerIds.size || Math.min(customers.length, currentVisitCount);
    const currentAvgSpend = currentVisitCount > 0 ? Math.round(currentRevenue / currentVisitCount) : 0;

    const repeatCustomersInPeriod = Array.from(currentCustomerIds).filter((id) => {
      const custVisits = currentVisits.filter((v) => v.customer_id === id);
      return custVisits.length > 1;
    });
    const returningRate = currentUniqueCustomers > 0
      ? Math.round((repeatCustomersInPeriod.length / currentUniqueCustomers) * 100)
      : 0;

    const atRiskCustomers = customers.filter(
      (c) => c.segment === "becoming_inactive" || c.segment === "inactive"
    );

    const prevRevenue = previousVisits.reduce((sum, v) => sum + v.amount, 0);
    const prevVisitCount = previousVisits.length;
    const prevCustomerIds = new Set(previousVisits.map((v) => v.customer_id).filter(Boolean));
    const prevUniqueCustomers = prevCustomerIds.size || Math.min(customers.length, prevVisitCount);
    const prevAvgSpend = prevVisitCount > 0 ? Math.round(prevRevenue / prevVisitCount) : 0;

    const calcPctChange = (cur: number, prev: number) => {
      if (prev === 0) return cur > 0 ? 100 : 0;
      return Math.round(((cur - prev) / prev) * 100);
    };

    return {
      revenue: { value: currentRevenue, prev: prevRevenue, pct: calcPctChange(currentRevenue, prevRevenue) },
      visits: { value: currentVisitCount, prev: prevVisitCount, pct: calcPctChange(currentVisitCount, prevVisitCount) },
      uniqueCustomers: { value: currentUniqueCustomers, prev: prevUniqueCustomers, pct: calcPctChange(currentUniqueCustomers, prevUniqueCustomers) },
      avgSpend: { value: currentAvgSpend, prev: prevAvgSpend, pct: calcPctChange(currentAvgSpend, prevAvgSpend) },
      returningRate: { value: returningRate, pct: calcPctChange(returningRate, 45) },
      atRisk: { value: atRiskCustomers.length, pct: -5 },
    };
  }, [currentVisits, previousVisits, customers]);

  // Timeline Data
  const timelineData = useMemo(() => {
    const points: { date: string; label: string; amount: number; visits: number; prevAmount: number }[] = [];
    const intervalDays = Math.min(daysCount, 30);
    const step = Math.max(1, Math.floor(daysCount / intervalDays));

    for (let i = intervalDays - 1; i >= 0; i--) {
      const d = subDays(endDate, i * step);
      const dStr = format(d, "yyyy-MM-dd");
      const dLabel = format(d, daysCount <= 7 ? "EEE" : "MMM d");

      const dayVisits = currentVisits.filter((v) => format(new Date(v.created_at), "yyyy-MM-dd") === dStr);
      const dayRev = dayVisits.reduce((acc, v) => acc + v.amount, 0);

      const prevD = subDays(prevEndDate, i * step);
      const prevDStr = format(prevD, "yyyy-MM-dd");
      const prevDayVisits = previousVisits.filter((v) => format(new Date(v.created_at), "yyyy-MM-dd") === prevDStr);
      const prevDayRev = prevDayVisits.reduce((acc, v) => acc + v.amount, 0);

      points.push({ date: dStr, label: dLabel, amount: dayRev, visits: dayVisits.length, prevAmount: prevDayRev });
    }
    return points;
  }, [currentVisits, previousVisits, endDate, prevEndDate, daysCount]);

  const maxRevenue = useMemo(() => Math.max(...timelineData.map((p) => Math.max(p.amount, p.prevAmount)), 1000), [timelineData]);

  // Segment Stats
  const segmentStats = useMemo(() => {
    const total = customers.length || 1;
    const segments = ["vip", "regular", "new", "becoming_inactive", "inactive"];
    const colorMap: Record<string, string> = {
      vip: "#6C4DFF",
      regular: "#3B82F6",
      new: "#16A34A",
      becoming_inactive: "#F59E0B",
      inactive: "#EF4444",
    };
    const labelMap: Record<string, string> = {
      vip: "VIP",
      regular: "Regular",
      new: "New",
      becoming_inactive: "At Risk",
      inactive: "Inactive",
    };
    const iconMap: Record<string, React.ElementType> = {
      vip: Award,
      regular: Users,
      new: Sparkles,
      becoming_inactive: AlertTriangle,
      inactive: Clock,
    };
    const stats = segments.map((segKey) => {
      const filtered = customers.filter((c) => c.segment === segKey);
      const rev = filtered.reduce((sum, c) => sum + c.total_spend, 0);
      return {
        key: segKey,
        name: labelMap[segKey] || segKey,
        icon: iconMap[segKey] || Users,
        count: filtered.length,
        revenue: rev,
        color: colorMap[segKey] || "#667085",
        pct: Math.round((filtered.length / total) * 100),
      };
    });
    return stats;
  }, [customers]);

  // Top Customers
  const topCustomers = useMemo(() => {
    const custSpend: Record<string, { name: string; phone: string; visits: number; spend: number; id: string }> = {};
    currentVisits.forEach((visit) => {
      if (!visit.customer_id) return;
      const cust = customers.find((c) => c.id === visit.customer_id);
      if (!cust) return;
      if (!custSpend[cust.id]) {
        custSpend[cust.id] = { name: cust.name, phone: cust.phone, visits: 0, spend: 0, id: cust.id };
      }
      custSpend[cust.id].visits += 1;
      custSpend[cust.id].spend += visit.amount;
    });
    return Object.values(custSpend)
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 5);
  }, [currentVisits, customers]);

  // Day of Week Distribution
  const dayOfWeekStats = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts = new Array(7).fill(0);
    currentVisits.forEach((v) => {
      const dayIdx = new Date(v.created_at).getDay();
      counts[dayIdx]++;
    });
    const maxCount = Math.max(...counts, 1);
    return days.map((day, i) => ({ day, count: counts[i], pct: Math.round((counts[i] / maxCount) * 100) }));
  }, [currentVisits]);

  // Hour Distribution
  const hourStats = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const counts = new Array(24).fill(0);
    currentVisits.forEach((v) => {
      const hour = new Date(v.created_at).getHours();
      counts[hour]++;
    });
    const maxCount = Math.max(...counts, 1);
    return hours.map((h) => ({
      hour: h,
      label: `${h}:00`,
      count: counts[h],
      pct: Math.round((counts[h] / maxCount) * 100),
    }));
  }, [currentVisits]);

  const peakHour = useMemo(() => {
    const sorted = [...hourStats].sort((a, b) => b.count - a.count);
    return sorted[0];
  }, [hourStats]);

  const handleExportCSV = () => {
    let csv = "Customer Name,Phone,Segment,Total Visits,Total Spend,Avg Bill,Last Visit Date\n";
    customers.forEach((c) => {
      csv += `"${c.name}","${c.phone}","${c.segment}",${c.total_visits},${c.total_spend},${c.avg_bill || 0},"${c.last_visit_date || ""}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `analytics-export-${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isSalon) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
        <SalonAnalytics />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] animate-fade-in">
      {/* Mobile-First Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-[#EAECF0]">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6C4DFF]/10 border border-[#6C4DFF]/20 text-[#6C4DFF]">
                <BarChart3 className="h-4.5 w-4.5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black text-[#111439] tracking-tight">Analytics</h1>
                <p className="text-[10px] text-[#667085] font-medium hidden sm:block">Business intelligence & insights</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.location.reload()}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#EAECF0] bg-white text-[#667085] hover:bg-[#F8F8F9] hover:text-[#111439] transition-all"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={handleExportCSV}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#EAECF0] bg-white text-[#667085] hover:bg-[#F8F8F9] hover:text-[#111439] transition-all"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto pb-3 -mb-px scrollbar-hide">
            {TAB_OPTIONS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-[#6C4DFF] text-white shadow-md shadow-purple-500/25"
                      : "bg-[#F4F5F7] text-[#667085] hover:bg-[#EAECF0] hover:text-[#111439]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-4 space-y-5 max-w-7xl mx-auto">
        {/* Date Range Filter - Horizontal Scroll Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { key: "today" as DateRangeOption, label: "Today" },
            { key: "7days" as DateRangeOption, label: "7 Days" },
            { key: "30days" as DateRangeOption, label: "30 Days" },
            { key: "90days" as DateRangeOption, label: "90 Days" },
            { key: "this_year" as DateRangeOption, label: "This Year" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setDateRange(opt.key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                dateRange === opt.key
                  ? "bg-[#111439] text-white shadow-sm"
                  : "bg-white text-[#667085] border border-[#EAECF0] hover:border-[#D0D5DD]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* ========== OVERVIEW TAB ========== */}
        {activeTab === "overview" && (
          <>
            {/* KPI Cards - 2-col mobile, 3-col tablet, 6-col desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { label: "Revenue", val: formatCurrency(kpis.revenue.value), sub: `vs ${formatCurrency(kpis.revenue.prev)}`, icon: DollarSign, color: "#6C4DFF", bg: "#6C4DFF", pct: kpis.revenue.pct },
                { label: "Visits", val: kpis.visits.value.toString(), sub: `${kpis.visits.prev} previously`, icon: Activity, color: "#3B82F6", bg: "#3B82F6", pct: kpis.visits.pct },
                { label: "Customers", val: kpis.uniqueCustomers.value.toString(), sub: `${kpis.uniqueCustomers.prev} previously`, icon: Users, color: "#16A34A", bg: "#16A34A", pct: kpis.uniqueCustomers.pct },
                { label: "Avg Bill", val: formatCurrency(kpis.avgSpend.value), sub: `vs ${formatCurrency(kpis.avgSpend.prev)}`, icon: Award, color: "#F59E0B", bg: "#F59E0B", pct: kpis.avgSpend.pct },
                { label: "Repeat %", val: `${kpis.returningRate.value}%`, sub: "coming back", icon: Target, color: "#EC4899", bg: "#EC4899", pct: kpis.returningRate.pct },
                { label: "At Risk", val: kpis.atRisk.value.toString(), sub: "need attention", icon: AlertTriangle, color: "#EF4444", bg: "#EF4444", pct: kpis.atRisk.pct },
              ].map((kpi, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#EAECF0] p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-xl`} style={{ backgroundColor: `${kpi.bg}15` }}>
                      <kpi.icon className="h-4 w-4" style={{ color: kpi.color }} />
                    </div>
                    {kpi.pct !== 0 && (
                      <div className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        kpi.label === "At Risk"
                          ? kpi.pct < 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                          : kpi.pct > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                      }`}>
                        {kpi.pct > 0 ? <TrendingUp className="h-2.5 w-2.5" /> : kpi.pct < 0 ? <TrendingDown className="h-2.5 w-2.5" /> : <Minus className="h-2.5 w-2.5" />}
                        {Math.abs(kpi.pct)}%
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-black text-[#111439] tracking-tight">{kpi.val}</p>
                    <p className="text-[10px] text-[#667085] font-medium mt-0.5">{kpi.sub}</p>
                  </div>
                  <p className="text-[10px] font-bold text-[#667085] uppercase tracking-wider">{kpi.label}</p>
                </div>
              ))}
            </div>

            {/* Revenue Chart - Interactive */}
            <div className="bg-white rounded-2xl border border-[#EAECF0] p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-[#111439]">Revenue Trend</h2>
                  <p className="text-[10px] text-[#667085] mt-0.5">Daily revenue for selected period</p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#6C4DFF]" /> Current</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#EAECF0]" /> Previous</span>
                </div>
              </div>

              {/* Chart */}
              <div className="relative h-48 sm:h-56">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-6 w-10 flex flex-col justify-between text-[9px] text-[#94A3B8] font-medium">
                  <span>{formatCurrency(maxRevenue)}</span>
                  <span>{formatCurrency(maxRevenue / 2)}</span>
                  <span>₹0</span>
                </div>

                {/* Bars */}
                <div className="ml-12 h-full flex items-end gap-[2px] sm:gap-1 relative">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="border-b border-dashed border-[#EAECF0]" />
                    ))}
                  </div>

                  {timelineData.map((item, idx) => {
                    const height = (item.amount / maxRevenue) * 100;
                    const prevHeight = (item.prevAmount / maxRevenue) * 100;
                    const isHovered = hoveredBar === idx;
                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col justify-end relative group cursor-pointer"
                        onMouseEnter={() => setHoveredBar(idx)}
                        onMouseLeave={() => setHoveredBar(null)}
                        onTouchStart={() => setHoveredBar(idx)}
                      >
                        {/* Tooltip */}
                        {isHovered && (
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10 bg-[#111439] text-white rounded-lg px-2.5 py-1.5 text-[10px] font-bold whitespace-nowrap shadow-lg animate-fade-in">
                            <p>{item.label}</p>
                            <p className="text-[#6C4DFF]">{formatCurrency(item.amount)}</p>
                            <p className="text-white/60">{item.visits} visits</p>
                          </div>
                        )}
                        {/* Previous period bar */}
                        <div
                          className="w-full bg-[#EAECF0] rounded-t-sm transition-all"
                          style={{ height: `${Math.max(2, prevHeight)}%` }}
                        />
                        {/* Current period bar */}
                        <div
                          className="w-full rounded-t-md transition-all absolute bottom-0"
                          style={{
                            height: `${Math.max(3, height)}%`,
                            backgroundColor: isHovered ? "#5835EA" : "#6C4DFF",
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* X-axis labels */}
                <div className="ml-12 flex justify-between mt-2">
                  {timelineData.filter((_, i) => {
                    const interval = Math.max(1, Math.floor(timelineData.length / 6));
                    return i % interval === 0 || i === timelineData.length - 1;
                  }).map((item, i) => (
                    <span key={i} className="text-[9px] text-[#94A3B8] font-medium">{item.label}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Segments + Top Customers Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Customer Segments */}
              <div className="bg-white rounded-2xl border border-[#EAECF0] p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-[#111439]">Customer Segments</h2>
                    <p className="text-[10px] text-[#667085] mt-0.5">Distribution by retention stage</p>
                  </div>
                  <Link href="/customers" className="text-[10px] font-bold text-[#6C4DFF] flex items-center gap-0.5 hover:underline">
                    View All <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {segmentStats.map((s) => {
                    const Icon = s.icon;
                    return (
                      <div key={s.key} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                          <Icon className="h-4 w-4" style={{ color: s.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-[#111439]">{s.name}</span>
                            <span className="text-xs font-bold text-[#111439] tabular-nums">{s.count} <span className="text-[#94A3B8] font-medium">({s.pct}%)</span></span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-[#F4F5F7] overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Customers */}
              <div className="bg-white rounded-2xl border border-[#EAECF0] p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-[#111439]">Top Customers</h2>
                    <p className="text-[10px] text-[#667085] mt-0.5">Highest spenders this period</p>
                  </div>
                  <Link href="/customers" className="text-[10px] font-bold text-[#6C4DFF] flex items-center gap-0.5 hover:underline">
                    View All <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
                {topCustomers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="h-12 w-12 rounded-2xl bg-[#F4F5F7] flex items-center justify-center mb-3 text-[#94A3B8]">
                      <Users className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-bold text-[#111439]">No data yet</p>
                    <p className="text-[10px] text-[#667085] mt-0.5">Record visits to see top customers</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {topCustomers.map((c, i) => (
                      <div key={c.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F8F8F9] transition-colors">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-xl font-bold text-xs text-white shrink-0 ${
                          i === 0 ? "bg-[#6C4DFF]" : i === 1 ? "bg-[#3B82F6]" : i === 2 ? "bg-[#16A34A]" : "bg-[#94A3B8]"
                        }`}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#111439] truncate">{c.name}</p>
                          <p className="text-[10px] text-[#667085]">{c.visits} visits</p>
                        </div>
                        <span className="text-xs font-bold text-[#111439] tabular-nums">{formatCurrency(c.spend)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ========== BEHAVIOR TAB ========== */}
        {activeTab === "behavior" && (
          <>
            {/* Day of Week Distribution */}
            <div className="bg-white rounded-2xl border border-[#EAECF0] p-4 sm:p-5 shadow-xs">
              <div className="mb-4">
                <h2 className="text-sm font-bold text-[#111439]">Visit Distribution by Day</h2>
                <p className="text-[10px] text-[#667085] mt-0.5">Which days get the most traffic</p>
              </div>
              <div className="flex items-end gap-2 h-32">
                {dayOfWeekStats.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-[9px] font-bold text-[#111439] tabular-nums">{d.count}</span>
                    <div className="w-full rounded-t-lg transition-all" style={{ height: `${Math.max(4, d.pct)}%`, backgroundColor: d.pct > 70 ? "#6C4DFF" : d.pct > 40 ? "#3B82F6" : "#EAECF0" }} />
                    <span className="text-[10px] font-bold text-[#667085]">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Peak Hours */}
            <div className="bg-white rounded-2xl border border-[#EAECF0] p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-[#111439]">Peak Hours</h2>
                  <p className="text-[10px] text-[#667085] mt-0.5">Busiest times of the day</p>
                </div>
                {peakHour && (
                  <div className="flex items-center gap-1.5 bg-[#6C4DFF]/10 px-2.5 py-1 rounded-lg">
                    <Zap className="h-3 w-3 text-[#6C4DFF]" />
                    <span className="text-[10px] font-bold text-[#6C4DFF]">Peak: {peakHour.label}</span>
                  </div>
                )}
              </div>
              <div className="flex items-end gap-[2px] h-24">
                {hourStats.filter((_, i) => i >= 6 && i <= 22).map((h) => (
                  <div key={h.hour} className="flex-1 flex flex-col items-center justify-end">
                    <div
                      className="w-full rounded-t-sm transition-all"
                      style={{
                        height: `${Math.max(2, h.pct)}%`,
                        backgroundColor: h.count === peakHour?.count ? "#6C4DFF" : h.pct > 50 ? "#3B82F6" : "#EAECF0",
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 px-1">
                <span className="text-[9px] text-[#94A3B8]">6 AM</span>
                <span className="text-[9px] text-[#94A3B8]">12 PM</span>
                <span className="text-[9px] text-[#94A3B8]">6 PM</span>
                <span className="text-[9px] text-[#94A3B8]">10 PM</span>
              </div>
            </div>

            {/* Visit Frequency */}
            <div className="bg-white rounded-2xl border border-[#EAECF0] p-4 sm:p-5 shadow-xs">
              <div className="mb-4">
                <h2 className="text-sm font-bold text-[#111439]">Visit Frequency</h2>
                <p className="text-[10px] text-[#667085] mt-0.5">How often customers return</p>
              </div>
              <div className="space-y-3">
                {[
                  { label: "1 visit (One-time)", count: customers.filter((c) => c.total_visits === 1).length, color: "#EF4444" },
                  { label: "2-3 visits", count: customers.filter((c) => c.total_visits >= 2 && c.total_visits <= 3).length, color: "#F59E0B" },
                  { label: "4-6 visits", count: customers.filter((c) => c.total_visits >= 4 && c.total_visits <= 6).length, color: "#3B82F6" },
                  { label: "7+ visits (Loyal)", count: customers.filter((c) => c.total_visits >= 7).length, color: "#16A34A" },
                ].map((freq, i) => {
                  const maxFreq = Math.max(...[
                    customers.filter((c) => c.total_visits === 1).length,
                    customers.filter((c) => c.total_visits >= 2 && c.total_visits <= 3).length,
                    customers.filter((c) => c.total_visits >= 4 && c.total_visits <= 6).length,
                    customers.filter((c) => c.total_visits >= 7).length,
                  ], 1);
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-28 sm:w-36">
                        <span className="text-xs font-bold text-[#111439]">{freq.label}</span>
                      </div>
                      <div className="flex-1 h-2 rounded-full bg-[#F4F5F7] overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(freq.count / maxFreq) * 100}%`, backgroundColor: freq.color }} />
                      </div>
                      <span className="text-xs font-bold text-[#111439] tabular-nums w-8 text-right">{freq.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ========== PATTERNS TAB ========== */}
        {activeTab === "patterns" && (
          <>
            {/* Spending Distribution */}
            <div className="bg-white rounded-2xl border border-[#EAECF0] p-4 sm:p-5 shadow-xs">
              <div className="mb-4">
                <h2 className="text-sm font-bold text-[#111439]">Spending Patterns</h2>
                <p className="text-[10px] text-[#667085] mt-0.5">Bill amount distribution across visits</p>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Under ₹200", min: 0, max: 200, color: "#EAECF0" },
                  { label: "₹200 - ₹500", min: 200, max: 500, color: "#3B82F6" },
                  { label: "₹500 - ₹1000", min: 500, max: 1000, color: "#6C4DFF" },
                  { label: "₹1000 - ₹2500", min: 1000, max: 2500, color: "#8B5CF6" },
                  { label: "₹2500+", min: 2500, max: Infinity, color: "#16A34A" },
                ].map((bracket, i) => {
                  const count = currentVisits.filter((v) => v.amount >= bracket.min && v.amount < bracket.max).length;
                  const maxCount = Math.max(...[
                    currentVisits.filter((v) => v.amount >= 0 && v.amount < 200).length,
                    currentVisits.filter((v) => v.amount >= 200 && v.amount < 500).length,
                    currentVisits.filter((v) => v.amount >= 500 && v.amount < 1000).length,
                    currentVisits.filter((v) => v.amount >= 1000 && v.amount < 2500).length,
                    currentVisits.filter((v) => v.amount >= 2500).length,
                  ], 1);
                  const pct = currentVisits.length > 0 ? Math.round((count / currentVisits.length) * 100) : 0;
                  return (
                    <div key={i} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#111439]">{bracket.label}</span>
                        <span className="text-[10px] font-bold text-[#667085]">{count} visits ({pct}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#F4F5F7] overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(count / maxCount) * 100}%`, backgroundColor: bracket.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Retention Funnel */}
            <div className="bg-white rounded-2xl border border-[#EAECF0] p-4 sm:p-5 shadow-xs">
              <div className="mb-4">
                <h2 className="text-sm font-bold text-[#111439]">Retention Funnel</h2>
                <p className="text-[10px] text-[#667085] mt-0.5">Customer journey from first visit to loyalty</p>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Total Customers", count: customers.length, color: "#6C4DFF", icon: Users },
                  { label: "Visited 2+ times", count: customers.filter((c) => c.total_visits >= 2).length, color: "#3B82F6", icon: UserCheck },
                  { label: "Visited 5+ times", count: customers.filter((c) => c.total_visits >= 5).length, color: "#16A34A", icon: Heart },
                  { label: "Active (last 30 days)", count: customers.filter((c) => c.last_visit_date && (Date.now() - new Date(c.last_visit_date).getTime()) < 30 * 86400000).length, color: "#EC4899", icon: Zap },
                ].map((step, i) => {
                  const Icon = step.icon;
                  const widthPct = customers.length > 0 ? (step.count / customers.length) * 100 : 0;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0" style={{ backgroundColor: `${step.color}15` }}>
                        <Icon className="h-3.5 w-3.5" style={{ color: step.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold text-[#111439]">{step.label}</span>
                          <span className="text-[11px] font-bold text-[#111439] tabular-nums">{step.count}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[#F4F5F7] overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${widthPct}%`, backgroundColor: step.color }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ========== REVENUE TAB ========== */}
        {activeTab === "revenue" && (
          <>
            {/* Revenue Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl border border-[#EAECF0] p-4 shadow-xs">
                <p className="text-[10px] font-bold text-[#667085] uppercase tracking-wider">Total Revenue</p>
                <p className="text-xl font-black text-[#111439] mt-1 tabular-nums">{formatCurrency(kpis.revenue.value)}</p>
                <div className={`flex items-center gap-0.5 mt-1 text-[10px] font-bold ${kpis.revenue.pct >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {kpis.revenue.pct >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                  {Math.abs(kpis.revenue.pct)}% vs previous
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-[#EAECF0] p-4 shadow-xs">
                <p className="text-[10px] font-bold text-[#667085] uppercase tracking-wider">Avg per Visit</p>
                <p className="text-xl font-black text-[#111439] mt-1 tabular-nums">{formatCurrency(kpis.avgSpend.value)}</p>
                <div className={`flex items-center gap-0.5 mt-1 text-[10px] font-bold ${kpis.avgSpend.pct >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {kpis.avgSpend.pct >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                  {Math.abs(kpis.avgSpend.pct)}% vs previous
                </div>
              </div>
            </div>

            {/* Revenue by Segment */}
            <div className="bg-white rounded-2xl border border-[#EAECF0] p-4 sm:p-5 shadow-xs">
              <div className="mb-4">
                <h2 className="text-sm font-bold text-[#111439]">Revenue by Segment</h2>
                <p className="text-[10px] text-[#667085] mt-0.5">Which customer groups drive the most revenue</p>
              </div>
              <div className="space-y-3">
                {segmentStats.filter((s) => s.revenue > 0).sort((a, b) => b.revenue - a.revenue).map((s) => {
                  const maxRev = Math.max(...segmentStats.map((x) => x.revenue), 1);
                  return (
                    <div key={s.key} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#111439]">{s.name}</span>
                        <span className="text-xs font-bold text-[#111439] tabular-nums">{formatCurrency(s.revenue)}</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#F4F5F7] overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(s.revenue / maxRev) * 100}%`, backgroundColor: s.color }} />
                      </div>
                    </div>
                  );
                })}
                {segmentStats.filter((s) => s.revenue > 0).length === 0 && (
                  <div className="flex flex-col items-center py-6 text-center">
                    <DollarSign className="h-8 w-8 text-[#94A3B8] mb-2" />
                    <p className="text-xs font-bold text-[#111439]">No revenue data</p>
                    <p className="text-[10px] text-[#667085]">Record visits to see revenue breakdown</p>
                  </div>
                )}
              </div>
            </div>

            {/* Revenue Timeline (Full Width) */}
            <div className="bg-white rounded-2xl border border-[#EAECF0] p-4 sm:p-5 shadow-xs">
              <div className="mb-4">
                <h2 className="text-sm font-bold text-[#111439]">Revenue Over Time</h2>
                <p className="text-[10px] text-[#667085] mt-0.5">Daily revenue trend comparison</p>
              </div>
              <div className="h-40 flex items-end gap-1">
                {timelineData.map((item, idx) => {
                  const height = (item.amount / maxRevenue) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col justify-end">
                      <div className="w-full rounded-t-md bg-[#6C4DFF] transition-all" style={{ height: `${Math.max(3, height)}%` }} />
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Search Filter (Global) */}
        {globalSearch && (
          <div className="bg-white rounded-2xl border border-[#EAECF0] p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Search className="h-4 w-4 text-[#6C4DFF]" />
              <span className="text-xs font-bold text-[#111439]">Search Results for &quot;{globalSearch}&quot;</span>
            </div>
            <div className="space-y-2">
              {customers
                .filter((c) => c.name.toLowerCase().includes(globalSearch.toLowerCase()) || c.phone.includes(globalSearch))
                .slice(0, 5)
                .map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F8F8F9] transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-[#6C4DFF]/10 flex items-center justify-center text-[10px] font-bold text-[#6C4DFF]">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#111439]">{c.name}</p>
                        <p className="text-[10px] text-[#667085]">{c.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#111439]">{formatCurrency(c.total_spend)}</p>
                      <p className="text-[10px] text-[#667085]">{c.total_visits} visits</p>
                    </div>
                  </div>
                ))}
              {customers.filter((c) => c.name.toLowerCase().includes(globalSearch.toLowerCase()) || c.phone.includes(globalSearch)).length === 0 && (
                <p className="text-xs text-[#667085] text-center py-4">No customers found</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
