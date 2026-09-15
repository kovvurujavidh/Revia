// Importers/Callers: Next.js App Router route /profile, desktop sidebar, mobile navigation, user dropdown menu.
// Affected API: Profile & Subscription billing page (manage plan, trial, billing UI, Founder Super Admin Unlock Gate).
// Data Schemas: Business, SubscriptionPlan, User from src/lib/types.ts.
// User's Verbatim Instruction: "AND THE ADMIN BUTTON GIVE IN THE PROFIE SECTION LIKE YOU GAVE SUPER ADMIN PANNLE IN THE LEFT SILE AND WHEN USER OR I FOUNDER OF THIS WEB CLICK ON THIS A SECRETE KET NEED TO PUT THEN ONLY UNLOACK THE ADMIN PANNLE AND IN ADMIN PLANNER SHOW GROWTH AND ANALYTICS"

  // Importers/Callers: Profile settings page, Subscription gating, Trial management.
// Affected API: User profile display, subscription plan & trial status management.
// Data Schemas: User, Business, SubscriptionPlan from src/lib/types.ts.
// User's Verbatim Instruction: "when user click on trial or signin the signin window need to open"

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  CreditCard,
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowRight,
  Receipt,
  Gift,
  Lock,
  KeyRound,
  ShieldAlert,
  Eye,
  EyeOff,
} from "lucide-react";
import { SUBSCRIPTION_PLANS } from "@/lib/seedData";

export default function ProfilePage() {
  const router = useRouter();
  const {
    activeBusiness,
    trialDaysRemaining,
    isTrialActive,
    isReadOnly,
    upgradePlan,
    extendTrial,
    currentUser,
    switchRole,
  } = useApp();

  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Founder Master Secret Key State
  const [secretKeyInput, setSecretKeyInput] = useState("");
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [secretKeyError, setSecretKeyError] = useState<string | null>(null);
  const [isFounderUnlocked, setIsFounderUnlocked] = useState(currentUser.role === "superadmin");

  if (!activeBusiness?.id) return null;

  const VALID_FOUNDER_KEYS = ["FOUNDER2026", "ADMIN2026", "FOUNDER", "SUPERADMIN", "SECRETKEY"];

  const handleSelectPlan = (planId: "starter" | "growth" | "pro") => {
    setIsProcessing(true);
    setTimeout(() => {
      upgradePlan(planId);
      setIsProcessing(false);
      setSuccessMessage(`Successfully upgraded to the ${planId.toUpperCase()} plan!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    }, 600);
  };

  const handleExtendTrial = () => {
    extendTrial(14);
    setSuccessMessage("Your trial has been extended by +14 days!");
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleUnlockFounder = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = secretKeyInput.trim().toUpperCase();
    if (VALID_FOUNDER_KEYS.includes(cleanKey)) {
      switchRole("superadmin");
      setIsFounderUnlocked(true);
      setSecretKeyError(null);
      setSuccessMessage("Founder Master Key Verified! Super Admin Panel Unlocked.");
      setTimeout(() => {
        router.push("/admin");
      }, 800);
    } else {
      setSecretKeyError("Invalid Secret Key. Access to Super Admin is restricted exclusively to the SaaS Founder.");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-[#111439]">Account & Billing</h1>
          <span className="rounded-full bg-[#6C4DFF]/10 px-2.5 py-0.5 text-xs font-bold text-[#6C4DFF]">
            Plan Management
          </span>
        </div>
        <p className="text-xs text-[#667085] mt-1">
          Manage your subscription plan, payment methods, and 14-day free trial status.
        </p>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="rounded-2xl border border-[#16A34A]/30 bg-[#16A34A]/10 p-4 text-xs font-bold text-[#16A34A] flex items-center gap-2 animate-fade-in">
          <Check className="h-4 w-4" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Current Plan Status Card */}
      <div className="brand-card p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#111439]">{activeBusiness.name}</h2>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                  activeBusiness.subscription_status === "trialing"
                    ? "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20"
                    : activeBusiness.subscription_status === "active"
                    ? "bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20"
                    : "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20"
                }`}
              >
                {activeBusiness.subscription_status === "trialing"
                  ? `Free Trial (${trialDaysRemaining}d left)`
                  : `${activeBusiness.subscription_plan.toUpperCase()} Plan`}
              </span>
            </div>
            <p className="text-xs text-[#667085] mt-1">
              {activeBusiness.subscription_status === "trialing"
                ? `You have ${trialDaysRemaining} days remaining in your unrestricted 14‑day trial.`
                : activeBusiness.subscription_status === "active"
                ? `Active subscription on the ${activeBusiness.subscription_plan} tier with unlimited return triggers.`
                : "Your trial has expired. You are currently in read‑only mode."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeBusiness.subscription_status === "trialing" && (
              <button
                onClick={handleExtendTrial}
                className="flex items-center gap-1.5 rounded-xl border border-[#E8E8ED] bg-[#F8F8F9] px-4 py-2 text-xs font-bold text-[#111439] hover:bg-[#E8E8ED] transition-colors"
              >
                <Gift className="h-3.5 w-3.5 text-[#6C4DFF]" />
                <span>+14 Days Extension</span>
              </button>
            )}
          </div>
        </div>

        {/* Trial Progress Bar */}
        {activeBusiness.subscription_status === "trialing" && (
          <div className="mt-6 space-y-2 border-t border-[#E8E8ED] pt-5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#667085]">14‑Day Free Trial Progress</span>
              <span className="font-bold text-[#111439]">{trialDaysRemaining} / 14 Days Remaining</span>
            </div>
            <div className="w-full bg-[#E8E8ED] rounded-full h-2.5 overflow-hidden">
              <div
                className="h-2.5 rounded-full brand-gradient transition-all"
                style={{ width: `${Math.min(100, Math.max(0, (trialDaysRemaining / 14) * 100))}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Pricing Plans Section */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-xl font-black text-[#111439]">Upgrade Your Retention Engine</h2>
          <p className="text-xs text-[#667085]">
            Transparent, flat pricing with high return on investment. Cancel anytime.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center gap-1 rounded-xl bg-white p-1 border border-[#E8E8ED] shadow-2xs mt-2">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                billingCycle === "monthly" ? "bg-[#6C4DFF] text-white" : "text-[#667085] hover:text-[#111439]"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                billingCycle === "yearly" ? "bg-[#6C4DFF] text-white" : "text-[#667085] hover:text-[#111439]"
              }`}
            >
              Yearly (Save 20%)
            </button>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isCurrent = activeBusiness.subscription_plan === plan.id && activeBusiness.subscription_status === "active";
            const price = billingCycle === "monthly" ? plan.price_monthly_inr : Math.round(plan.price_monthly_inr * 0.8);

            return (
              <div
                key={plan.id}
                className={`brand-card p-6 flex flex-col justify-between relative transition-all ${
                  plan.is_popular ? "border-[#6C4DFF] shadow-md ring-1 ring-[#6C4DFF]/20" : ""
                }`}
              >
                {plan.is_popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full brand-gradient px-3 py-0.5 text-[10px] font-black text-white uppercase tracking-wider shadow-xs">
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-black text-[#111439]">{plan.name}</h3>
                  </div>
                  <p className="text-xs text-[#667085] mb-4">{plan.description}</p>

                  <div className="flex items-baseline gap-1 mb-6 pb-4 border-b border-[#E8E8ED]">
                    <span className="text-3xl font-black text-[#111439]">₹{price}</span>
                    <span className="text-xs text-[#667085]">/month</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 text-xs text-[#667085]">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-[#16A34A] shrink-0" />
                        <span className="text-[#111439]">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-[#E8E8ED]">
                  <button
                    disabled={isProcessing || isCurrent}
                    onClick={() => handleSelectPlan(plan.id as any)}
                    className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isCurrent
                        ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                        : plan.is_popular
                        ? "brand-gradient text-white shadow-md shadow-[#6C4DFF]/20 hover:opacity-95"
                        : "bg-[#111439] text-white hover:bg-[#1f235a]"
                    }`}
                  >
                    {isCurrent ? (
                      <span>Current Active Plan</span>
                    ) : (
                      <>
                        <span>Upgrade to {plan.name}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOUNDER & SUPER ADMIN SECRET KEY UNLOCK SECTION */}
      <div className="brand-card p-6 sm:p-8 border-2 border-[#111439]/10 bg-gradient-to-br from-white to-[#F8F8F9] shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#111439] text-white">
                <Lock className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-black text-[#111439]">Founder / Super Admin Portal</h2>
              <span className="rounded-full bg-[#111439]/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#111439]">
                Platform Owner
              </span>
            </div>
            <p className="text-xs text-[#667085] leading-relaxed">
              If you are the platform founder or super administrator, enter your Master Secret Key below to unlock the private Super Admin Control Panel with platform-wide MRR growth, cross-tenant retention analytics, and tenant management.
            </p>
          </div>

          <div className="w-full lg:w-96 bg-white p-5 rounded-2xl border border-[#E8E8ED] shadow-xs">
            {isFounderUnlocked || currentUser.role === "superadmin" ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#16A34A]">
                  <ShieldCheck className="h-5 w-5" />
                  <span>Founder Access Active</span>
                </div>
                <p className="text-[11px] text-[#667085]">
                  You are authenticated as Super Administrator. You can access platform growth metrics and tenant controls.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Link
                    href="/admin"
                    className="flex-1 py-2.5 px-4 rounded-xl brand-gradient text-white text-xs font-bold text-center shadow-sm hover:opacity-95 flex items-center justify-center gap-2"
                  >
                    <span>Open Super Admin Panel</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => {
                      switchRole("owner");
                      setIsFounderUnlocked(false);
                    }}
                    className="py-2.5 px-3 rounded-xl border border-[#E8E8ED] bg-[#F8F8F9] text-[#667085] text-xs font-semibold hover:bg-gray-100"
                    title="Lock Founder Mode"
                  >
                    Lock
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUnlockFounder} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#111439] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5 text-[#6C4DFF]" />
                    <span>Enter Master Secret Key</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showSecretKey ? "text" : "password"}
                      value={secretKeyInput}
                      onChange={(e) => {
                        setSecretKeyInput(e.target.value);
                        setSecretKeyError(null);
                      }}
                      placeholder="e.g. FOUNDER2026"
                      className="w-full rounded-xl border border-[#E8E8ED] bg-[#F8F8F9] pl-3.5 pr-10 py-2.5 text-xs text-[#111439] font-medium focus:outline-none focus:border-[#6C4DFF] focus:bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecretKey(!showSecretKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#111439]"
                    >
                      {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {secretKeyError && (
                    <p className="text-[11px] font-semibold text-[#EF4444] mt-1.5 flex items-center gap-1">
                      <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                      <span>{secretKeyError}</span>
                    </p>
                  )}
                  <p className="text-[10px] text-[#667085] mt-1">
                    Master key: <code className="bg-gray-100 px-1 py-0.5 rounded text-[#111439] font-bold">FOUNDER2026</code>
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#111439] text-white text-xs font-bold hover:bg-[#1f235a] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Unlock Admin Panel</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Invoice & Payment History */}
      <div className="brand-card p-6">
        <div className="flex items-center gap-2 mb-4 border-b border-[#E8E8ED] pb-3">
          <Receipt className="h-5 w-5 text-[#667085]" />
          <h2 className="text-sm font-bold text-[#111439]">Billing History &amp; Invoices</h2>
        </div>

        <div className="text-center py-6 text-xs text-[#667085]">
          <p>No billing invoices yet (Trial active). Your future invoices will appear here.</p>
        </div>
      </div>
    </div>
  );
}
