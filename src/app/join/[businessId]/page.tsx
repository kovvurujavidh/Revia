// Importers/Callers: Next.js App Router route `/join/[businessId]`, table/counter QR code scanned by customer
// Affected API: Customer public VIP registration & loyalty opt-in page
// Data Schemas: Business, Customer from src/lib/types.ts
// User's Verbatim Instruction: "AFTER LOGIN THE LEFT SIDE BAR IS GOOD NOT FIT FOR MOBILE OK SEE THE WHOLE DOT CHANGECONCEPTOR CODE PLESE CHECH MOBILE FRENDLY AND THE COLORS WE CHOOSE NOW AND REQUIREMETS DOC IS DIFFERENT KEEP ANIMATIONS ONLY CHANGE COLORS TO MACTH PRODUCTION LEVEL WEBSITE"

"use client";

import React, { useState, use } from "react";
import { useApp } from "@/context/AppContext";
import {
  Sparkles,
  Gift,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  Clock,
  ExternalLink,
  Store,
} from "lucide-react";
import Link from "next/link";

export default function CustomerJoinPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const resolvedParams = use(params);
  const businessId = resolvedParams.businessId;
  const { businesses, addCustomer } = useApp();

  const fallbackBusiness = {
    id: businessId || "biz-1",
    name: "VIP Loyalty Club",
    phone: "+91 98201 12345",
    address: "Local Store",
    qr_loyalty_perk: "Get 10% OFF on your bill today!",
  };

  const business =
    businesses.find((b) => b.id === businessId) || businesses[0] || fallbackBusiness;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [birthday, setBirthday] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const fullPhone = phone.startsWith("+")
      ? phone
      : `${countryCode}${phone.replace(/\D/g, "")}`;

    // Create or find customer in the business
    addCustomer({
      business_id: business.id,
      name: name.trim(),
      phone: fullPhone,
      whatsapp_opt_in: true,
      birthday: birthday || undefined,
      notes: "Opted-in via Table/Counter QR Code",
    });

    // Generate VIP coupon code
    const couponCode = `VIP${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedCode(couponCode);
    setIsSubmitted(true);
  };

  const perkText =
    business?.qr_loyalty_perk || "Get 10% OFF on your bill today!";

  const whatsappMessage = encodeURIComponent(
    `Hi ${business?.name || "Store"}! I just joined your VIP Club using coupon code *${generatedCode}*. Looking forward to my reward perk: "${perkText}"!`
  );
  const whatsappUrl = `https://wa.me/${(business?.phone || "").replace(
    /\D/g,
    ""
  )}?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-[#F8F8F9] flex flex-col items-center justify-center p-4">
      {/* Container Box */}
      <div className="w-full max-w-md brand-card p-6 sm:p-8 shadow-xl">
        {/* Brand Banner */}
        <div className="text-center mb-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl brand-gradient text-white shadow-lg shadow-purple-500/20 mb-3">
            <Store className="h-8 w-8" />
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#6C4DFF]/10 px-3 py-1 text-xs font-bold text-[#6C4DFF] mb-2">
            <Sparkles className="h-3.5 w-3.5" /> VIP Loyalty Club
          </span>
          <h1 className="text-2xl font-black text-[#111439]">{business?.name || "VIP Club"}</h1>
          <p className="text-xs text-[#667085] mt-1 font-medium">{business?.address || "Local Store"}</p>
        </div>

        {!isSubmitted ? (
          <>
            {/* Offer Callout Banner */}
            <div className="rounded-2xl brand-gradient text-white p-5 mb-6 shadow-md shadow-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
                  <Gift className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white/80 uppercase tracking-wider">
                    Instant Member Reward
                  </p>
                  <p className="text-sm font-bold text-white mt-0.5">{perkText}</p>
                </div>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Patel"
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-4 py-2.5 text-xs font-medium text-[#111439] focus:border-[#6C4DFF] focus:bg-[#FFFFFF] focus:outline-none transition-all placeholder:text-[#94A3B8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5">
                  WhatsApp Number *
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3 py-2.5 text-xs font-bold text-[#111439] focus:outline-none focus:bg-[#FFFFFF]"
                  >
                    <option value="+91">+91 (IN)</option>
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+971">+971 (UAE)</option>
                  </select>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="flex-1 rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-4 py-2.5 text-xs font-medium text-[#111439] focus:border-[#6C4DFF] focus:bg-[#FFFFFF] focus:outline-none transition-all placeholder:text-[#94A3B8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5">
                  Birthday <span className="text-[10px] text-[#667085] font-normal">(Optional, for surprise birthday perks 🎂)</span>
                </label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-4 py-2.5 text-xs font-medium text-[#111439] focus:border-[#6C4DFF] focus:bg-[#FFFFFF] focus:outline-none transition-all"
                />
              </div>

              <div className="flex items-start gap-2 pt-1 text-[11px] text-[#667085]">
                <ShieldCheck className="h-4 w-4 text-[#16A34A] shrink-0 mt-0.5" />
                <span>
                  We respect your privacy. No spam — only exclusive perks & updates directly from {business?.name || "us"}.
                </span>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl brand-gradient py-3.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-purple-500/20 hover:opacity-95 transition-all btn-interactive mt-2 cursor-pointer"
              >
                <span>Claim Reward & Join VIP</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </>
        ) : (
          /* Confirmation State */
          <div className="text-center py-4 space-y-5 animate-fade-in">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#16A34A]/10 text-[#16A34A]">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div>
              <h2 className="text-xl font-black text-[#111439]">You&apos;re Officially in the VIP Club!</h2>
              <p className="text-xs text-[#667085] mt-1 font-medium">
                Show this confirmation screen to the cashier or staff to apply your reward.
              </p>
            </div>

            {/* Voucher Card */}
            <div className="rounded-2xl border-2 border-dashed border-[#6C4DFF] bg-[#6C4DFF]/5 p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-[#6C4DFF]">
                Your VIP Coupon Code
              </p>
              <p className="text-3xl font-black text-[#111439] tracking-widest my-2 font-mono">
                {generatedCode}
              </p>
              <p className="text-xs font-bold text-[#16A34A]">
                🎁 {perkText}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#25D366] py-3 text-xs font-bold text-white shadow-md hover:bg-[#20bd5a] transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Send WhatsApp Confirmation to Store</span>
              </a>

              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setName("");
                  setPhone("");
                }}
                className="w-full text-xs font-semibold text-[#667085] hover:text-[#111439] py-2 cursor-pointer"
              >
                Register another member
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 border-t border-[#EAECF0] pt-4 text-center">
          <Link
            href="/"
            className="text-[11px] font-bold text-[#6C4DFF] hover:underline transition-colors"
          >
            Powered by Revia
          </Link>
        </div>
      </div>
    </div>
  );
}