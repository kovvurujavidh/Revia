// Importers/Callers: src/app/dashboard/page.tsx
// Affected API: RecentVisits React component
// Data Schemas: Visit, Customer, Business from src/lib/types.ts
// User's Verbatim Instruction: "https://emilkowal.ski/skill https://github.com/emilkowalski/skills https://www.ui-skills.com/skills INSTALL AND AUTOMATICALLY USE THIS SKILLS AND REDESIGH MY WEBSITE CONCEPT IS SAME CODE IS SAME JUST DESINE AND LOOK IF YOU HAVE PROBLEM MAKE A V1 VERSION AND SAVE ALL OLD VERSION AND USE THE NEW VERSION TO TEST"

"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { formatDistanceToNow } from "date-fns";
import { History, User as UserIcon, Tag, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function RecentVisits() {
  const { visits, customers, activeBusiness } = useApp();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: activeBusiness.currency || "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const recentVisits = [...visits]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  return (
    <div className="brand-card p-5 sm:p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/25 text-purple-400">
            <History className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">Recent Visits Feed</h2>
            <p className="text-[11px] text-[#71717a]">Live store activity</p>
          </div>
        </div>
        <Link
          href="/reports"
          className="inline-flex items-center gap-1 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors group"
        >
          <span>View All</span>
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      {recentVisits.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <div className="h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3 text-[#52525b]">
            <History className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-white">No visits yet.</p>
          <p className="text-xs text-[#71717a] mt-1">
            Log a visit from the + button to see it here.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 max-h-[380px]">
          {recentVisits.map((visit) => {
            const customer = customers.find((c) => c.id === visit.customer_id);
            const isAnonymous = !customer;

            return (
              <div
                key={visit.id}
                className="flex items-start justify-between rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.06] hover:border-white/[0.08] p-3 transition-all duration-200 group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] border border-white/[0.08] text-[#a1a1aa] group-hover:text-purple-400 group-hover:border-purple-500/30 transition-colors">
                    <UserIcon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      {isAnonymous ? "Anonymous Walk-in" : customer.name}
                    </p>
                    <p className="text-[11px] text-[#71717a] mt-0.5">
                      {formatDistanceToNow(new Date(visit.created_at), { addSuffix: true })}
                    </p>
                    {visit.notes && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-[#a1a1aa]">
                        <Tag className="h-3 w-3 text-[#71717a]" />
                        <span>{visit.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex rounded-lg bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-1 text-xs font-bold text-emerald-400 tabular-nums">
                    {formatCurrency(visit.amount)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
