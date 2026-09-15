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
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl brand-gradient text-white shadow-lg shadow-purple-500/20 mb-4 animate-pulse-glow">
            <Zap className="h-6 w-6" />
          </div>
          <p className="text-sm text-[#71717a] font-medium">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center px-4 py-12">
      <div className="absolute inset-0 grid-bg opacity-20"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] radial-glow"></div>

      <div className="relative w-full max-w-xl animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl brand-gradient text-white shadow-lg shadow-purple-500/20 mb-4">
            <Zap className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Set Up Your Business
          </h1>
          <p className="text-sm text-[#a1a1aa] mt-2">
            Step {step} of 3 — Start your 14-day free trial
          </p>

          <div className="flex items-center justify-center gap-2 mt-5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step >= s ? "w-10 brand-gradient" : "w-2 bg-[#27272a]"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#27272a] bg-[#18181b] p-8">
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 font-medium flex items-center gap-2 mb-4">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">Business Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Olive & Thyme Bistro"
                  className="w-full rounded-xl border border-[#3f3f46] bg-[#27272a] px-4 py-3 text-sm text-white placeholder:text-[#52525b] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a1a1aa] mb-2.5">Industry</label>
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
                            ? "border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/5"
                            : "border-[#27272a] bg-[#09090b] hover:border-purple-500/30"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 mb-1">
                          <Icon className={`h-4 w-4 ${isSelected ? "text-purple-400" : "text-[#52525b]"}`} />
                          <p className={`text-xs font-bold ${isSelected ? "text-white" : "text-[#a1a1aa]"}`}>{cat.label}</p>
                        </div>
                        <p className="text-[11px] text-[#52525b] line-clamp-1">{cat.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                disabled={!name.trim()}
                onClick={() => setStep(2)}
                className="w-full py-3.5 rounded-xl brand-gradient text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
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
                <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">Business Phone (for WhatsApp)</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52525b]" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-[#3f3f46] bg-[#27272a] pl-10 pr-4 py-3 text-sm text-white placeholder:text-[#52525b] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                  />
                </div>
                <p className="text-[11px] text-[#52525b] mt-1.5">Used for WhatsApp campaign sender identity.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">Currency</label>
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
                          ? "border-purple-500/50 bg-purple-500/10 text-purple-400"
                          : "border-[#27272a] bg-[#09090b] text-[#52525b] hover:border-purple-500/30"
                      }`}
                    >
                      <span className="block text-lg font-black">{cur.symbol}</span>
                      <span className="block text-[11px] mt-0.5 font-semibold">{cur.code}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl border border-[#27272a] bg-[#09090b] text-sm font-bold text-[#71717a] hover:text-white hover:border-[#3f3f46] transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-[2] py-3.5 rounded-xl brand-gradient text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:opacity-95 transition-all"
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
              <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-purple-400" />
                  <h3 className="text-sm font-bold text-white">14-Day Free Trial Included</h3>
                </div>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                  Unlimited customer profiles, retention analytics, AI intelligence, and WhatsApp campaigns.
                </p>
              </div>

              <div className="rounded-xl border border-[#27272a] bg-[#09090b] p-4 space-y-2">
                <p className="text-sm font-bold text-white">Business: {name}</p>
                <p className="text-xs text-[#71717a]">Industry: {categories.find((c) => c.id === industry)?.label}</p>
                <p className="text-xs text-[#71717a]">Currency: {currency}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-xl border border-[#27272a] bg-[#09090b] text-sm font-bold text-[#71717a] hover:text-white hover:border-[#3f3f46] transition-all disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="flex-[2] py-3.5 rounded-xl brand-gradient text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:opacity-95 cursor-pointer disabled:opacity-50"
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
