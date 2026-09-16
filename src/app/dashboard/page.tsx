// Importers/Callers: Next.js App Router route /dashboard, AppHeader, AppSidebar, MobileNav.
// Affected API: Store Dashboard (Conditional rendering for pg_hostel, gym, clothing, salon_spa, and standard retail/restaurant tenants).
// Data Schemas: Business, Opportunity, StaffMember, User from src/lib/types.ts.
// User's Verbatim Instruction: "c:\AI\Revia_Final_All_Three_Business_Updates_Claude_Code_Prompt.docx now this make todo and complete updaate"

"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { DailyAIReport } from "@/components/dashboard/DailyAIReport";
import { RecentVisits } from "@/components/dashboard/RecentVisits";
import { SalonDashboard } from "@/components/dashboard/SalonDashboard";
import { PGDashboard } from "@/components/dashboard/PGDashboard";
import { GymDashboard } from "@/components/dashboard/GymDashboard";
import { ClothingDashboard } from "@/components/dashboard/ClothingDashboard";
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
  Clock,
  CreditCard,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { activeBusiness, opportunities, addStaffMember, trialDaysRemaining, isTrialActive, isReadOnly } = useApp();
  const [isQROpen, setIsQROpen] = useState(false);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [staffPhone, setStaffPhone] = useState("");
  const [staffRole, setStaffRole] = useState<"staff" | "manager">("staff");
  const [staffSuccessMsg, setStaffSuccessMsg] = useState<string | null>(null);

  const isSalon = activeBusiness?.industry === "salon_spa";

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
      {/* Subscription Status Banner */}
      {isTrialActive && (
        <div className={`rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border ${
          trialDaysRemaining <= 3
            ? "bg-[#EF4444]/5 border-[#EF4444]/20"
            : trialDaysRemaining <= 7
            ? "bg-[#F59E0B]/5 border-[#F59E0B]/20"
            : "bg-[#6C4DFF]/5 border-[#6C4DFF]/20"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              trialDaysRemaining <= 3
                ? "bg-[#EF4444]/10 text-[#EF4444]"
                : trialDaysRemaining <= 7
                ? "bg-[#F59E0B]/10 text-[#F59E0B]"
                : "bg-[#6C4DFF]/10 text-[#6C4DFF]"
            }`}>
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className={`text-sm font-bold ${
                trialDaysRemaining <= 3
                  ? "text-[#EF4444]"
                  : trialDaysRemaining <= 7
                  ? "text-[#F59E0B]"
                  : "text-[#111439]"
              }`}>
                {trialDaysRemaining} days remaining in your free trial
              </p>
              <p className="text-xs text-[#667085] mt-0.5">
                {trialDaysRemaining <= 3
                  ? "Your trial is ending soon. Upgrade now to keep all features."
                  : trialDaysRemaining <= 7
                  ? "Upgrade to continue using all retention features after your trial."
                  : "Enjoy full access to all Revia features during your trial period."}
              </p>
            </div>
          </div>
          <Link
            href="/profile"
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold shadow-sm transition-all shrink-0 btn-interactive ${
              trialDaysRemaining <= 3
                ? "bg-[#EF4444] text-white hover:bg-[#DC2626] shadow-[#EF4444]/25"
                : trialDaysRemaining <= 7
                ? "bg-[#F59E0B] text-white hover:bg-[#D97706] shadow-[#F59E0B]/25"
                : "brand-gradient text-white shadow-purple-500/20 hover:opacity-95"
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>{trialDaysRemaining <= 3 ? "Upgrade Now" : "View Plans"}</span>
          </Link>
        </div>
      )}

      {isReadOnly && (
        <div className="rounded-2xl bg-[#EF4444]/5 border border-[#EF4444]/20 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EF4444]/10 text-[#EF4444]">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#EF4444]">Trial Expired</p>
              <p className="text-xs text-[#667085] mt-0.5">
                Your account is in read-only mode. Upgrade to add visits and send messages.
              </p>
            </div>
          </div>
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 rounded-xl bg-[#EF4444] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#EF4444]/25 hover:bg-[#DC2626] transition-all shrink-0 btn-interactive"
          >
            <CreditCard className="h-4 w-4" />
            <span>Activate Subscription</span>
          </Link>
        </div>
      )}

      {/* Modal for QR Code */}
      <CounterQRCode isOpen={isQROpen} onClose={() => setIsQROpen(false)} />

      {/* Quick Add Staff Modal */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111439]/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[#EAECF0] bg-[#FFFFFF] p-6 shadow-2xl space-y-5 text-[#111439]">
            <div className="flex items-center justify-between border-b border-[#EAECF0] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6]">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#111439]">Add Staff Member</h3>
                  <p className="text-[11px] text-[#667085]">Staff can log in with their phone to log visits</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddStaffOpen(false)}
                className="rounded-full p-1.5 text-[#667085] hover:bg-[#F1F1F4] hover:text-[#111439] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {staffSuccessMsg ? (
              <div className="rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/25 p-4 text-center space-y-2 animate-fade-in">
                <CheckCircle2 className="h-8 w-8 text-[#16A34A] mx-auto" />
                <p className="text-xs font-bold text-[#16A34A]">{staffSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleAddStaffSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#667085] uppercase tracking-wider mb-1.5">
                    Staff Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2.5 text-xs font-medium text-[#111439] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6C4DFF] focus:bg-[#FFFFFF] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#667085] uppercase tracking-wider mb-1.5">
                    Staff Mobile Number (For Login &amp; OTP) *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98201 XXXXX"
                      value={staffPhone}
                      onChange={(e) => setStaffPhone(e.target.value)}
                      className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] pl-10 pr-3.5 py-2.5 text-xs font-medium text-[#111439] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6C4DFF] focus:bg-[#FFFFFF] transition-colors"
                    />
                  </div>
                  <p className="text-[10px] text-[#667085] mt-1">
                    Staff will enter this mobile number on the login page to access visit entry.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#667085] uppercase tracking-wider mb-1.5">
                    Role &amp; Permissions *
                  </label>
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value as any)}
                    className="w-full rounded-xl border border-[#EAECF0] bg-[#FFFFFF] px-3.5 py-2.5 text-xs font-medium text-[#111439] focus:outline-none focus:border-[#6C4DFF] transition-colors"
                  >
                    <option value="staff">Staff / Cashier (Visit Data Entry Only)</option>
                    <option value="manager">Manager (Visits + WhatsApp Messages)</option>
                  </select>
                </div>

                <div className="pt-2 flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAddStaffOpen(false)}
                    className="flex-1 rounded-xl border border-[#EAECF0] bg-[#F8F8F9] py-2.5 text-xs font-bold text-[#667085] hover:bg-[#F1F1F4] hover:text-[#111439] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl brand-gradient py-2.5 text-xs font-bold text-white shadow-md shadow-purple-500/20 hover:shadow-purple-500/35 hover:opacity-95 transition-all btn-interactive cursor-pointer"
                  >
                    Link &amp; Add Staff
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Conditionally Render Business-Specific Workspace Dashboards */}
      {activeBusiness?.industry === "salon_spa" ? (
        <SalonDashboard />
      ) : activeBusiness?.industry === "pg_hostel" ? (
        <PGDashboard />
      ) : activeBusiness?.industry === "gym" ? (
        <GymDashboard />
      ) : activeBusiness?.industry === "clothing" ? (
        <ClothingDashboard />
      ) : (
        /* Standard Dashboard (Restaurant, Cafe, Hotel, Clinic, Retail, Other) */
        <>
          {/* Welcome & Quick Action Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-[#111439] tracking-tight">
                  {activeBusiness?.name}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#6C4DFF]/10 border border-[#6C4DFF]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#6C4DFF]">
                  <Sparkles className="h-3 w-3" /> Live Store
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#667085] mt-1 font-medium">
                Customer Return &amp; Daily Retention Overview
              </p>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setIsAddStaffOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-[#EAECF0] bg-[#FFFFFF] px-3.5 py-2 text-xs font-bold text-[#111439] hover:bg-[#F8F8F9] hover:border-[#D0D5DD] transition-all shadow-xs btn-interactive cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5 text-[#3B82F6]" />
                <span>Add Staff</span>
              </button>

              <button
                onClick={() => setIsQROpen(true)}
                className="flex items-center gap-2 rounded-xl border border-[#EAECF0] bg-[#FFFFFF] px-3.5 py-2 text-xs font-bold text-[#111439] hover:bg-[#F8F8F9] hover:border-[#D0D5DD] transition-all shadow-xs btn-interactive cursor-pointer"
              >
                <QrCode className="h-3.5 w-3.5 text-[#6C4DFF]" />
                <span>Counter QR</span>
              </button>

              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 rounded-xl border border-[#EAECF0] bg-[#FFFFFF] px-3.5 py-2 text-xs font-bold text-[#667085] hover:bg-[#F8F8F9] hover:border-[#D0D5DD] hover:text-[#111439] transition-all shadow-xs btn-interactive cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Refresh</span>
              </button>

              <Link
                href="/opportunities"
                className="relative flex items-center gap-2 rounded-xl border border-[#EAECF0] bg-[#FFFFFF] px-3.5 py-2 text-xs font-bold text-[#111439] hover:bg-[#F8F8F9] hover:border-[#D0D5DD] transition-all shadow-xs btn-interactive"
              >
                <Megaphone className="h-3.5 w-3.5 text-[#EF4444]" />
                <span>Opportunities</span>
                {pendingOpportunitiesCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[9px] font-bold text-white tabular-nums">
                    {pendingOpportunitiesCount}
                  </span>
                )}
              </Link>

              <Link
                href="/add-visit"
                className="flex items-center gap-1.5 rounded-xl brand-gradient px-4 py-2 text-xs font-bold text-white shadow-md shadow-purple-500/25 hover:shadow-purple-500/40 hover:opacity-95 transition-all btn-interactive"
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
          <div className="rounded-2xl brand-gradient p-6 text-white shadow-xl shadow-purple-500/15 flex flex-col md:flex-row items-center justify-between gap-4 border border-white/20">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-base font-bold tracking-tight">
                Need to bring back inactive customers this weekend?
              </h3>
              <p className="text-xs text-white/90">
                You have {pendingOpportunitiesCount} customers who missed their usual visit cycle. Send 1-click personalized WhatsApp offers now.
              </p>
            </div>
            <Link
              href="/opportunities"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFFFFF] px-5 py-2.5 text-xs font-bold text-[#111439] hover:bg-[#F8F8F9] transition-all shrink-0 shadow-md btn-interactive"
            >
              <span>Open Opportunities</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
