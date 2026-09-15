// Importers/Callers: Next.js App Router route /dashboard, AppHeader, AppSidebar, MobileNav.
// Affected API: Store Dashboard (KPI grid, AI Daily report, Recent visits feed, Quick Add Staff modal, Counter QR opt-in).
// Data Schemas: Business, Opportunity, StaffMember, User from src/lib/types.ts.
// User's Verbatim Instruction: "https://emilkowal.ski/skill https://github.com/emilkowalski/skills https://www.ui-skills.com/skills INSTALL AND AUTOMATICALLY USE THIS SKILLS AND REDESIGH MY WEBSITE CONCEPT IS SAME CODE IS SAME JUST DESINE AND LOOK IF YOU HAVE PROBLEM MAKE A V1 VERSION AND SAVE ALL OLD VERSION AND USE THE NEW VERSION TO TEST"

"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { DailyAIReport } from "@/components/dashboard/DailyAIReport";
import { RecentVisits } from "@/components/dashboard/RecentVisits";
import { CounterQRCode } from "@/components/add-visit/CounterQRCode";
import {
  PlusCircle,
  Megaphone,
  QrCode,
  ArrowRight,
  UserPlus,
  CheckCircle2,
  Phone,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { activeBusiness, opportunities, addStaffMember } = useApp();
  const [isQROpen, setIsQROpen] = useState(false);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [staffPhone, setStaffPhone] = useState("");
  const [staffRole, setStaffRole] = useState<"staff" | "manager">("staff");
  const [staffSuccessMsg, setStaffSuccessMsg] = useState<string | null>(null);

  const pendingOpportunitiesCount = opportunities.filter(
    (o) => o.status === "pending"
  ).length;

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim() || !staffPhone.trim()) return;

    addStaffMember({
      name: staffName.trim(),
      phone: staffPhone.trim(),
      email: `${staffName.trim().toLowerCase().replace(/\s+/g, ".")}@${activeBusiness.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
      role: staffRole,
      status: "active",
      business_id: activeBusiness.id,
    });

    setStaffSuccessMsg(`Staff member ${staffName} added! They can now log in at /auth/login with ${staffPhone}.`);
    setStaffName("");
    setStaffPhone("");

    setTimeout(() => {
      setStaffSuccessMsg(null);
      setIsAddStaffOpen(false);
    }, 2800);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Modal for QR Code */}
      <CounterQRCode isOpen={isQROpen} onClose={() => setIsQROpen(false)} />

      {/* Quick Add Staff Modal */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#121215] p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-400">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Add Staff Member</h3>
                  <p className="text-[11px] text-[#71717a]">Staff can log in with their phone to log visits</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddStaffOpen(false)}
                className="rounded-full p-1.5 text-[#a1a1aa] hover:bg-white/[0.06] hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {staffSuccessMsg ? (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-4 text-center space-y-2 animate-fade-in">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                <p className="text-xs font-bold text-emerald-400">{staffSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleAddStaffSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#a1a1aa] uppercase tracking-wider mb-1.5">
                    Staff Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-xs font-medium text-white placeholder:text-[#52525b] focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.06] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#a1a1aa] uppercase tracking-wider mb-1.5">
                    Staff Mobile Number (For Login &amp; OTP) *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52525b]" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98201 XXXXX"
                      value={staffPhone}
                      onChange={(e) => setStaffPhone(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-10 pr-3.5 py-2.5 text-xs font-medium text-white placeholder:text-[#52525b] focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.06] transition-colors"
                    />
                  </div>
                  <p className="text-[10px] text-[#71717a] mt-1">
                    Staff will enter this mobile number on the login page to access visit entry.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#a1a1aa] uppercase tracking-wider mb-1.5">
                    Role &amp; Permissions *
                  </label>
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value as any)}
                    className="w-full rounded-xl border border-white/[0.08] bg-[#18181b] px-3.5 py-2.5 text-xs font-medium text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                  >
                    <option className="bg-[#18181b] text-white" value="staff">Staff / Cashier (Visit Data Entry Only)</option>
                    <option className="bg-[#18181b] text-white" value="manager">Manager (Visits + WhatsApp Messages)</option>
                  </select>
                </div>

                <div className="pt-2 flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAddStaffOpen(false)}
                    className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 text-xs font-bold text-[#a1a1aa] hover:bg-white/[0.06] hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl brand-gradient py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:opacity-95 transition-all btn-interactive"
                  >
                    Link &amp; Add Staff
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {activeBusiness.name}
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 text-[10px] font-bold text-purple-400">
              <Sparkles className="h-3 w-3" /> Live Store
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#71717a] mt-1">
            Customer Return &amp; Daily Retention Overview
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAddStaffOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/[0.08] transition-colors btn-interactive"
          >
            <UserPlus className="h-3.5 w-3.5 text-blue-400" />
            <span>Add Staff</span>
          </button>

          <button
            onClick={() => setIsQROpen(true)}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/[0.08] transition-colors btn-interactive"
          >
            <QrCode className="h-3.5 w-3.5 text-purple-400" />
            <span>Counter QR</span>
          </button>

          <Link
            href="/opportunities"
            className="relative flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/[0.08] transition-colors btn-interactive"
          >
            <Megaphone className="h-3.5 w-3.5 text-red-400" />
            <span>Opportunities</span>
            {pendingOpportunitiesCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white tabular-nums">
                {pendingOpportunitiesCount}
              </span>
            )}
          </Link>

          <Link
            href="/add-visit"
            className="flex items-center gap-1.5 rounded-xl brand-gradient px-4 py-2 text-xs font-bold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:opacity-95 transition-all btn-interactive"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Visit (5s)</span>
          </Link>
        </div>
      </div>

      {/* KPI Metrics Summary Grid */}
      <MetricsGrid />

      {/* Main Grid: AI Intelligence Report & Recent Visits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DailyAIReport />
        </div>
        <div>
          <RecentVisits />
        </div>
      </div>

      {/* Retention Shortcuts Banner */}
      <div className="rounded-2xl brand-gradient p-6 text-white shadow-xl shadow-purple-500/20 flex flex-col md:flex-row items-center justify-between gap-4 border border-white/[0.15]">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-base font-bold tracking-tight">
            Need to bring back inactive customers this weekend?
          </h3>
          <p className="text-xs text-white/80">
            You have {pendingOpportunitiesCount} customers who missed their usual visit cycle. Send 1-click personalized WhatsApp offers now.
          </p>
        </div>
        <Link
          href="/opportunities"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-zinc-950 hover:bg-zinc-100 transition-colors shrink-0 shadow-md btn-interactive"
        >
          <span>Open Opportunities</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}