// Importers/Callers: Dashboard page (src/app/dashboard/page.tsx).
// Affected API: AI Intelligence report presentation card.
// Data Schemas: DailyAIReportData from src/lib/types.ts.
// User's Verbatim Instruction: "https://emilkowal.ski/skill https://github.com/emilkowalski/skills https://www.ui-skills.com/skills INSTALL AND AUTOMATICALLY USE THIS SKILLS AND REDESIGH MY WEBSITE CONCEPT IS SAME CODE IS SAME JUST DESINE AND LOOK IF YOU HAVE PROBLEM MAKE A V1 VERSION AND SAVE ALL OLD VERSION AND USE THE NEW VERSION TO TEST"

"use client";

import React, { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { generateDailyAIReport } from "@/lib/intelligence";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  AlertTriangle,
  Zap,
} from "lucide-react";
import Link from "next/link";

export function DailyAIReport() {
  const { activeBusiness, customers, visits, opportunities, whatsappLogs } = useApp();

  const report = useMemo(() => {
    return generateDailyAIReport(
      activeBusiness,
      customers,
      visits,
      opportunities,
      whatsappLogs
    );
  }, [activeBusiness, customers, visits, opportunities, whatsappLogs]);

  return (
    <div className="brand-card p-6 relative overflow-hidden flex flex-col justify-between h-full">
      {/* Top Accent Gradient Border */}
      <div className="absolute top-0 left-0 right-0 h-[2px] brand-gradient" />

      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Daily AI Retention Intelligence
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Generated
                </span>
              </div>
              <p className="text-xs text-[#71717a] mt-0.5">{report.date}</p>
            </div>
          </div>

          <Link
            href="/opportunities"
            className="inline-flex items-center gap-1.5 rounded-xl brand-gradient px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 hover:opacity-95 transition-all btn-interactive"
          >
            <span>Take Action</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Summary Box */}
        <div className="mt-4 rounded-xl bg-white/[0.03] border border-white/[0.08] p-4">
          <p className="text-xs sm:text-sm font-medium text-white/90 leading-relaxed">
            {report.summary}
          </p>
        </div>

        {/* Risk Alert if any */}
        {report.risk_alert && (
          <div className="mt-3 rounded-xl bg-red-500/10 border border-red-500/25 p-3.5 text-xs text-red-400 font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{report.risk_alert}</span>
          </div>
        )}

        {/* Grid: Key Observations & Recommended Actions */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Key Observations / Changes */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
              <span>Key Observations &amp; Trends</span>
            </div>
            <ul className="space-y-2">
              {report.key_changes.concat(report.trends).slice(0, 4).map((change, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-[#a1a1aa] leading-relaxed"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0 shadow-sm shadow-purple-500" />
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Actions */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Zap className="h-3.5 w-3.5 text-purple-400" />
              <span>Recommended Priority Actions</span>
            </div>
            <ul className="space-y-2">
              {report.recommended_actions.map((action, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-white/90 font-medium leading-relaxed p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">{action.title}</p>
                    <p className="text-[11px] text-[#71717a] mt-0.5 leading-normal">{action.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
