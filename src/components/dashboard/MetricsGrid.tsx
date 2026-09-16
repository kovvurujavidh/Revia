// Importers/Callers: src/app/dashboard/page.tsx
// Affected API: MetricsGrid React component
// Data Schemas: Customer, Visit, Opportunity, Business from src/lib/types.ts
// User's Verbatim Instruction: "AFTER LOGIN THE LEFT SIDE BAR IS GOOD NOT FIT FOR MOBILE OK SEE THE WHOLE DOT CHANGECONCEPTOR CODE PLESE CHECH MOBILE FRENDLY AND THE COLORS WE CHOOSE NOW AND REQUIREMETS DOC IS DIFFERENT KEEP ANIMATIONS ONLY CHANGE COLORS TO MACTH PRODUCTION LEVEL WEBSITE"

"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import {
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  AlertTriangle,
  Activity,
} from "lucide-react";

export function MetricsGrid() {
  const { customers, visits, opportunities, activeBusiness } = useApp();
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: activeBusiness.currency || "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const todayVisits = visits.filter((v) => isSameDay(new Date(v.created_at), now));
  const yesterdayVisits = visits.filter((v) => isSameDay(new Date(v.created_at), yesterday));

  const todayRevenue = todayVisits.reduce((sum, v) => sum + v.amount, 0);
  const yesterdayRevenue = yesterdayVisits.reduce((sum, v) => sum + v.amount, 0);
  const revenueGrowth = yesterdayRevenue === 0 ? 100 : ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;

  const totalCustomers = customers.length;
  const avgSpend = visits.length > 0 ? visits.reduce((sum, v) => sum + v.amount, 0) / visits.length : 0;

  const atRiskCount = opportunities.filter((o) => o.status === "pending" && o.type === "at_risk").length;

  const metrics = [
    {
      title: "Today's Revenue",
      value: formatCurrency(todayRevenue),
      icon: CreditCard,
      trend: revenueGrowth.toFixed(1) + "%",
      isPositive: revenueGrowth >= 0,
      subtext: "vs yesterday",
      colorClass: "text-[#3B82F6]",
      bgClass: "bg-[#3B82F6]/10 border border-[#3B82F6]/20",
    },
    {
      title: "Total Customers",
      value: totalCustomers.toLocaleString(),
      icon: Users,
      trend: "+12",
      isPositive: true,
      subtext: "this week",
      colorClass: "text-[#6C4DFF]",
      bgClass: "bg-[#6C4DFF]/10 border border-[#6C4DFF]/20",
    },
    {
      title: "Avg. Customer Spend",
      value: formatCurrency(avgSpend),
      icon: Activity,
      trend: "+5%",
      isPositive: true,
      subtext: "vs last month",
      colorClass: "text-[#16A34A]",
      bgClass: "bg-[#16A34A]/10 border border-[#16A34A]/20",
    },
    {
      title: "At-Risk Alert",
      value: atRiskCount.toString(),
      icon: AlertTriangle,
      trend: "Action Required",
      isPositive: atRiskCount === 0,
      subtext: "missed return cycle",
      colorClass: "text-[#EF4444]",
      bgClass: "bg-[#EF4444]/10 border border-[#EF4444]/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {metrics.map((metric, i) => (
        <div key={i} className="brand-card brand-card-hover p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className={`p-2.5 rounded-xl ${metric.bgClass} ${metric.colorClass}`}>
              <metric.icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div
              className={`flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full tabular-nums ${
                metric.title === "At-Risk Alert" && !metric.isPositive
                  ? "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20"
                  : metric.isPositive
                  ? "bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20"
                  : "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20"
              }`}
            >
              {metric.title === "At-Risk Alert" ? null : metric.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{metric.trend}</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-[11px] sm:text-xs font-bold text-[#667085] uppercase tracking-wider">
              {metric.title}
            </p>
            <p className="text-xl sm:text-2xl font-black text-[#111439] mt-1 tabular-nums tracking-tight">
              {metric.value}
            </p>
            <p className="text-[11px] text-[#94A3B8] mt-1 font-medium">{metric.subtext}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
