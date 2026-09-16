// Importers/Callers: Next.js App Router route `/profile`, desktop sidebar, mobile navigation, user dropdown menu.
// Affected API: Profile & Subscription billing page (manage plan, trial, billing UI, Dynamic UPI QR Scanner payment, UTR submission).
// Data Schemas: Business, SubscriptionPlan, SubscriptionPaymentRecord, PlatformCoreSettings, User from src/lib/types.ts.
// User's Verbatim Instruction: "WHEN I TRY TO PAY IT SAY Could not initiate transactions Please try again"

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
  QrCode,
  Copy,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Smartphone,
  Info,
} from "lucide-react";
import { SUBSCRIPTION_PLANS } from "@/lib/seedData";
import {
  generateUpiUri,
  generateAppSpecificUpiLinks,
  generateUpiQrCodeUrl,
  validateUtrNumber,
  DEFAULT_FOUNDER_UPI,
} from "@/lib/upi";

export default function ProfilePage() {
  const router = useRouter();
  const {
    activeBusiness,
    trialDaysRemaining,
    isTrialActive,
    isReadOnly,
    extendTrial,
    currentUser,
    platformSettings,
    subscriptionPayments,
    submitSubscriptionPayment,
  } = useApp();

  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [selectedPlanForUpi, setSelectedPlanForUpi] = useState<any | null>(null);
  const [utrInput, setUtrInput] = useState("");
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!activeBusiness?.id) return null;

  const founderUpiId = platformSettings?.upi_id || DEFAULT_FOUNDER_UPI.upi_id;
  const founderUpiName = platformSettings?.upi_name || DEFAULT_FOUNDER_UPI.upi_name;

  const handleOpenUpiModal = (plan: any) => {
    setSelectedPlanForUpi(plan);
    setUtrInput("");
    setErrorMessage(null);
  };

  const handleCloseUpiModal = () => {
    setSelectedPlanForUpi(null);
    setUtrInput("");
    setErrorMessage(null);
  };

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(founderUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleExtendTrial = () => {
    extendTrial(14);
    setSuccessMessage("Your trial has been extended by +14 days!");
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const calculatePlanAmount = (plan: any) => {
    const pricePerMonth =
      billingCycle === "monthly"
        ? plan.price_monthly_inr
        : Math.round(plan.price_monthly_inr * 0.8);
    return billingCycle === "monthly" ? pricePerMonth : pricePerMonth * 12;
  };

  const handleConfirmUpiPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForUpi) return;

    const cleanUtr = utrInput.trim().replace(/[^0-9]/g, "");
    const validation = validateUtrNumber(cleanUtr);
    if (!validation.isValid) {
      setErrorMessage(validation.error || "Please enter a valid 12-digit UPI Reference (UTR) number.");
      return;
    }

    setIsSubmittingUtr(true);
    setErrorMessage(null);

    try {
      const amount = calculatePlanAmount(selectedPlanForUpi);

      await submitSubscriptionPayment({
        business_id: activeBusiness.id,
        business_name: activeBusiness.name,
        owner_email: currentUser?.email || activeBusiness.owner_email,
        plan_id: selectedPlanForUpi.id,
        billing_cycle: billingCycle,
        amount_inr: amount,
        utr_reference: cleanUtr,
      });

      setIsSubmittingUtr(false);
      setSelectedPlanForUpi(null);
      setSuccessMessage(
        `UPI payment submitted with UTR: ${cleanUtr}. Your plan upgrade request has been sent to Admin for activation!`
      );
      setTimeout(() => setSuccessMessage(null), 7000);
    } catch (err: any) {
      setIsSubmittingUtr(false);
      setErrorMessage(err.message || "Failed to submit UPI payment. Please try again.");
    }
  };

  const businessPayments = (subscriptionPayments || []).filter(
    (p) => p.business_id === activeBusiness.id
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-[#111439]">Account &amp; Billing</h1>
          <span className="rounded-full bg-[#6C4DFF]/10 px-2.5 py-0.5 text-xs font-bold text-[#6C4DFF]">
            Plan Management
          </span>
        </div>
        <p className="text-xs text-[#667085] mt-1">
          Manage your subscription plan, direct zero-fee UPI QR payments, and 14-day free trial status.
        </p>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="rounded-2xl border border-[#16A34A]/30 bg-[#16A34A]/10 p-4 text-xs font-bold text-[#16A34A] flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="rounded-2xl border border-[#EF4444]/30 bg-[#EF4444]/10 p-4 text-xs font-bold text-[#EF4444] flex items-center gap-2 animate-fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
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
                className="flex items-center gap-1.5 rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-4 py-2 text-xs font-bold text-[#111439] hover:bg-[#F1F1F4] transition-colors cursor-pointer"
              >
                <Gift className="h-3.5 w-3.5 text-[#6C4DFF]" />
                <span>+14 Days Extension</span>
              </button>
            )}
          </div>
        </div>

        {/* Trial Progress Bar */}
        {activeBusiness.subscription_status === "trialing" && (
          <div className="mt-6 space-y-2 border-t border-[#EAECF0] pt-5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#667085]">14‑Day Free Trial Progress</span>
              <span className="font-bold text-[#111439]">
                {trialDaysRemaining} / 14 Days Remaining
              </span>
            </div>
            <div className="w-full bg-[#F8F8F9] rounded-full h-2.5 overflow-hidden">
              <div
                className="h-2.5 rounded-full brand-gradient text-white btn-interactive transition-all"
                style={{
                  width: `${Math.min(100, Math.max(0, (trialDaysRemaining / 14) * 100))}%`,
                }}
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
            Transparent flat pricing. Direct 1-click UPI QR scanner payment with zero transaction fees.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center gap-1 rounded-xl bg-[#F8F8F9] p-1 border border-[#EAECF0] shadow-none mt-2">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                billingCycle === "monthly"
                  ? "brand-gradient text-white shadow-md shadow-purple-500/20"
                  : "text-[#667085] hover:text-[#111439]"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                billingCycle === "yearly"
                  ? "brand-gradient text-white shadow-md shadow-purple-500/20"
                  : "text-[#667085] hover:text-[#111439]"
              }`}
            >
              Yearly (Save 20%)
            </button>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isCurrent =
              activeBusiness.subscription_plan === plan.id &&
              activeBusiness.subscription_status === "active";
            const price =
              billingCycle === "monthly"
                ? plan.price_monthly_inr
                : Math.round(plan.price_monthly_inr * 0.8);

            return (
              <div
                key={plan.id}
                className={`brand-card p-6 flex flex-col justify-between relative transition-all ${
                  plan.is_popular ? "border-[#6C4DFF] shadow-md shadow-purple-500/10" : ""
                }`}
              >
                {plan.is_popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full brand-gradient text-white btn-interactive px-3 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-xs">
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-black text-[#111439]">{plan.name}</h3>
                  </div>
                  <p className="text-xs text-[#667085] mb-4">{plan.description}</p>

                  <div className="flex items-baseline gap-1 mb-6 pb-4 border-b border-[#EAECF0]">
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

                <div className="mt-8 pt-4 border-t border-[#EAECF0]">
                  <button
                    disabled={isCurrent}
                    onClick={() => handleOpenUpiModal(plan)}
                    className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isCurrent
                        ? "bg-[#F8F8F9] text-[#94A3B8] cursor-not-allowed"
                        : plan.is_popular
                        ? "brand-gradient text-white btn-interactive shadow-md shadow-purple-500/20 hover:opacity-95"
                        : "bg-[#111439] text-white hover:bg-[#1a1d4a]"
                    }`}
                  >
                    {isCurrent ? (
                      <span>Current Active Plan</span>
                    ) : (
                      <>
                        <QrCode className="h-4 w-4" />
                        <span>Pay with UPI Scanner (₹{calculatePlanAmount(plan)})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoice & Payment History */}
      <div className="brand-card p-6">
        <div className="flex items-center justify-between mb-4 border-b border-[#EAECF0] pb-3">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-[#667085]" />
            <h2 className="text-sm font-bold text-[#111439]">Subscription Payment Submissions</h2>
          </div>
          <span className="text-xs text-[#667085] font-medium">
            {businessPayments.length} Total Records
          </span>
        </div>

        {businessPayments.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#667085] space-y-1">
            <p className="font-semibold text-[#111439]">No payment submissions yet</p>
            <p>When you scan and pay via UPI, your payment receipts and status will show here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EAECF0] text-[#667085] font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Plan</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">UTR Reference</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAECF0]">
                {businessPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F8F8F9]/50">
                    <td className="py-3 px-3 text-[#667085]">
                      {new Date(p.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-3 font-bold text-[#111439] uppercase">
                      {p.plan_id} ({p.billing_cycle})
                    </td>
                    <td className="py-3 px-3 font-black text-[#111439]">₹{p.amount_inr}</td>
                    <td className="py-3 px-3 font-mono text-[#6C4DFF] font-bold">
                      {p.utr_reference}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          p.status === "approved"
                            ? "bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20"
                            : p.status === "pending"
                            ? "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20"
                            : "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DYNAMIC UPI QR SCANNER PAYMENT MODAL */}
      {selectedPlanForUpi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="brand-card w-full max-w-lg p-6 sm:p-8 bg-white shadow-2xl relative max-h-[92vh] overflow-y-auto space-y-6">
            {/* Close button */}
            <button
              onClick={handleCloseUpiModal}
              className="absolute right-4 top-4 p-2 rounded-xl text-[#94A3B8] hover:text-[#111439] hover:bg-[#F1F1F4] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="text-center space-y-1">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl brand-gradient text-white shadow-md shadow-purple-500/20 mb-3">
                <QrCode className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-black text-[#111439]">
                Scan &amp; Pay via UPI
              </h2>
              <p className="text-xs text-[#667085]">
                Upgrade to <strong>{selectedPlanForUpi.name}</strong> (
                {billingCycle === "monthly" ? "1 Month" : "1 Year - 20% OFF"})
              </p>
            </div>

            {/* Dynamic UPI URI & Live QR Code */}
            {(() => {
              const amount = calculatePlanAmount(selectedPlanForUpi);
              const upiUri = generateUpiUri({
                upiId: founderUpiId,
                name: founderUpiName,
                amount,
                transactionNote: "Revia Subscription",
              });
              const appLinks = generateAppSpecificUpiLinks(upiUri);
              const qrCodeUrl = generateUpiQrCodeUrl(upiUri, 280);

              return (
                <div className="space-y-4">
                  {/* Total Amount Badge */}
                  <div className="rounded-2xl bg-[#F8F8F9] border border-[#EAECF0] p-4 text-center">
                    <span className="text-xs font-bold text-[#667085] uppercase tracking-wider block">
                      Payable Subscription Amount
                    </span>
                    <span className="text-3xl font-black text-[#111439]">
                      ₹{amount}
                    </span>
                  </div>

                  {/* QR Code Container */}
                  <div className="flex flex-col items-center justify-center p-4 bg-[#FFFFFF] rounded-2xl border-2 border-[#6C4DFF]/30 shadow-xs">
                    <img
                      src={qrCodeUrl}
                      alt="UPI QR Scanner"
                      className="w-56 h-56 object-contain rounded-xl border border-[#EAECF0] shadow-xs"
                    />
                    <div className="flex items-center gap-2 mt-3 text-[11px] font-bold text-[#16A34A]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Supports GPay, PhonePe, Paytm, BHIM &amp; Cred</span>
                    </div>
                  </div>

                  {/* Founder UPI ID with Copy Button */}
                  <div className="rounded-xl border border-[#EAECF0] bg-[#F8F8F9] p-3 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#94A3B8] block">
                        Direct UPI ID
                      </span>
                      <span className="text-xs font-black font-mono text-[#111439]">
                        {founderUpiId}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUpiId}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg brand-gradient text-white text-xs font-bold cursor-pointer hover:opacity-90 shadow-xs"
                    >
                      {copiedUpi ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy UPI</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Mobile Deep Link Intent Buttons */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">
                      Tap to Pay Directly (Mobile):
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={appLinks.gpay}
                        className="py-2.5 px-3 rounded-xl border border-[#EAECF0] bg-[#F8F8F9] hover:bg-[#F1F1F4] text-xs font-bold text-[#111439] flex items-center justify-center gap-2 transition-colors"
                      >
                        <Smartphone className="h-3.5 w-3.5 text-[#4285F4]" />
                        <span>Google Pay</span>
                      </a>
                      <a
                        href={appLinks.phonepe}
                        className="py-2.5 px-3 rounded-xl border border-[#EAECF0] bg-[#F8F8F9] hover:bg-[#F1F1F4] text-xs font-bold text-[#111439] flex items-center justify-center gap-2 transition-colors"
                      >
                        <Smartphone className="h-3.5 w-3.5 text-[#5f259f]" />
                        <span>PhonePe</span>
                      </a>
                      <a
                        href={appLinks.paytm}
                        className="py-2.5 px-3 rounded-xl border border-[#EAECF0] bg-[#F8F8F9] hover:bg-[#F1F1F4] text-xs font-bold text-[#111439] flex items-center justify-center gap-2 transition-colors"
                      >
                        <Smartphone className="h-3.5 w-3.5 text-[#00b9f5]" />
                        <span>Paytm</span>
                      </a>
                      <a
                        href={appLinks.generic}
                        className="py-2.5 px-3 rounded-xl brand-gradient text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Any UPI App</span>
                      </a>
                    </div>
                  </div>

                  {/* Step 2: Enter UTR reference */}
                  <form onSubmit={handleConfirmUpiPayment} className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Info className="h-3.5 w-3.5 text-[#6C4DFF]" />
                        <span>Enter 12-Digit UPI Ref / UTR Number *</span>
                      </label>
                      <input
                        type="text"
                        required
                        disabled={isSubmittingUtr}
                        value={utrInput}
                        onChange={(e) => setUtrInput(e.target.value)}
                        placeholder="e.g. 423892718291"
                        className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2.5 text-xs font-mono font-bold text-[#111439] placeholder-[#94A3B8] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none transition-colors"
                      />
                      <p className="text-[10px] text-[#667085] mt-1">
                        Found in your GPay / PhonePe / Paytm transaction details receipt after paying.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingUtr}
                      className="w-full py-3.5 rounded-xl brand-gradient text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50 btn-interactive"
                    >
                      {isSubmittingUtr ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <span>Confirm Payment &amp; Submit to Admin</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
