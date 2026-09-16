// Importers/Callers: Next.js App Router route `/join/[businessId]`, table/counter QR code scanned by customer
// Affected API: Customer public VIP registration & loyalty opt-in page
// Data Schemas: Business, Customer from src/lib/types.ts
// User's Verbatim Instruction: "when i scan this it need to open a sutomer from so the customer can directly register him self into the=is organization"

"use client";

import React, { useState, useEffect, use } from "react";
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
  Home,
  Dumbbell,
  ShoppingBag,
  UserCheck,
  Building2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

export default function CustomerJoinPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const resolvedParams = use(params);
  const businessId = resolvedParams.businessId;

  const [business, setBusiness] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [roomNumber, setRoomNumber] = useState("");
  const [birthday, setBirthday] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");

  useEffect(() => {
    async function loadBusiness() {
      try {
        const res = await fetch(`/api/join?businessId=${businessId}`);
        if (res.ok) {
          const data = await res.json();
          setBusiness(data.business);
        } else {
          // Fallback business
          setBusiness({
            id: businessId,
            name: "Organization Guest Portal",
            industry: "other",
            qr_loyalty_perk: "Welcome Perk & Direct Member Registration",
            phone: "+91 98201 12345",
          });
        }
      } catch (err) {
        setBusiness({
          id: businessId,
          name: "Organization Guest Portal",
          industry: "other",
          qr_loyalty_perk: "Welcome Perk & Direct Member Registration",
          phone: "+91 98201 12345",
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadBusiness();
  }, [businessId]);

  const isPG = business?.industry === "pg_hostel";
  const isGym = business?.industry === "gym";
  const isClothing = business?.industry === "clothing";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !business) return;

    setIsSubmitting(true);
    setError(null);

    const fullPhone = phone.startsWith("+")
      ? phone
      : `${countryCode}${phone.replace(/\D/g, "")}`;

    const notesExtra = isPG && roomNumber.trim() ? `Room/Bed: ${roomNumber.trim()}` : undefined;

    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: business.id,
          name: name.trim(),
          phone: fullPhone,
          birthday: birthday || undefined,
          notes: notesExtra,
          opt_in_source: "counter_qr",
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Failed to register. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Generate member/VIP coupon code
      const codePrefix = isPG ? "RES" : isGym ? "GYM" : "VIP";
      const couponCode = `${codePrefix}${Math.floor(1000 + Math.random() * 9000)}`;
      setGeneratedCode(couponCode);
      setIsSubmitted(true);
    } catch (err: any) {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const perkText =
    business?.qr_loyalty_perk ||
    (isPG
      ? "Welcome to our PG! Your resident profile is now active."
      : isGym
      ? "Welcome to our Fitness Studio! Your member profile is active."
      : "Get 10% OFF on your next bill!");

  const whatsappMessage = encodeURIComponent(
    isPG
      ? `Hi ${business?.name}! I just registered as a resident (${name}) with code *${generatedCode}*${roomNumber ? ` (Room: ${roomNumber})` : ""}.`
      : isGym
      ? `Hi ${business?.name}! I just registered as a gym member (${name}) with membership pass code *${generatedCode}*.`
      : `Hi ${business?.name}! I just joined your VIP Club using coupon code *${generatedCode}*. Looking forward to my perk: "${perkText}"!`
  );

  const whatsappUrl = `https://wa.me/${(business?.phone || "").replace(
    /\D/g,
    ""
  )}?text=${whatsappMessage}`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F8F9] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <RefreshCw className="h-7 w-7 animate-spin text-[#6C4DFF] mx-auto" />
          <p className="text-xs font-bold text-[#667085]">Connecting to {business?.name || "Business"}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F9] flex flex-col items-center justify-center p-4">
      {/* Container Box */}
      <div className="w-full max-w-md brand-card p-6 sm:p-8 shadow-xl animate-fade-in">
        {/* Brand Banner */}
        <div className="text-center mb-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl brand-gradient text-white shadow-lg shadow-purple-500/20 mb-3">
            {isPG ? (
              <Home className="h-8 w-8" />
            ) : isGym ? (
              <Dumbbell className="h-8 w-8" />
            ) : isClothing ? (
              <ShoppingBag className="h-8 w-8" />
            ) : (
              <Store className="h-8 w-8" />
            )}
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#6C4DFF]/10 px-3 py-1 text-xs font-bold text-[#6C4DFF] mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            {isPG
              ? "PG Resident Portal"
              : isGym
              ? "Gym Member Portal"
              : isClothing
              ? "VIP Shopper Club"
              : "VIP Loyalty Club"}
          </span>
          <h1 className="text-2xl font-black text-[#111439]">{business?.name}</h1>
          {business?.address && (
            <p className="text-xs text-[#667085] mt-1 font-medium">{business.address}</p>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {!isSubmitted ? (
          <>
            {/* Offer Callout Banner */}
            <div className="rounded-2xl brand-gradient text-white p-5 mb-6 shadow-md shadow-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
                  {isPG ? (
                    <Home className="h-5 w-5 text-white" />
                  ) : isGym ? (
                    <Dumbbell className="h-5 w-5 text-white" />
                  ) : (
                    <Gift className="h-5 w-5 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-white/80 uppercase tracking-wider">
                    {isPG
                      ? "Resident Self-Registration"
                      : isGym
                      ? "Member Self-Registration"
                      : "Instant Member Reward"}
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
                  placeholder={
                    isPG
                      ? "e.g. Rahul Sharma"
                      : isGym
                      ? "e.g. Vikram Verma"
                      : "e.g. Priya Patel"
                  }
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-4 py-2.5 text-xs font-medium text-[#111439] focus:border-[#6C4DFF] focus:bg-[#FFFFFF] focus:outline-none transition-all placeholder:text-[#94A3B8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5">
                  WhatsApp Mobile Number *
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
                    placeholder="98765 43210"
                    className="flex-1 rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-4 py-2.5 text-xs font-medium text-[#111439] focus:border-[#6C4DFF] focus:bg-[#FFFFFF] focus:outline-none transition-all placeholder:text-[#94A3B8]"
                  />
                </div>
              </div>

              {isPG ? (
                <div>
                  <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5">
                    Room / Bed Number <span className="text-[10px] text-[#667085] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. Room 204, Bed A"
                    className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-4 py-2.5 text-xs font-medium text-[#111439] focus:border-[#6C4DFF] focus:bg-[#FFFFFF] focus:outline-none transition-all placeholder:text-[#94A3B8]"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5">
                    Birthday <span className="text-[10px] text-[#667085] font-normal">(Optional, for special offers 🎂)</span>
                  </label>
                  <input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-4 py-2.5 text-xs font-medium text-[#111439] focus:border-[#6C4DFF] focus:bg-[#FFFFFF] focus:outline-none transition-all"
                  />
                </div>
              )}

              <div className="flex items-start gap-2 pt-1 text-[11px] text-[#667085]">
                <ShieldCheck className="h-4 w-4 text-[#16A34A] shrink-0 mt-0.5" />
                <span>
                  We respect your privacy. No spam — only updates & perks directly from {business?.name}.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl brand-gradient py-3.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-purple-500/20 hover:opacity-95 transition-all btn-interactive mt-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {isPG
                        ? "Register as Resident"
                        : isGym
                        ? "Register Gym Pass"
                        : "Claim Reward & Join VIP"}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
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
              <h2 className="text-xl font-black text-[#111439]">
                {isPG
                  ? "Resident Registration Confirmed!"
                  : isGym
                  ? "Membership Registration Confirmed!"
                  : "You're Officially Registered!"}
              </h2>
              <p className="text-xs text-[#667085] mt-1 font-medium">
                {isPG
                  ? "You have been registered in the resident system."
                  : isGym
                  ? "Show this confirmation to the gym desk to activate your daily check-in."
                  : "Show this confirmation screen to the cashier or staff to apply your reward."}
              </p>
            </div>

            {/* Voucher / Pass Card */}
            <div className="rounded-2xl border-2 border-dashed border-[#6C4DFF] bg-[#6C4DFF]/5 p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-[#6C4DFF]">
                {isPG ? "Resident Registration ID" : isGym ? "Membership Pass ID" : "VIP Coupon Code"}
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
                <span>Send WhatsApp Confirmation to {business?.name}</span>
              </a>

              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setName("");
                  setPhone("");
                  setRoomNumber("");
                }}
                className="w-full text-xs font-semibold text-[#667085] hover:text-[#111439] py-2 cursor-pointer"
              >
                Register another person
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