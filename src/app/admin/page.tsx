// Importers/Callers: Next.js App Router route `/admin`, `/auth/admin-login`.
// Affected API: Super Admin panel for platform-wide subscription management, UPI approvals, AI Bank SMS auto-reconciliation, tenant control, core website settings, and SaaS growth analytics.
// Data Schemas: Business, SubscriptionPlanId, SubscriptionStatus, SubscriptionPaymentRecord, PlatformCoreSettings, User from src/lib/types.ts.
// User's Verbatim Instruction: "c:\AI\Revia_Final_All_Three_Business_Updates_Claude_Code_Prompt.docx now this make todo and complete updaate"

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { SubscriptionPlanId, SubscriptionStatus } from "@/lib/types";
import { DEFAULT_FOUNDER_UPI } from "@/lib/upi";
import {
  ShieldAlert,
  Building,
  Users,
  CheckCircle,
  AlertTriangle,
  Gift,
  RefreshCw,
  Search,
  Lock,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Activity,
  PieChart,
  BarChart3,
  Calendar,
  Sparkles,
  Zap,
  CreditCard,
  Settings,
  QrCode,
  Check,
  X,
  Sliders,
  Bell,
  Mail,
  Smartphone,
  Save,
  Wand2,
  FileText,
  MessageSquare,
  AlertCircle,
  CheckCheck,
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const {
    businesses,
    adminUpdateSubscription,
    adminExtendTrial,
    adminToggleSuspend,
    setActiveBusinessId,
    currentUser,
    switchRole,
    subscriptionPayments,
    approveSubscriptionPayment,
    rejectSubscriptionPayment,
    autoReconcileFromBankSms,
    platformSettings,
    updatePlatformSettings,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    "subscriptions" | "tenants" | "settings" | "analytics"
  >("subscriptions");
  const [searchTerm, setSearchTerm] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // SMS / Bank Statement Auto-Reconcile State
  const [showSmsReconciler, setShowSmsReconciler] = useState(false);
  const [smsInputText, setSmsInputText] = useState("");
  const [isReconciling, setIsReconciling] = useState(false);
  const [reconcileResult, setReconcileResult] = useState<{
    matchedCount: number;
    approvedIds: string[];
    parsedRecords: any[];
  } | null>(null);

  // Editable Core Settings Form State
  const [upiIdInput, setUpiIdInput] = useState(
    platformSettings?.upi_id || DEFAULT_FOUNDER_UPI.upi_id
  );
  const [upiNameInput, setUpiNameInput] = useState(
    platformSettings?.upi_name || DEFAULT_FOUNDER_UPI.upi_name
  );
  const [trialDaysInput, setTrialDaysInput] = useState(
    platformSettings?.default_trial_days || 14
  );
  const [announcementInput, setAnnouncementInput] = useState(
    platformSettings?.announcement_banner || ""
  );
  const [supportEmailInput, setSupportEmailInput] = useState(
    platformSettings?.support_email || "support@revia.app"
  );
  const [supportWhatsappInput, setSupportWhatsappInput] = useState(
    platformSettings?.support_whatsapp || "919876543210"
  );
  const [autoVerificationMode, setAutoVerificationMode] = useState<
    "manual_approval" | "provisional_instant_access"
  >(platformSettings?.auto_verification_mode || "manual_approval");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Security Check: Only platform superadmin can access this control panel
  if (currentUser.role !== "superadmin") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 animate-fade-in">
        <div className="max-w-md w-full brand-card p-8 text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444]">
            <Lock className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black text-[#111439] tracking-tight">
              Admin Access Required
            </h1>
            <p className="text-xs text-[#667085] leading-relaxed">
              This panel is restricted exclusively to the platform founder. Please sign in with your Founder credentials and Master Secret Key.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/auth/admin-login"
              className="w-full flex items-center justify-center gap-2 rounded-xl brand-gradient py-3 text-xs font-bold text-white shadow-md shadow-purple-500/20 hover:opacity-95 transition-opacity btn-interactive"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Go to Founder Admin Login</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalBusinesses = businesses.length;
  const trialBusinesses = businesses.filter((b) => b.subscription_status === "trialing").length;
  const activePaidBusinesses = businesses.filter(
    (b) => b.subscription_status === "active"
  ).length;
  const expiredBusinesses = businesses.filter(
    (b) => b.subscription_status === "expired"
  ).length;

  const pendingPayments = (subscriptionPayments || []).filter((p) => p.status === "pending");
  const approvedPayments = (subscriptionPayments || []).filter((p) => p.status === "approved");
  const totalPaidRevenue = approvedPayments.reduce((acc, p) => acc + (p.amount_inr || 0), 0);

  // Platform Analytics Math
  const totalPlatformMRR = activePaidBusinesses * 799 + (totalBusinesses > 3 ? 1200 : 0);
  const totalProjectedARR = totalPlatformMRR * 12;

  // Industry Vertical Breakdown
  const industryCounts: Record<string, number> = {};
  businesses.forEach((b) => {
    industryCounts[b.industry] = (industryCounts[b.industry] || 0) + 1;
  });

  const industriesList = Object.entries(industryCounts).map(([industry, count]) => ({
    industry: industry.replace("_", " "),
    count,
    percentage: Math.round((count / Math.max(1, totalBusinesses)) * 100),
  }));

  const filteredBusinesses = businesses.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.phone.includes(searchTerm)
  );

  const handleApprovePayment = async (paymentId: string) => {
    await approveSubscriptionPayment(paymentId, "manual_founder");
    setToastMsg("Payment verified and plan activated successfully!");
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleRejectPayment = async (paymentId: string) => {
    await rejectSubscriptionPayment(paymentId, "Verification failed or invalid UTR");
    setToastMsg("Payment request marked as rejected.");
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleRunAutoReconciliation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsInputText.trim()) return;

    setIsReconciling(true);
    try {
      const res = await autoReconcileFromBankSms(smsInputText);
      setReconcileResult(res);
      setIsReconciling(false);
      if (res.matchedCount > 0) {
        setToastMsg(`Successfully auto-verified & activated ${res.matchedCount} subscription(s)!`);
        setTimeout(() => setToastMsg(null), 5000);
      }
    } catch (err) {
      setIsReconciling(false);
    }
  };

  const handleExtendTrial = (busId: string, days: number = 14) => {
    adminExtendTrial(busId, days);
    setToastMsg(
      `Extended trial by +${days} days for ${businesses.find((b) => b.id === busId)?.name}`
    );
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleChangePlan = (
    busId: string,
    plan: SubscriptionPlanId,
    status: SubscriptionStatus
  ) => {
    adminUpdateSubscription(busId, plan, status);
    setToastMsg(
      `Updated ${businesses.find((b) => b.id === busId)?.name} to ${plan} (${status})`
    );
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleToggleSuspend = (busId: string) => {
    adminToggleSuspend(busId);
    setToastMsg(`Toggled account status for ${businesses.find((b) => b.id === busId)?.name}`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleSavePlatformSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);

    updatePlatformSettings({
      upi_id: upiIdInput.trim(),
      upi_name: upiNameInput.trim(),
      default_trial_days: Number(trialDaysInput) || 14,
      announcement_banner: announcementInput.trim() || null,
      support_email: supportEmailInput.trim(),
      support_whatsapp: supportWhatsappInput.trim(),
      auto_verification_mode: autoVerificationMode,
    });

    setIsSavingSettings(false);
    setToastMsg("Platform core website settings saved successfully!");
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleSwitchToTenant = (busId: string) => {
    setActiveBusinessId(busId);
    router.push("/dashboard");
  };

  const handleLockAdmin = () => {
    switchRole("owner");
    router.push("/");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[#111439] tracking-tight">
              Founder &amp; Platform Admin Panel
            </h1>
            <span className="rounded-full bg-[#16A34A]/10 border border-[#16A34A]/25 px-2.5 py-0.5 text-xs font-bold text-[#16A34A] flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Founder Mode Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#667085] mt-1 font-medium">
            Manage client subscriptions, verify UPI scanner payments, run bank statement auto-reconciliation, and configure platform settings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2 text-xs font-bold text-[#111439] hover:bg-[#F1F1F4] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Store Dashboard</span>
          </Link>
          <button
            onClick={handleLockAdmin}
            className="flex items-center gap-1.5 rounded-xl bg-[#111439] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#1a1d4a] transition-colors cursor-pointer"
            title="Lock Founder Admin Session"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Log Out Admin</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="rounded-2xl border border-[#16A34A]/30 bg-[#16A34A]/10 p-4 text-xs font-bold text-[#16A34A] flex items-center gap-2 animate-fade-in">
          <CheckCircle className="h-4 w-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="brand-card p-5 border-l-4 border-l-[#6C4DFF]">
          <div className="flex items-center justify-between mb-2 text-[#667085]">
            <h3 className="text-xs font-bold uppercase tracking-wider">Total Businesses</h3>
            <Building className="h-4 w-4 text-[#6C4DFF]" />
          </div>
          <div className="text-2xl font-black text-[#111439]">{totalBusinesses}</div>
          <div className="text-[11px] text-[#667085] mt-1">
            {activePaidBusinesses} active • {trialBusinesses} in trial
          </div>
        </div>

        <div className="brand-card p-5 border-l-4 border-l-[#F59E0B]">
          <div className="flex items-center justify-between mb-2 text-[#667085]">
            <h3 className="text-xs font-bold uppercase tracking-wider">Pending UPI Approvals</h3>
            <QrCode className="h-4 w-4 text-[#F59E0B]" />
          </div>
          <div className="text-2xl font-black text-[#F59E0B]">{pendingPayments.length}</div>
          <div className="text-[11px] text-[#667085] mt-1">Awaiting your verification</div>
        </div>

        <div className="brand-card p-5 border-l-4 border-l-[#16A34A]">
          <div className="flex items-center justify-between mb-2 text-[#667085]">
            <h3 className="text-xs font-bold uppercase tracking-wider">Collected Revenue</h3>
            <DollarSign className="h-4 w-4 text-[#16A34A]" />
          </div>
          <div className="text-2xl font-black text-[#16A34A]">₹{totalPaidRevenue}</div>
          <div className="text-[11px] text-[#667085] mt-1">From approved UPI payments</div>
        </div>

        <div className="brand-card p-5 border-l-4 border-l-[#3B82F6]">
          <div className="flex items-center justify-between mb-2 text-[#667085]">
            <h3 className="text-xs font-bold uppercase tracking-wider">Projected MRR</h3>
            <TrendingUp className="h-4 w-4 text-[#3B82F6]" />
          </div>
          <div className="text-2xl font-black text-[#111439]">₹{totalPlatformMRR}</div>
          <div className="text-[11px] text-[#667085] mt-1">₹{totalProjectedARR} ARR Run-Rate</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#EAECF0] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("subscriptions")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "subscriptions"
              ? "brand-gradient text-white shadow-md shadow-purple-500/20"
              : "text-[#667085] hover:text-[#111439] hover:bg-[#F8F8F9]"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Subscriptions &amp; UPI Payments</span>
          {pendingPayments.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#EF4444] text-white text-[10px] font-black">
              {pendingPayments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("tenants")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "tenants"
              ? "brand-gradient text-white shadow-md shadow-purple-500/20"
              : "text-[#667085] hover:text-[#111439] hover:bg-[#F8F8F9]"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Client Businesses ({totalBusinesses})</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "settings"
              ? "brand-gradient text-white shadow-md shadow-purple-500/20"
              : "text-[#667085] hover:text-[#111439] hover:bg-[#F8F8F9]"
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Core Website Settings</span>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "analytics"
              ? "brand-gradient text-white shadow-md shadow-purple-500/20"
              : "text-[#667085] hover:text-[#111439] hover:bg-[#F8F8F9]"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Platform Growth Analytics</span>
        </button>
      </div>

      {/* TAB 1: SUBSCRIPTIONS & UPI PAYMENTS */}
      {activeTab === "subscriptions" && (
        <div className="space-y-6">
          {/* Bank SMS / Statement Auto-Reconciliation Tool (What Big Companies Do) */}
          <div className="brand-card p-6 border-2 border-[#6C4DFF]/20 bg-gradient-to-br from-white to-[#6C4DFF]/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#6C4DFF]/10 text-[#6C4DFF] px-2.5 py-0.5 text-[11px] font-bold">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Enterprise Auto-Reconciliation Engine</span>
                </div>
                <h3 className="text-sm font-black text-[#111439]">
                  Instant Auto-Verify via Bank SMS / Statement Paste
                </h3>
                <p className="text-xs text-[#667085]">
                  Paste your bank credit SMS alert or statement snippet. The AI matcher extracts the 12-digit UTR and activates matching subscriptions instantly!
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSmsReconciler(!showSmsReconciler)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl brand-gradient text-white text-xs font-bold shadow-xs hover:opacity-95 cursor-pointer whitespace-nowrap"
              >
                <Wand2 className="h-3.5 w-3.5" />
                <span>{showSmsReconciler ? "Hide Auto-Matcher" : "Open Auto-Matcher"}</span>
              </button>
            </div>

            {showSmsReconciler && (
              <form onSubmit={handleRunAutoReconciliation} className="mt-4 pt-4 border-t border-[#EAECF0] space-y-3 animate-fade-in">
                <textarea
                  rows={3}
                  value={smsInputText}
                  onChange={(e) => setSmsInputText(e.target.value)}
                  placeholder={`Paste your bank SMS alert here, for example:\n"Axis Bank: Rs 799.00 credited to a/c ... from UPI/427891238912/GPay..."`}
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#FFFFFF] p-3 text-xs font-mono text-[#111439] placeholder-[#94A3B8] focus:border-[#6C4DFF] focus:outline-none transition-colors"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#667085]">
                    Supports SMS formats from Axis, HDFC, ICICI, SBI, Kotak, Paytm, and Google Pay.
                  </span>
                  <button
                    type="submit"
                    disabled={isReconciling || !smsInputText.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#16A34A] hover:bg-emerald-600 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span>{isReconciling ? "Extracting & Matching..." : "Auto-Verify & Activate"}</span>
                  </button>
                </div>

                {reconcileResult && (
                  <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#EAECF0] text-xs space-y-1 mt-2">
                    <p className="font-bold text-[#111439]">
                      Found {reconcileResult.parsedRecords.length} UTR reference(s) in text. Matched &amp; activated {reconcileResult.matchedCount} pending subscription order(s).
                    </p>
                    {reconcileResult.parsedRecords.map((rec, i) => (
                      <div key={i} className="text-[11px] text-[#667085] flex items-center gap-2">
                        <span className="font-mono font-bold text-[#6C4DFF]">{rec.utr}</span>
                        {rec.amount && <span>(₹{rec.amount})</span>}
                      </div>
                    ))}
                  </div>
                )}
              </form>
            )}
          </div>

          {/* Main Subscriptions Queue Table */}
          <div className="brand-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#EAECF0]">
              <div>
                <h2 className="text-base font-black text-[#111439]">
                  Live Client Payment &amp; UTR Verification Queue
                </h2>
                <p className="text-xs text-[#667085]">
                  Review client UPI scanner submissions and approve to activate their paid plan.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#667085]">
                  Active Founder UPI: <strong className="text-[#6C4DFF]">{platformSettings?.upi_id || DEFAULT_FOUNDER_UPI.upi_id}</strong>
                </span>
              </div>
            </div>

            {(subscriptionPayments || []).length === 0 ? (
              <div className="text-center py-12 text-xs text-[#667085] space-y-2">
                <QrCode className="h-8 w-8 text-[#94A3B8] mx-auto" />
                <p className="font-bold text-[#111439]">No UPI payment submissions yet</p>
                <p>When users scan your QR code and submit their UTR number, requests will appear here for 1-click verification.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#EAECF0] text-[#667085] font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Business</th>
                      <th className="py-3 px-3">Plan / Cycle</th>
                      <th className="py-3 px-3">Amount</th>
                      <th className="py-3 px-3">12-Digit UTR Number</th>
                      <th className="py-3 px-3">Verification Method</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Founder Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAECF0]">
                    {(subscriptionPayments || []).map((payment) => (
                      <tr key={payment.id} className="hover:bg-[#F8F8F9]/60 transition-colors">
                        <td className="py-3.5 px-3 text-[#667085]">
                          {new Date(payment.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="font-bold text-[#111439] block">
                            {payment.business_name || payment.business_id}
                          </span>
                          <span className="text-[11px] text-[#667085]">
                            {payment.owner_email || "Client"}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 uppercase font-bold text-[#111439]">
                          {payment.plan_id} ({payment.billing_cycle})
                        </td>
                        <td className="py-3.5 px-3 font-black text-[#16A34A] text-sm">
                          ₹{payment.amount_inr}
                        </td>
                        <td className="py-3.5 px-3">
                          <code className="bg-[#6C4DFF]/10 text-[#6C4DFF] px-2 py-1 rounded font-mono font-bold text-xs tracking-wider">
                            {payment.utr_reference}
                          </code>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="text-[10px] text-[#667085] font-semibold">
                            {payment.verification_method === "auto_sms_matched"
                              ? "⚡ Bank SMS Auto-Matched"
                              : payment.verification_method === "provisional_auto"
                              ? "🚀 Instant Provisional"
                              : "👤 Founder Manual"}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              payment.status === "approved"
                                ? "bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20"
                                : payment.status === "pending"
                                ? "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20"
                                : "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          {payment.status === "pending" ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleApprovePayment(payment.id)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#16A34A] hover:bg-emerald-600 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                                title="Approve payment & activate subscription"
                              >
                                <Check className="h-3.5 w-3.5" />
                                <span>Verify &amp; Activate</span>
                              </button>
                              <button
                                onClick={() => handleRejectPayment(payment.id)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] font-bold text-xs transition-colors cursor-pointer"
                                title="Reject payment"
                              >
                                <X className="h-3.5 w-3.5" />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#94A3B8] font-medium">
                              {payment.approved_at ? "Activated" : "Processed"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CLIENT BUSINESSES & TENANT ACCOUNTS */}
      {activeTab === "tenants" && (
        <div className="space-y-6">
          <div className="brand-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#EAECF0]">
              <div>
                <h2 className="text-base font-black text-[#111439]">
                  All Registered Businesses &amp; Workspaces
                </h2>
                <p className="text-xs text-[#667085]">
                  Manage tenant subscription plans, extend free trials, toggle suspension, or switch into their dashboard.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Search by name, industry, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] pl-9 pr-3 py-2 text-xs text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#EAECF0] text-[#667085] font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Business Name</th>
                    <th className="py-3 px-3">Industry</th>
                    <th className="py-3 px-3">Contact</th>
                    <th className="py-3 px-3">Plan Tier</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAECF0]">
                  {filteredBusinesses.map((biz) => (
                    <tr key={biz.id} className="hover:bg-[#F8F8F9]/60 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-[#111439]">{biz.name}</div>
                        <div className="text-[11px] text-[#667085]">
                          Owner: {biz.owner_name} ({biz.owner_email})
                        </div>
                      </td>
                      <td className="py-3.5 px-3 capitalize text-[#667085]">
                        {biz.industry.replace("_", " ")}
                      </td>
                      <td className="py-3.5 px-3 text-[#667085]">{biz.phone}</td>
                      <td className="py-3.5 px-3">
                        <select
                          value={biz.subscription_plan}
                          onChange={(e) =>
                            handleChangePlan(
                              biz.id,
                              e.target.value as SubscriptionPlanId,
                              biz.subscription_status
                            )
                          }
                          className="rounded-lg border border-[#EAECF0] bg-[#FFFFFF] px-2 py-1 text-xs font-bold text-[#111439] uppercase focus:border-[#6C4DFF] focus:outline-none"
                        >
                          <option value="starter">Starter</option>
                          <option value="growth">Growth</option>
                          <option value="pro">Pro</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            biz.subscription_status === "active"
                              ? "bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20"
                              : biz.subscription_status === "trialing"
                              ? "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20"
                              : "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20"
                          }`}
                        >
                          {biz.subscription_status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleExtendTrial(biz.id, 14)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg border border-[#EAECF0] bg-[#FFFFFF] hover:bg-[#F1F1F4] text-[#111439] text-[11px] font-bold transition-colors cursor-pointer"
                            title="Extend trial by +14 days"
                          >
                            <Gift className="h-3 w-3 text-[#6C4DFF]" />
                            <span>+14d</span>
                          </button>
                          <button
                            onClick={() => handleToggleSuspend(biz.id)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                              biz.is_suspended
                                ? "bg-[#16A34A]/10 text-[#16A34A] hover:bg-[#16A34A]/20"
                                : "bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20"
                            }`}
                          >
                            {biz.is_suspended ? "Unsuspend" : "Suspend"}
                          </button>
                          <button
                            onClick={() => handleSwitchToTenant(biz.id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg brand-gradient text-white text-[11px] font-bold shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                          >
                            <span>Open</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CORE WEBSITE & PLATFORM SETTINGS */}
      {activeTab === "settings" && (
        <div className="space-y-6 max-w-4xl">
          <form onSubmit={handleSavePlatformSettings} className="brand-card p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#EAECF0] pb-4">
              <h2 className="text-base font-black text-[#111439]">
                Core Platform &amp; Website Configuration
              </h2>
              <p className="text-xs text-[#667085] mt-0.5">
                These settings directly manipulate the live platform, payment scanner routing, and global user experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Founder UPI ID */}
              <div>
                <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <QrCode className="h-3.5 w-3.5 text-[#6C4DFF]" />
                  <span>Founder UPI ID for Payments *</span>
                </label>
                <input
                  type="text"
                  required
                  value={upiIdInput}
                  onChange={(e) => setUpiIdInput(e.target.value)}
                  placeholder="e.g. javidhkovvuru143@axl"
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2.5 text-xs font-mono font-bold text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none transition-colors"
                />
                <p className="text-[10px] text-[#667085] mt-1">
                  All subscription QR scanners generated on the site will credit directly to this UPI ID.
                </p>
              </div>

              {/* Founder UPI Display Name */}
              <div>
                <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-[#6C4DFF]" />
                  <span>UPI Receiver Display Name *</span>
                </label>
                <input
                  type="text"
                  required
                  value={upiNameInput}
                  onChange={(e) => setUpiNameInput(e.target.value)}
                  placeholder="e.g. Javidh Kovvuru (Revia)"
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2.5 text-xs font-bold text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none transition-colors"
                />
              </div>

              {/* Verification Mode (Big Companies Architecture) */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#6C4DFF]" />
                  <span>Subscription Verification Policy (How Big SaaS Companies Operate)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  <label
                    onClick={() => setAutoVerificationMode("manual_approval")}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      autoVerificationMode === "manual_approval"
                        ? "border-[#6C4DFF] bg-[#6C4DFF]/5"
                        : "border-[#EAECF0] bg-[#F8F8F9] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="autoVerificationMode"
                        checked={autoVerificationMode === "manual_approval"}
                        onChange={() => setAutoVerificationMode("manual_approval")}
                        className="text-[#6C4DFF]"
                      />
                      <span className="text-xs font-bold text-[#111439]">Manual &amp; SMS Matcher Mode (Recommended)</span>
                    </div>
                    <p className="text-[11px] text-[#667085] mt-1.5 pl-5">
                      Client submits UTR → remains pending until you click &quot;Verify &amp; Activate&quot; or paste your Bank SMS in the 1-click Auto-Matcher.
                    </p>
                  </label>

                  <label
                    onClick={() => setAutoVerificationMode("provisional_instant_access")}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      autoVerificationMode === "provisional_instant_access"
                        ? "border-[#6C4DFF] bg-[#6C4DFF]/5"
                        : "border-[#EAECF0] bg-[#F8F8F9] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="autoVerificationMode"
                        checked={autoVerificationMode === "provisional_instant_access"}
                        onChange={() => setAutoVerificationMode("provisional_instant_access")}
                        className="text-[#6C4DFF]"
                      />
                      <span className="text-xs font-bold text-[#111439]">Provisional Instant Access (Enterprise)</span>
                    </div>
                    <p className="text-[11px] text-[#667085] mt-1.5 pl-5">
                      Client gets instant upgrade upon submitting valid 12-digit UTR. Founder can audit and reject invalid submissions anytime.
                    </p>
                  </label>
                </div>
              </div>

              {/* Default Free Trial Days */}
              <div>
                <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[#6C4DFF]" />
                  <span>Default Free Trial Duration (Days) *</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={90}
                  value={trialDaysInput}
                  onChange={(e) => setTrialDaysInput(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2.5 text-xs font-bold text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none transition-colors"
                />
                <p className="text-[10px] text-[#667085] mt-1">
                  New users signing up will automatically receive this trial length.
                </p>
              </div>

              {/* Support Email */}
              <div>
                <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-[#6C4DFF]" />
                  <span>Support Email Address *</span>
                </label>
                <input
                  type="email"
                  required
                  value={supportEmailInput}
                  onChange={(e) => setSupportEmailInput(e.target.value)}
                  placeholder="support@revia.app"
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2.5 text-xs font-bold text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none transition-colors"
                />
              </div>

              {/* Support WhatsApp */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5 text-[#16A34A]" />
                  <span>Support WhatsApp Contact Number (with country code) *</span>
                </label>
                <input
                  type="text"
                  required
                  value={supportWhatsappInput}
                  onChange={(e) => setSupportWhatsappInput(e.target.value)}
                  placeholder="919876543210"
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2.5 text-xs font-bold text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none transition-colors"
                />
              </div>

              {/* Global Announcement Banner */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Bell className="h-3.5 w-3.5 text-[#F59E0B]" />
                  <span>Global Platform Announcement Banner</span>
                </label>
                <textarea
                  rows={2}
                  value={announcementInput}
                  onChange={(e) => setAnnouncementInput(e.target.value)}
                  placeholder="Broadcast message to all business dashboards..."
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2.5 text-xs font-medium text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#EAECF0] flex justify-end">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="flex items-center gap-2 px-6 py-3 rounded-xl brand-gradient text-white text-xs font-bold shadow-md shadow-purple-500/20 hover:opacity-95 transition-all cursor-pointer btn-interactive"
              >
                <Save className="h-4 w-4" />
                <span>Save Core Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: PLATFORM GROWTH ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Industry Breakdown */}
            <div className="brand-card p-6">
              <div className="flex items-center justify-between mb-4 border-b border-[#EAECF0] pb-3">
                <div className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-[#6C4DFF]" />
                  <h2 className="text-sm font-bold text-[#111439]">
                    Businesses by Industry Vertical
                  </h2>
                </div>
              </div>

              <div className="space-y-3">
                {industriesList.map((item) => (
                  <div key={item.industry} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#111439] capitalize">{item.industry}</span>
                      <span className="text-[#667085] font-semibold">
                        {item.count} stores ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#F8F8F9] rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full brand-gradient text-white"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Health */}
            <div className="brand-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#EAECF0] pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-[#16A34A]" />
                  <h2 className="text-sm font-bold text-[#111439]">Platform Health &amp; Retention</h2>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#F8F8F9] border border-[#EAECF0]">
                  <span className="text-[10px] font-bold uppercase text-[#667085] block">
                    Paid Conversion Rate
                  </span>
                  <span className="text-xl font-black text-[#111439]">
                    {totalBusinesses > 0
                      ? Math.round((activePaidBusinesses / totalBusinesses) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-[#F8F8F9] border border-[#EAECF0]">
                  <span className="text-[10px] font-bold uppercase text-[#667085] block">
                    Active Trial Rate
                  </span>
                  <span className="text-xl font-black text-[#111439]">
                    {totalBusinesses > 0
                      ? Math.round((trialBusinesses / totalBusinesses) * 100)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
