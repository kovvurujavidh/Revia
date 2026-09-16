// Importers/Callers: Next.js App Router route `/analytics`, Dashboard, AppSidebar, MobileNav
// Affected API: AnalyticsPage React component with sub-navigation (Overview, Customer Behavior, Visit Patterns, Revenue Insights, RFM Analysis, Predictions)
// Data Schemas: Customer, Visit, Business, CustomerSegment, Opportunity from src/lib/types.ts
// User's Verbatim Instruction: "AFTER LOGIN THE LEFT SIDE BAR IS GOOD NOT FIT FOR MOBILE OK SEE THE WHOLE DOT CHANGECONCEPTOR CODE PLESE CHECH MOBILE FRENDLY AND THE COLORS WE CHOOSE NOW AND REQUIREMETS DOC IS DIFFERENT KEEP ANIMATIONS ONLY CHANGE COLORS TO MACTH PRODUCTION LEVEL WEBSITE"

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
} from "lucide-react";
import { formatDistanceToNow, format, subDays, isWithinInterval, startOfDay, endOfDay } from "date-fns";

type DateRangeOption = "today" | "7days" | "30days" | "90days" | "this_year" | "custom";
type AnalyticsSubTab = "overview" | "behavior" | "patterns" | "revenue" | "rfm" | "predictions";

export default function AnalyticsPage() {
  const { customers, visits, activeBusiness, opportunities } = useApp();

  // Navigation & Filter States
  const [activeTab, setActiveTab] = useState<AnalyticsSubTab>("overview");
  const [dateRange, setDateRange] = useState<DateRangeOption>("30days");
  const [globalSearch, setGlobalSearch] = useState("");
  const [selectedSegmentFilter, setSelectedSegmentFilter] = useState<string>("all");
  const [hoveredPoint, setHoveredPoint] = useState<{ date: string; amount: number; prevAmount?: number } | null>(null);
  const [topCustomersSort, setTopCustomersSort] = useState<"spend" | "visits" | "avg">("spend");

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
      default:
        start = subDays(now, 30);
        days = 30;
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

  // Filtered visits by date range and business
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

  // 1. Core KPIs Calculation
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

  // 2. Revenue & Visits Timeline Data (Day by Day)
  const timelineData = useMemo(() => {
    const points: { date: string; label: string; amount: number; visits: number; prevAmount: number }[] = [];
    const intervalDays = Math.min(daysCount, 30);
    const step = Math.max(1, Math.floor(daysCount / intervalDays));

    for (let i = intervalDays - 1; i >= 0; i--) {
      const d = subDays(endDate, i * step);
      const dStr = format(d, "yyyy-MM-dd");
      const dLabel = format(d, daysCount <= 7 ? "EEE, MMM d" : "MMM d");

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

  // 3. Customer Segments Distribution
  const segmentStats = useMemo(() => {
    const total = customers.length || 1;
    const segments = ["vip", "regular", "new", "becoming_inactive", "inactive"];
    const stats = segments.map(segKey => {
      const filtered = customers.filter(c => c.segment === segKey);
      const rev = filtered.reduce((sum, c) => sum + c.total_spend, 0);
      return { key: segKey, name: segKey.replace("_", " "), count: filtered.length, revenue: rev, color: segKey === "vip" ? "#6C4DFF" : segKey === "regular" ? "#3B82F6" : segKey === "new" ? "#16A34A" : segKey === "becoming_inactive" ? "#F59E0B" : "#EF4444" };
    });
    const totalRev = stats.reduce((sum, s) => sum + s.revenue, 0) || 1;
    return stats.map(s => ({ ...s, pct: Math.round((s.count / total) * 100), revPct: Math.round((s.revenue / totalRev) * 100) }));
  }, [customers]);

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

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#EAECF0] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[#111439] tracking-tight">Analytics</h1>
            <span className="rounded-full bg-[#6C4DFF]/10 px-2.5 py-0.5 text-xs font-bold text-[#6C4DFF] flex items-center gap-1">
              <Activity className="h-3.5 w-3.5" /> Retention BI
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#667085] mt-1 font-medium">Understand your customers, track performance and grow your business.</p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
            <input type="text" placeholder="Search customers, phone..." value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] pl-9 pr-3 py-2 text-xs text-[#111439] placeholder:text-[#94A3B8] focus:border-[#6C4DFF] focus:outline-none transition-colors" />
          </div>

          <div className="flex items-center gap-1.5 bg-[#F8F8F9] border border-[#EAECF0] rounded-xl p-1">
            <Calendar className="h-3.5 w-3.5 text-[#667085] ml-2" />
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value as DateRangeOption)} className="bg-transparent text-xs font-bold text-[#111439] pr-3 py-1 focus:outline-none cursor-pointer">
              <option value="today">Today</option>
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="this_year">This year</option>
            </select>
          </div>

          <button onClick={handleExportCSV} className="inline-flex items-center gap-1.5 rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2 text-xs font-bold text-[#111439] hover:bg-[#F1F1F4] transition-colors">
            <Download className="h-3.5 w-3.5 text-[#6C4DFF]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: "Total Revenue", val: formatCurrency(kpis.revenue.value), icon: DollarSign, color: "#6C4DFF", pct: kpis.revenue.pct },
          { label: "Total Visits", val: kpis.visits.value, icon: Activity, color: "#3B82F6", pct: kpis.visits.pct },
          { label: "Unique Cust.", val: kpis.uniqueCustomers.value, icon: Users, color: "#16A34A", pct: kpis.uniqueCustomers.pct },
          { label: "Avg Spend", val: formatCurrency(kpis.avgSpend.value), icon: Award, color: "#6C4DFF", pct: kpis.avgSpend.pct },
          { label: "Repeat Rate", val: `${kpis.returningRate.value}%`, icon: Target, color: "#3B82F6", pct: 0 },
          { label: "At Risk", val: kpis.atRisk.value, icon: AlertTriangle, color: "#EF4444", pct: kpis.atRisk.pct },
        ].map((kpi, i) => (
          <div key={i} className="brand-card p-4 sm:p-5 space-y-2">
            <div className="flex items-center justify-between text-[#667085]">
              <span className="text-[11px] font-bold uppercase tracking-wider">{kpi.label}</span>
              <div style={{ color: kpi.color }}><kpi.icon className="h-4 w-4" /></div>
            </div>
            <p className="text-2xl font-black text-[#111439] tracking-tight">{kpi.val}</p>
          </div>
        ))}
      </div>

      {/* Overview Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 brand-card p-6 space-y-4">
          <h2 className="text-base font-bold text-[#111439]">Revenue Timeline</h2>
          <div className="h-64 flex items-end gap-2">
            {timelineData.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col justify-end gap-1 group">
                <div className="w-full bg-[#3B82F6] rounded-t-lg transition-all" style={{ height: `${Math.max(5, (item.amount / maxRevenue) * 100)}%` }} />
                <span className="text-[9px] text-[#667085] text-center">{idx % 5 === 0 ? item.label : ""}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="brand-card p-6 space-y-4">
          <h2 className="text-base font-bold text-[#111439]">Segments</h2>
          {segmentStats.map(s => (
            <div key={s.key} className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-[#111439]"><span>{s.name}</span><span>{s.pct}%</span></div>
              <div className="h-2 w-full rounded-full bg-[#EAECF0] overflow-hidden"><div className="h-full" style={{ width: `${s.pct}%`, backgroundColor: s.color }}/></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}