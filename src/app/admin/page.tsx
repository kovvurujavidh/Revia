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
  Loader2,
  Trash2,
  Key,
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const {
    businesses,
    customers,
    visits,
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

  // Reset Password State
  const [resetPasswordBizId, setResetPasswordBizId] = useState<string | null>(null);
  const [resetPasswordEmail, setResetPasswordEmail] = useState("");
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

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
    platformSettings?.support_whatsapp || "917670860094"
  );
  const [autoVerificationMode, setAutoVerificationMode] = useState<
    "manual_approval" | "provisional_instant_access"
  >(platformSettings?.auto_verification_mode || "manual_approval");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Full Reset State
  const [isFullResetting, setIsFullResetting] = useState(false);

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
  const suspendedBusinesses = businesses.filter((b) => b.is_suspended).length;

  const pendingPayments = (subscriptionPayments || []).filter((p) => p.status === "pending");
  const approvedPayments = (subscriptionPayments || []).filter((p) => p.status === "approved");
  const totalPaidRevenue = approvedPayments.reduce((acc, p) => acc + (p.amount_inr || 0), 0);

  // Platform Analytics Math
  const totalPlatformMRR = activePaidBusinesses * 799;
  const totalProjectedARR = totalPlatformMRR * 12;
  const totalCustomers = customers?.length || 0;
  const totalVisits = visits?.length || 0;
  const conversionRate = totalBusinesses > 0 ? Math.round((activePaidBusinesses / totalBusinesses) * 100) : 0;
  const trialConversion = totalBusinesses > 0 ? Math.round((trialBusinesses / totalBusinesses) * 100) : 0;
  const churnRate = totalBusinesses > 0 ? Math.round(((expiredBusinesses + suspendedBusinesses) / totalBusinesses) * 100) : 0;

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

  // Helper: Calculate days remaining for a business subscription
  const getSubscriptionDaysLeft = (biz: typeof businesses[0]): number => {
    const endDate = biz.trial_end_date ? new Date(biz.trial_end_date) : null;
    if (!endDate) return 0;
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getSubscriptionBadge = (biz: typeof businesses[0]) => {
    const daysLeft = getSubscriptionDaysLeft(biz);
    const status = biz.subscription_status;

    if (biz.is_suspended) {
      return { color: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20", label: "Suspended", days: null };
    }
    if (status === "active") {
      return { color: "bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20", label: "Active", days: daysLeft };
    }
    if (status === "trialing") {
      if (daysLeft <= 0) return { color: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20", label: "Trial Expired", days: 0 };
      if (daysLeft <= 3) return { color: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20", label: "Trial", days: daysLeft };
      if (daysLeft <= 7) return { color: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20", label: "Trial", days: daysLeft };
      return { color: "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20", label: "Trial", days: daysLeft };
    }
    if (status === "expired") {
      return { color: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20", label: "Expired", days: 0 };
    }
    if (status === "past_due") {
      return { color: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20", label: "Past Due", days: daysLeft };
    }
    return { color: "bg-[#667085]/10 text-[#667085] border-[#667085]/20", label: status, days: daysLeft };
  };

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

  const handleResetPassword = async () => {
    if (!resetPasswordBizId || !resetPasswordValue || resetPasswordValue.length < 6) return;
    setResetPasswordLoading(true);
    try {
      // Find the auth user by email
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: resetPasswordBizId, newPassword: resetPasswordValue }),
      });
      const data = await res.json();
      if (data.success) {
        setToastMsg("Password updated successfully!");
        setShowResetPasswordModal(false);
        setResetPasswordValue("");
        setResetPasswordBizId(null);
      } else {
        setToastMsg(`Error: ${data.error}`);
      }
    } catch {
      setToastMsg("Failed to reset password");
    }
    setResetPasswordLoading(false);
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

  const handleFullReset = async () => {
    const confirmed = window.confirm(
      "⚠️ FULL RESET WARNING ⚠️\n\nThis will permanently delete:\n• ALL user accounts (auth users)\n• ALL businesses\n• ALL customers\n• ALL visits\n• ALL WhatsApp data\n\nThis CANNOT be undone. Are you sure?"
    );
    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      "Are you REALLY sure? Type 'yes' mentally and click OK to proceed with full database reset."
    );
    if (!doubleConfirm) return;

    setIsFullResetting(true);
    try {
      const res = await fetch("/api/admin/full-reset", { method: "POST" });
      const data = await res.json();

      if (res.ok && data.success) {
        setToastMsg(`Full reset complete! Deleted ${data.deletedAuthUsers} auth users and cleared all tables.`);
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        setToastMsg("Reset failed: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      setToastMsg("Reset failed: " + (err.message || "Network error"));
    } finally {
      setIsFullResetting(false);
      setTimeout(() => setToastMsg(null), 5000);
    }
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
    <div className="min-h-screen bg-[#0F1117] animate-fade-in">
      {/* Admin Top Bar */}
      <div className="sticky top-0 z-50 bg-[#0F1117]/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6C4DFF] text-white">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-black text-white tracking-tight">Revia Admin</h1>
              <p className="text-[10px] text-white/50 font-medium">Platform Control Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Store</span>
            </Link>
            <button
              onClick={handleLockAdmin}
              className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <Lock className="h-3 w-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl overflow-x-auto">
          {([
            { key: "subscriptions" as const, label: "Payments", icon: CreditCard },
            { key: "tenants" as const, label: "Tenants", icon: Building },
            { key: "analytics" as const, label: "Analytics", icon: BarChart3 },
            { key: "settings" as const, label: "Settings", icon: Settings },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-[#6C4DFF] text-white"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Toast */}
        {toastMsg && (
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-xs font-bold text-green-400 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" /> {toastMsg}
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Businesses", value: totalBusinesses, sub: `${activePaidBusinesses} paid`, icon: Building, color: "#6C4DFF" },
            { label: "Revenue", value: `₹${totalPaidRevenue.toLocaleString()}`, sub: `${approvedPayments.length} approved`, icon: DollarSign, color: "#16A34A" },
            { label: "MRR", value: `₹${totalPlatformMRR.toLocaleString()}`, sub: `₹${totalProjectedARR.toLocaleString()} ARR`, icon: TrendingUp, color: "#3B82F6" },
            { label: "Pending", value: pendingPayments.length, sub: "Awaiting approval", icon: QrCode, color: "#F59E0B" },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-xl bg-white/5 border border-white/10 p-3 sm:p-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/40">{kpi.label}</span>
                <kpi.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: kpi.color }} />
              </div>
              <div className="text-lg sm:text-xl font-black text-white">{kpi.value}</div>
              <div className="text-[9px] sm:text-[10px] text-white/30">{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* TAB: SUBSCRIPTIONS */}
        {activeTab === "subscriptions" && (
          <div className="space-y-3">
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 text-purple-300 px-2 py-0.5 text-[9px] font-bold">
                    <Sparkles className="h-2.5 w-2.5" /> AUTO-MATCHER
                  </div>
                  <h3 className="text-xs font-bold text-white mt-1.5">Bank SMS / UTR Auto-Verifier</h3>
                </div>
                <button onClick={() => setShowSmsReconciler(!showSmsReconciler)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#6C4DFF] text-white text-[11px] font-bold cursor-pointer">
                  <Wand2 className="h-3 w-3" /> {showSmsReconciler ? "Hide" : "Open"}
                </button>
              </div>
              {showSmsReconciler && (
                <form onSubmit={handleRunAutoReconciliation} className="space-y-2">
                  <textarea rows={2} value={smsInputText} onChange={(e) => setSmsInputText(e.target.value)} placeholder="Paste bank SMS here..." className="w-full rounded-lg border border-white/10 bg-white/5 p-2.5 text-xs font-mono text-white placeholder-white/30 focus:border-[#6C4DFF] focus:outline-none" />
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-white/30">Axis, HDFC, ICICI, SBI, GPay</span>
                    <button type="submit" disabled={isReconciling || !smsInputText.trim()} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-[11px] font-bold disabled:opacity-50">
                      <CheckCheck className="h-3 w-3" /> {isReconciling ? "Matching..." : "Verify"}
                    </button>
                  </div>
                  {reconcileResult && <div className="p-2 rounded-lg bg-white/5 text-[10px] text-white/60">Matched {reconcileResult.matchedCount} payment(s)</div>}
                </form>
              )}
            </div>

            <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
              <div className="p-3 border-b border-white/10">
                <h3 className="text-xs font-bold text-white">Payment Queue</h3>
                <p className="text-[10px] text-white/30">{pendingPayments.length} pending</p>
              </div>
              {(subscriptionPayments || []).length === 0 ? (
                <div className="p-8 text-center"><QrCode className="h-6 w-6 text-white/20 mx-auto mb-2" /><p className="text-[10px] text-white/30">No payments yet</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead><tr className="border-b border-white/10 text-white/30 font-bold uppercase text-[9px]">
                      <th className="py-2 px-3">Date</th><th className="py-2 px-3">Business</th><th className="py-2 px-3">Amount</th><th className="py-2 px-3">UTR</th><th className="py-2 px-3">Status</th><th className="py-2 px-3 text-right">Action</th>
                    </tr></thead>
                    <tbody className="divide-y divide-white/5">
                      {(subscriptionPayments || []).map((p) => (
                        <tr key={p.id} className="hover:bg-white/5">
                          <td className="py-2 px-3 text-white/50">{new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                          <td className="py-2 px-3"><span className="font-bold text-white">{p.business_name || p.business_id}</span></td>
                          <td className="py-2 px-3 font-black text-green-400">₹{p.amount_inr}</td>
                          <td className="py-2 px-3"><code className="bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono text-[10px]">{p.utr_reference}</code></td>
                          <td className="py-2 px-3"><span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${p.status === "approved" ? "bg-green-500/20 text-green-400" : p.status === "pending" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}`}>{p.status}</span></td>
                          <td className="py-2 px-3 text-right">
                            {p.status === "pending" ? (
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => handleApprovePayment(p.id)} className="px-2 py-1 rounded-md bg-green-600 text-white text-[10px] font-bold"><Check className="h-3 w-3 inline" /></button>
                                <button onClick={() => handleRejectPayment(p.id)} className="px-2 py-1 rounded-md bg-red-500/20 text-red-400 text-[10px] font-bold"><X className="h-3 w-3 inline" /></button>
                              </div>
                            ) : <span className="text-[9px] text-white/20">Done</span>}
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

        {/* TAB: TENANTS */}
        {activeTab === "tenants" && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
              <input type="text" placeholder="Search businesses..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 text-xs text-white placeholder-white/30 focus:border-[#6C4DFF] focus:outline-none" />
            </div>
            <div className="space-y-2">
              {filteredBusinesses.length === 0 ? (
                <div className="rounded-xl bg-white/5 border border-white/10 p-8 text-center"><p className="text-xs text-white/30">No businesses found</p></div>
              ) : filteredBusinesses.map((biz) => {
                const badge = getSubscriptionBadge(biz);
                const daysLeft = getSubscriptionDaysLeft(biz);
                return (
                  <div key={biz.id} className="rounded-xl bg-white/5 border border-white/10 p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-white text-sm truncate">{biz.name}</div>
                        <div className="text-[10px] text-white/40 capitalize">{biz.industry.replace("_", " ")} · {biz.owner_name}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${badge.color}`}>{badge.label}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1.5">
                        {badge.days !== null && <span className={`text-sm font-black ${daysLeft <= 3 ? "text-red-400" : daysLeft <= 7 ? "text-amber-400" : "text-white"}`}>{daysLeft}</span>}
                        {badge.days !== null && <span className="text-[9px] text-white/30">days</span>}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleExtendTrial(biz.id)} className="flex items-center gap-0.5 px-2 py-1 rounded-md border border-white/10 text-[10px] font-bold text-white/60 hover:text-white"><Gift className="h-3 w-3" /> +14d</button>
                        <button onClick={() => { setResetPasswordBizId(biz.id); setResetPasswordEmail(biz.owner_email || ""); setResetPasswordValue(""); setShowResetPasswordModal(true); }} className="flex items-center gap-0.5 px-2 py-1 rounded-md border border-white/10 text-[10px] font-bold text-white/60 hover:text-white"><Key className="h-3 w-3" /> Pw</button>
                        <button onClick={() => handleToggleSuspend(biz.id)} className={`px-2 py-1 rounded-md text-[10px] font-bold ${biz.is_suspended ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{biz.is_suspended ? "Unsuspend" : "Suspend"}</button>
                        <button onClick={() => handleSwitchToTenant(biz.id)} className="flex items-center gap-0.5 px-2 py-1 rounded-md bg-[#6C4DFF] text-white text-[10px] font-bold"><span>Open</span><ArrowRight className="h-3 w-3" /></button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <select value={biz.subscription_plan} onChange={(e) => handleChangePlan(biz.id, e.target.value as SubscriptionPlanId, biz.subscription_status)} className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold text-white uppercase focus:border-[#6C4DFF] focus:outline-none">
                        <option value="starter">Starter</option><option value="growth">Growth</option><option value="pro">Pro</option>
                      </select>
                      <span className="text-[10px] text-white/30">{biz.phone}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="space-y-3">
            {/* Revenue Overview */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5 text-green-400" /> Revenue Overview</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Total Collected", value: `₹${totalPaidRevenue.toLocaleString()}`, color: "text-green-400" },
                  { label: "Monthly Recurring", value: `₹${totalPlatformMRR.toLocaleString()}`, color: "text-blue-400" },
                  { label: "Annual Run-Rate", value: `₹${totalProjectedARR.toLocaleString()}`, color: "text-purple-400" },
                  { label: "Avg Per Business", value: `₹${totalBusinesses > 0 ? Math.round(totalPaidRevenue / totalBusinesses).toLocaleString() : 0}`, color: "text-amber-400" },
                ].map((item) => (
                  <div key={item.label} className="p-2.5 rounded-lg bg-white/5">
                    <span className="text-[9px] font-bold uppercase text-white/30 block">{item.label}</span>
                    <span className={`text-base font-black ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Conversion Funnel */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5"><BarChart3 className="h-3.5 w-3.5 text-blue-400" /> Conversion Funnel</h3>
              <div className="space-y-2">
                {[
                  { label: "Total Signups", value: totalBusinesses, pct: 100, color: "#6C4DFF" },
                  { label: "Active Paid", value: activePaidBusinesses, pct: conversionRate, color: "#16A34A" },
                  { label: "In Trial", value: trialBusinesses, pct: trialConversion, color: "#3B82F6" },
                  { label: "Expired / Churned", value: expiredBusinesses + suspendedBusinesses, pct: churnRate, color: "#EF4444" },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-white/70">{item.label}</span>
                      <span className="text-white/40">{item.value} ({item.pct}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(item.pct, 2)}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Churn & Health */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <span className="text-[9px] font-bold uppercase text-white/30 block">Churn Rate</span>
                <span className={`text-xl font-black ${churnRate > 20 ? "text-red-400" : churnRate > 10 ? "text-amber-400" : "text-green-400"}`}>{churnRate}%</span>
                <span className="text-[9px] text-white/20 block">{expiredBusinesses + suspendedBusinesses} lost</span>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <span className="text-[9px] font-bold uppercase text-white/30 block">Trial→Paid</span>
                <span className="text-xl font-black text-blue-400">{conversionRate}%</span>
                <span className="text-[9px] text-white/20 block">{activePaidBusinesses} converted</span>
              </div>
            </div>

            {/* Industry Breakdown */}
            {industriesList.length > 0 && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5"><PieChart className="h-3.5 w-3.5 text-purple-400" /> Industry Breakdown</h3>
                <div className="space-y-2">
                  {industriesList.map((item) => (
                    <div key={item.industry} className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-white/70 capitalize">{item.industry}</span>
                        <span className="text-white/40">{item.count} ({item.percentage}%)</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full bg-[#6C4DFF]" style={{ width: `${item.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Platform Activity */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <span className="text-[9px] font-bold uppercase text-white/30 block">Customers Tracked</span>
                <span className="text-xl font-black text-white">{totalCustomers}</span>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <span className="text-[9px] font-bold uppercase text-white/30 block">Total Visits</span>
                <span className="text-xl font-black text-white">{totalVisits}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-3 max-w-3xl">
            <form onSubmit={handleSavePlatformSettings} className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-4">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5"><Settings className="h-3.5 w-3.5 text-purple-400" /> Platform Configuration</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-white/50 uppercase mb-1">UPI ID *</label>
                  <input type="text" required value={upiIdInput} onChange={(e) => setUpiIdInput(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-mono text-white focus:border-[#6C4DFF] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/50 uppercase mb-1">UPI Name *</label>
                  <input type="text" required value={upiNameInput} onChange={(e) => setUpiNameInput(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-[#6C4DFF] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/50 uppercase mb-1">Trial Days *</label>
                  <input type="number" required min={1} max={90} value={trialDaysInput} onChange={(e) => setTrialDaysInput(Number(e.target.value))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-[#6C4DFF] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/50 uppercase mb-1">Support Email *</label>
                  <input type="email" required value={supportEmailInput} onChange={(e) => setSupportEmailInput(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-[#6C4DFF] focus:outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-white/50 uppercase mb-1">Support WhatsApp *</label>
                  <input type="text" required value={supportWhatsappInput} onChange={(e) => setSupportWhatsappInput(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-[#6C4DFF] focus:outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-white/50 uppercase mb-1">Verification Mode</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {[
                      { key: "manual_approval" as const, label: "Manual Approval", desc: "Founder verifies each payment" },
                      { key: "provisional_instant_access" as const, label: "Instant Access", desc: "Auto-grant on valid UTR" },
                    ].map((mode) => (
                      <button type="button" key={mode.key} onClick={() => setAutoVerificationMode(mode.key)} className={`p-2.5 rounded-lg border text-left transition-all ${autoVerificationMode === mode.key ? "border-[#6C4DFF] bg-[#6C4DFF]/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}>
                        <span className="text-[10px] font-bold text-white block">{mode.label}</span>
                        <span className="text-[9px] text-white/30">{mode.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-white/50 uppercase mb-1">Announcement Banner</label>
                  <textarea rows={2} value={announcementInput} onChange={(e) => setAnnouncementInput(e.target.value)} placeholder="Broadcast to all dashboards..." className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/30 focus:border-[#6C4DFF] focus:outline-none" />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={isSavingSettings} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#6C4DFF] text-white text-xs font-bold hover:bg-[#5B3FE8] transition-colors cursor-pointer disabled:opacity-50">
                  <Save className="h-3.5 w-3.5" /> Save Settings
                </button>
              </div>
            </form>

            {/* Danger Zone */}
            <div className="rounded-xl border border-dashed border-red-500/30 bg-red-500/5 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-xs font-bold text-red-400">Danger Zone</span>
              </div>
              <p className="text-[10px] text-white/30">Deletes ALL auth users, businesses, customers, visits, and WhatsApp data.</p>
              <button onClick={handleFullReset} disabled={isFullResetting} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white text-[11px] font-bold hover:bg-red-700 cursor-pointer disabled:opacity-50">
                {isFullResetting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                {isFullResetting ? "Resetting..." : "Full Reset"}
              </button>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {showResetPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#1A1D27] border border-white/10 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2"><Key className="h-4 w-4 text-[#6C4DFF]" /> Reset Password</h3>
                <button onClick={() => { setShowResetPasswordModal(false); setResetPasswordValue(""); }} className="text-white/40 hover:text-white"><X className="h-4 w-4" /></button>
              </div>
              <div className="text-[10px] text-white/40">For: <span className="text-white/70 font-bold">{resetPasswordEmail || businesses.find(b => b.id === resetPasswordBizId)?.owner_email}</span></div>
              <input type="text" placeholder="Enter new password (min 6 chars)" value={resetPasswordValue} onChange={(e) => setResetPasswordValue(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white placeholder-white/30 focus:border-[#6C4DFF] focus:outline-none" />
              <button onClick={handleResetPassword} disabled={resetPasswordLoading || resetPasswordValue.length < 6} className="w-full py-2.5 rounded-xl bg-[#6C4DFF] text-white text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 transition-all">
                {resetPasswordLoading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating...</> : "Update Password"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
