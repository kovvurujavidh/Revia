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
  Mail,
  User,
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

  // Check session on mount - redirect to login if no session
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
    { id: "restaurant", label: "Restaurant / Dining", icon: Utensils, desc: "Tables, dinner orders, high weekend volume" },
    { id: "cafe", label: "Café / Bakery", icon: Coffee, desc: "High repeat rate, daily regulars, coffee cards" },
    { id: "salon_spa", label: "Salon & Spa", icon: Sparkles, desc: "Appointment cycles, 30-day service repeat" },
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

    // Get current Supabase Auth session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const user = session?.user;

    if (sessionError || !user) {
      setIsLoading(false);
      setError("Session expired. Please sign in again.");
      return;
    }

    const userId = user.id;
    const userEmail = user.email || "";

    // 1. Create business
    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .insert({
        name: name.trim(),
        industry,
        owner_name: name.trim(),
        owner_email: userEmail,
        phone: phone.trim(),
        currency,
        subscription_plan: "growth",
        subscription_status: "trialing",
        trial_start_date: new Date().toISOString(),
        trial_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select("id")
      .single();

    if (bizError || !business) {
      setIsLoading(false);
      setError(bizError?.message || "Failed to create business. Please try again.");
      return;
    }

    // 2. Create user profile linked to business
    const { error: userError } = await supabase
      .from("users")
      .upsert({
        id: userId,
        business_id: business.id,
        email: userEmail,
        full_name: name.trim(),
        role: "owner",
      });

    if (userError) {
      setIsLoading(false);
      setError(userError.message || "Failed to create user profile. Please try again.");
      return;
    }

    // 3. Load business into app context
    const { store } = await import("@/lib/store");
    await store.loadForBusiness(business.id);

    updateBusiness({
      id: business.id,
      name: name.trim(),
      industry,
      phone: phone.trim(),
      currency,
      owner_email: userEmail,
      owner_name: name.trim(),
    });

    setIsLoading(false);
    router.push("/dashboard");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F8F8F9] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl brand-gradient text-white shadow-md shadow-[#6C4DFF]/25 mb-4 animate-pulse">
            <Zap className="h-6 w-6" />
          </div>
          <p className="text-xs text-[#667085] font-semibold">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F9] flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-fade-in">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center mb-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl brand-gradient text-white shadow-md shadow-[#6C4DFF]/25 mb-4">
          <Zap className="h-6 w-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#111439]">
          Set Up Your Business Workspace
        </h1>
        <p className="text-xs text-[#667085] mt-1.5">
          Step {step} of 3 • Start your 14-day free trial
        </p>

        <div className="flex items-center justify-center gap-2 mt-4">
          <div className={`h-1.5 rounded-full transition-all ${step >= 1 ? "w-8 bg-[#6C4DFF]" : "w-2 bg-[#E8E8ED]"}`} />
          <div className={`h-1.5 rounded-full transition-all ${step >= 2 ? "w-8 bg-[#6C4DFF]" : "w-2 bg-[#E8E8ED]"}`} />
          <div className={`h-1.5 rounded-full transition-all ${step >= 3 ? "w-8 bg-[#6C4DFF]" : "w-2 bg-[#E8E8ED]"}`} />
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="brand-card p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="rounded-xl bg-[#EF4444]/10 p-3 text-xs text-[#EF4444] font-semibold flex items-center gap-2 mb-4">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Business Name & Industry */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-[#111439] mb-1.5">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Olive & Thyme Bistro"
                  className="w-full rounded-xl border border-[#E8E8ED] bg-[#F8F8F9] px-4 py-3 text-sm font-medium text-[#111439] focus:border-[#6C4DFF] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111439] mb-2.5">
                  Select Industry Vertical *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = industry === cat.id;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setIndustry(cat.id)}
                        className={`rounded-2xl border p-3.5 cursor-pointer transition-all ${
                          isSelected
                            ? "border-[#6C4DFF] bg-[#6C4DFF]/5 ring-1 ring-[#6C4DFF]/20"
                            : "border-[#E8E8ED] bg-white hover:border-[#6C4DFF]/40"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 mb-1">
                          <Icon className={`h-4 w-4 ${isSelected ? "text-[#6C4DFF]" : "text-[#667085]"}`} />
                          <p className="text-xs font-bold text-[#111439]">{cat.label}</p>
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
                className="w-full py-3.5 rounded-xl brand-gradient text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#6C4DFF]/20 hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Contact & Currency */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-[#111439] mb-1.5">
                  Business Phone (for WhatsApp)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-[#E8E8ED] bg-[#F8F8F9] pl-10 pr-4 py-3 text-sm font-medium text-[#111439] focus:border-[#6C4DFF] focus:bg-white focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-[#667085] mt-1">
                  Used for WhatsApp campaign sender identity.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111439] mb-1.5">
                  Operational Currency *
                </label>
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
                      className={`p-3 rounded-xl border text-center transition-all ${
                        currency === cur.code
                          ? "border-[#6C4DFF] bg-[#6C4DFF]/5 text-[#6C4DFF] font-bold"
                          : "border-[#E8E8ED] bg-white text-[#667085] hover:bg-gray-50 font-medium"
                      }`}
                    >
                      <span className="block text-lg font-black">{cur.symbol}</span>
                      <span className="block text-[11px] mt-0.5">{cur.code}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl border border-[#E8E8ED] bg-white text-xs font-bold text-[#667085] hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-2 py-3.5 rounded-xl brand-gradient text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#6C4DFF]/20 hover:opacity-95"
                >
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Launch */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="rounded-2xl bg-[#6C4DFF]/5 p-5 border border-[#6C4DFF]/20 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#6C4DFF]" />
                  <h3 className="text-sm font-bold text-[#111439]">14-Day Free Trial Included</h3>
                </div>
                <p className="text-xs text-[#667085] leading-relaxed">
                  Unlimited customer profiles, retention analytics, AI intelligence, and WhatsApp campaigns.
                </p>
              </div>

              <div className="rounded-xl bg-[#F8F8F9] p-3 space-y-1.5 border border-[#E8E8ED]">
                <p className="text-xs font-bold text-[#111439]">Business: {name}</p>
                <p className="text-[11px] text-[#667085]">Industry: {categories.find((c) => c.id === industry)?.label}</p>
                <p className="text-[11px] text-[#667085]">Currency: {currency}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-xl border border-[#E8E8ED] bg-white text-xs font-bold text-[#667085] hover:bg-gray-50 disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="flex-2 py-3.5 rounded-xl brand-gradient text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#6C4DFF]/20 hover:opacity-95 cursor-pointer disabled:opacity-50"
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
