// Importers/Callers: src/app/dashboard/page.tsx
// Affected API: MetricsGrid React component
// Data Schemas: Customer, Visit, Opportunity, Business from src/lib/types.ts
// User's Verbatim Instruction: "https://emilkowal.ski/skill https://github.com/emilkowalski/skills https://www.ui-skills.com/skills INSTALL AND AUTOMATICALLY USE THIS SKILLS AND REDESIGH MY WEBSITE CONCEPT IS SAME CODE IS SAME JUST DESINE AND LOOK IF YOU HAVE PROBLEM MAKE A V1 VERSION AND SAVE ALL OLD VERSION AND USE THE NEW VERSION TO TEST"

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
      colorClass: "text-blue-400",
      bgClass: "bg-blue-500/10 border border-blue-500/20",
    },
    {
      title: "Total Customers",
      value: totalCustomers.toLocaleString(),
      icon: Users,
      trend: "+12",
      isPositive: true,
      subtext: "this week",
      colorClass: "text-purple-400",
      bgClass: "bg-purple-500/10 border border-purple-500/20",
    },
    {
      title: "Avg. Customer Spend",
      value: formatCurrency(avgSpend),
      icon: Activity,
      trend: "+5%",
      isPositive: true,
      subtext: "vs last month",
      colorClass: "text-emerald-400",
      bgClass: "bg-emerald-500/10 border border-emerald-500/20",
    },
    {
      title: "At-Risk Alert",
      value: atRiskCount.toString(),
      icon: AlertTriangle,
      trend: "Action Required",
      isPositive: atRiskCount === 0,
      subtext: "missed exact return cycle",
      colorClass: "text-red-400",
      bgClass: "bg-red-500/10 border border-red-500/20",
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
                  ? "bg-red-500/15 text-red-400 border border-red-500/20"
                  : metric.isPositive
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/15 text-red-400 border border-red-500/20"
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
            <p className="text-[11px] sm:text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
              {metric.title}
            </p>
            <p className="text-xl sm:text-2xl font-black text-white mt-1 tabular-nums tracking-tight">
              {metric.value}
            </p>
            <p className="text-[11px] text-[#71717a] mt-1">{metric.subtext}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
