// Importers/Callers: Next.js route `/onboarding`, Auth sign-up flow redirect.
// Affected API: Multi-step business registration wizard, categories selector, initial trial configuration.
// Data Schemas: Business, IndustryType, User from src/lib/types.ts.
// User's Verbatim Instruction: "AFTER LOGIN THE LEFT SIDE BAR IS GOOD NOT FIT FOR MOBILE OK SEE THE WHOLE DOT CHANGECONCEPTOR CODE PLESE CHECH MOBILE FRENDLY AND THE COLORS WE CHOOSE NOW AND REQUIREMETS DOC IS DIFFERENT KEEP ANIMATIONS ONLY CHANGE COLORS TO MACTH PRODUCTION LEVEL WEBSITE"

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { getSupabase } from "@/lib/supabase/client";
import {
  Utensils,
  Coffee,
  Sparkles,
  Dumbbell,
  ShoppingBag,
  Stethoscope,
  ArrowRight,
  CheckCircle2,
  Phone,
  Zap,
  AlertCircle,
} from "lucide-react";
import { IndustryType } from "@/lib/types";

export default function OnboardingPage() {
  const router = useRouter();
  const { updateBusiness } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState<IndustryType>("restaurant");
  const [phone, setPhone] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/login");
        return;
      }
      setCheckingAuth(false);
    };
    checkSession();
  }, [router]);

  const categories: { id: IndustryType; label: string; icon: any; desc: string }[] = [
    { id: "restaurant", label: "Restaurant / Dining", icon: Utensils, desc: "Tables, dinner orders, weekend volume" },
    { id: "cafe", label: "Café / Bakery", icon: Coffee, desc: "Daily regulars, coffee cards" },
    { id: "salon_spa", label: "Salon & Spa", icon: Sparkles, desc: "Appointment cycles, 30-day repeats" },
    { id: "gym", label: "Fitness & Gym", icon: Dumbbell, desc: "Membership tracking, workout frequency" },
    { id: "retail", label: "Retail & Boutique", icon: ShoppingBag, desc: "Seasonal shoppers, catalog promotions" },
    { id: "clinic", label: "Clinic / Wellness", icon: Stethoscope, desc: "Follow-up checkups, patient care" },
  ];

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setError(null);

    const supabase = getSupabase();

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const user = session?.user;

    if (sessionError || !user) {
      setIsLoading(false);
      setError("Session expired. Please sign in again.");
      return;
    }

    // Use server-side API to create business + user (bypasses RLS)
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        email: user.email || "",
        name: name.trim(),
        industry,
        phone: phone.trim(),
        currency,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      setIsLoading(false);
      setError(result.error || "Failed to create business. Please try again.");
      return;
    }

    const { store } = await import("@/lib/store");
    await store.loadForBusiness(result.businessId);

    updateBusiness({
      id: result.businessId,
      name: name.trim(),
      industry,
      phone: phone.trim(),
      currency,
      owner_email: user.email || "",
      owner_name: name.trim(),
    });

    setIsLoading(false);
    router.push("/dashboard");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F8F8F9] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl brand-gradient text-white shadow-lg shadow-purple-500/20 mb-4 animate-pulse">
            <Zap className="h-6 w-6" />
          </div>
          <p className="text-sm text-[#667085] font-medium">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F9] flex flex-col items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-xl animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl brand-gradient text-white shadow-lg shadow-purple-500/20 mb-4">
            <Zap className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111439]">
            Set Up Your Business
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] mt-1">
            Step {step} of 3 — Start your 14-day free trial
          </p>

          <div className="flex items-center justify-center gap-2 mt-5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step >= s ? "w-10 brand-gradient" : "w-2 bg-[#EAECF0]"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="brand-card p-6 sm:p-8 shadow-xl">
          {error && (
            <div className="rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 p-3 text-xs text-[#EF4444] font-semibold flex items-center gap-2 mb-4 animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-2">Business Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Olive & Thyme Bistro"
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-4 py-2.5 text-xs text-[#111439] placeholder:text-[#94A3B8] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-2.5">Industry</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = industry === cat.id;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setIndustry(cat.id)}
                        className={`rounded-xl border p-3.5 cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? "border-[#6C4DFF] bg-[#6C4DFF]/10 shadow-md shadow-purple-500/10"
                            : "border-[#EAECF0] bg-[#F8F8F9] hover:border-[#6C4DFF]/30 hover:bg-[#FFFFFF]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 mb-1">
                          <Icon className={`h-4 w-4 ${isSelected ? "text-[#6C4DFF]" : "text-[#667085]"}`} />
                          <p className={`text-xs font-bold ${isSelected ? "text-[#111439]" : "text-[#667085]"}`}>{cat.label}</p>
                        </div>
                        <p className="text-[11px] text-[#667085] line-clamp-1">{cat.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                disabled={!name.trim()}
                onClick={() => setStep(2)}
                className="w-full py-3.5 rounded-xl brand-gradient text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer btn-interactive"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-2">Business Phone (for WhatsApp)</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] pl-10 pr-4 py-2.5 text-xs text-[#111439] placeholder:text-[#94A3B8] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none transition-colors"
                  />
                </div>
                <p className="text-[11px] text-[#667085] mt-1.5 font-medium">Used for WhatsApp campaign sender identity.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-2">Currency</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { code: "INR", symbol: "₹" },
                    { code: "USD", symbol: "$" },
                    { code: "AED", symbol: "د.إ" },
                  ].map((cur) => (
                    <button
                      key={cur.code}
                      type="button"
                      onClick={() => setCurrency(cur.code)}
                      className={`p-3 rounded-xl border text-center transition-all duration-200 ${
                        currency === cur.code
                          ? "border-[#6C4DFF] bg-[#6C4DFF]/10 text-[#6C4DFF] font-black"
                          : "border-[#EAECF0] bg-[#F8F8F9] text-[#667085] hover:border-[#6C4DFF]/30 hover:bg-[#FFFFFF]"
                      }`}
                    >
                      <span className="block text-lg font-black text-[#111439]">{cur.symbol}</span>
                      <span className="block text-[11px] mt-0.5 font-bold">{cur.code}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl border border-[#EAECF0] bg-[#F8F8F9] text-xs font-bold text-[#667085] hover:text-[#111439] hover:bg-[#F1F1F4] transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-[2] py-3.5 rounded-xl brand-gradient text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 hover:opacity-95 transition-all btn-interactive"
                >
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="rounded-xl border border-[#6C4DFF]/30 bg-[#6C4DFF]/10 p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#6C4DFF]" />
                  <h3 className="text-sm font-bold text-[#111439]">14-Day Free Trial Included</h3>
                </div>
                <p className="text-xs text-[#667085] leading-relaxed">
                  Unlimited customer profiles, retention analytics, AI intelligence, and WhatsApp campaigns.
                </p>
              </div>

              <div className="rounded-xl border border-[#EAECF0] bg-[#F8F8F9] p-4 space-y-2">
                <p className="text-xs font-bold text-[#111439]">Business: {name}</p>
                <p className="text-xs text-[#667085]">Industry: {categories.find((c) => c.id === industry)?.label}</p>
                <p className="text-xs text-[#667085]">Currency: {currency}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-xl border border-[#EAECF0] bg-[#F8F8F9] text-xs font-bold text-[#667085] hover:text-[#111439] hover:bg-[#F1F1F4] transition-all disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="flex-[2] py-3.5 rounded-xl brand-gradient text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 hover:opacity-95 cursor-pointer disabled:opacity-50 btn-interactive"
                >
                  <Zap className="h-4 w-4" />
                  <span>{isLoading ? "Creating Workspace..." : "Launch My Dashboard"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}