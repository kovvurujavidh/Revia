"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { formatDistanceToNow } from "date-fns";
import { History, User as UserIcon, Tag } from "lucide-react";
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
    <div className="rounded-2xl border border-[#E8E8ED] bg-white p-5 sm:p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 border-b border-[#E8E8ED] pb-4">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-[#667085]" />
          <h2 className="text-sm font-bold text-[#111439]">Recent Visits Feed</h2>
        </div>
        <Link
          href="/reports"
          className="text-xs font-semibold text-[#6C4DFF] hover:underline"
        >
          View All
        </Link>
      </div>

      {recentVisits.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <History className="h-10 w-10 text-[#E8E8ED] mb-3" />
          <p className="text-sm font-semibold text-[#111439]">No visits yet.</p>
          <p className="text-xs text-[#667085] mt-1">
            Log a visit from the + button to see it here.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
          {recentVisits.map((visit) => {
            const customer = customers.find((c) => c.id === visit.customer_id);
            const isAnonymous = !customer;

            return (
              <div
                key={visit.id}
                className="flex items-start justify-between rounded-xl hover:bg-[#F8F8F9] p-2 -mx-2 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8E8ED] text-[#667085]">
                    <UserIcon className="h-4 w-4" />
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
                        <Tag className="h-3 w-3" />
                        <span>{visit.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex rounded-lg bg-[#16A34A]/10 px-2.5 py-1 text-xs font-bold text-[#16A34A]">
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
