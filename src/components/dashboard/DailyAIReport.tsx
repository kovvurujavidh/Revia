// Importers/Callers: Dashboard page (src/app/dashboard/page.tsx).
// Affected API: AI Intelligence report presentation card.
// Data Schemas: DailyAIReportData from src/lib/types.ts.
// User's Verbatim Instruction: "AFTER LOGIN THE LEFT SIDE BAR IS GOOD NOT FIT FOR MOBILE OK SEE THE WHOLE DOT CHANGECONCEPTOR CODE PLESE CHECH MOBILE FRENDLY AND THE COLORS WE CHOOSE NOW AND REQUIREMETS DOC IS DIFFERENT KEEP ANIMATIONS ONLY CHANGE COLORS TO MACTH PRODUCTION LEVEL WEBSITE"

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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#EAECF0] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6C4DFF]/10 border border-[#6C4DFF]/20 text-[#6C4DFF]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#111439] tracking-tight">
                  Daily AI Retention Intelligence
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#16A34A]/10 border border-[#16A34A]/20 px-2 py-0.5 text-[10px] font-bold text-[#16A34A]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                  Live Generated
                </span>
              </div>
              <p className="text-xs text-[#667085] mt-0.5">{report.date}</p>
            </div>
          </div>

          <Link
            href="/opportunities"
            className="inline-flex items-center gap-1.5 rounded-xl brand-gradient px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-purple-500/20 hover:shadow-purple-500/35 hover:opacity-95 transition-all btn-interactive"
          >
            <span>Take Action</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Summary Box */}
        <div className="mt-4 rounded-xl bg-[#F8F8F9] border border-[#EAECF0] p-4 text-[#111439]">
          <p className="text-xs sm:text-sm font-medium leading-relaxed">
            {report.summary}
          </p>
        </div>

        {/* Risk Alert if any */}
        {report.risk_alert && (
          <div className="mt-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/25 p-3.5 text-xs text-[#EF4444] font-bold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-[#EF4444]" />
            <span>{report.risk_alert}</span>
          </div>
        )}

        {/* Grid: Key Observations & Recommended Actions */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Key Observations / Changes */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#667085] uppercase tracking-wider">
              <Lightbulb className="h-3.5 w-3.5 text-[#F59E0B]" />
              <span>Key Observations &amp; Trends</span>
            </div>
            <ul className="space-y-2">
              {report.key_changes.concat(report.trends).slice(0, 4).map((change, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-[#111439] font-medium leading-relaxed"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-[#6C4DFF] mt-1.5 shrink-0 shadow-sm shadow-purple-500/30" />
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Actions */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#667085] uppercase tracking-wider">
              <Zap className="h-3.5 w-3.5 text-[#6C4DFF]" />
              <span>Recommended Priority Actions</span>
            </div>
            <ul className="space-y-2">
              {report.recommended_actions.map((action, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs font-medium leading-relaxed p-2.5 rounded-xl bg-[#FFFFFF] border border-[#EAECF0] hover:bg-[#F8F8F9] hover:border-[#D0D5DD] transition-all shadow-xs"
                >
                  <CheckCircle2 className="h-4 w-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-[#111439]">{action.title}</p>
                    <p className="text-[11px] text-[#667085] mt-0.5 leading-normal">{action.description}</p>
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
