// Importers/Callers: src/app/dashboard/page.tsx
// Affected API: RecentVisits React component
// Data Schemas: Visit, Customer, Business from src/lib/types.ts
// User's Verbatim Instruction: "AFTER LOGIN THE LEFT SIDE BAR IS GOOD NOT FIT FOR MOBILE OK SEE THE WHOLE DOT CHANGECONCEPTOR CODE PLESE CHECH MOBILE FRENDLY AND THE COLORS WE CHOOSE NOW AND REQUIREMETS DOC IS DIFFERENT KEEP ANIMATIONS ONLY CHANGE COLORS TO MACTH PRODUCTION LEVEL WEBSITE"

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
      <div className="flex items-center justify-between mb-4 border-b border-[#EAECF0] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#6C4DFF]/10 border border-[#6C4DFF]/20 text-[#6C4DFF]">
            <History className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#111439] tracking-tight">Recent Visits Feed</h2>
            <p className="text-[11px] text-[#667085]">Live store activity</p>
          </div>
        </div>
        <Link
          href="/reports"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#6C4DFF] hover:text-[#5835ea] transition-colors group"
        >
          <span>View All</span>
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      {recentVisits.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <div className="h-12 w-12 rounded-2xl bg-[#F8F8F9] border border-[#EAECF0] flex items-center justify-center mb-3 text-[#94A3B8]">
            <History className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold text-[#111439]">No visits yet.</p>
          <p className="text-xs text-[#667085] mt-1">
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
                className="flex items-start justify-between rounded-xl bg-[#F8F8F9] border border-[#EAECF0] hover:bg-[#FFFFFF] hover:border-[#D0D5DD] hover:shadow-xs p-3 transition-all duration-200 group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FFFFFF] border border-[#EAECF0] text-[#667085] group-hover:text-[#6C4DFF] group-hover:border-[#6C4DFF]/30 transition-colors shadow-xs">
                    <UserIcon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#111439]">
                      {isAnonymous ? "Anonymous Walk-in" : customer.name}
                    </p>
                    <p className="text-[11px] text-[#667085] mt-0.5">
                      {formatDistanceToNow(new Date(visit.created_at), { addSuffix: true })}
                    </p>
                    {visit.notes && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-[#667085]">
                        <Tag className="h-3 w-3 text-[#94A3B8]" />
                        <span>{visit.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex rounded-lg bg-[#16A34A]/10 border border-[#16A34A]/25 px-2.5 py-1 text-xs font-bold text-[#16A34A] tabular-nums">
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
