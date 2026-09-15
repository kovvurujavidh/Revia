"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { getSupabase } from "@/lib/supabase/client";
import {
  Zap,
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { businesses, staffMembers } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError(null);
    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    // Use server-side API to create account (bypasses rate limit)
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: cleanEmail,
        password,
        name: name.trim(),
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      setIsLoading(false);
      if (result.error?.includes("already registered") || result.error?.includes("already exists")) {
        setError("This email is already registered. Please sign in instead.");
      } else {
        setError(result.error || "Failed to create account. Please try again.");
      }
      return;
    }

    // If existing user was signed in
    if (result.existing) {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile } = await supabase
          .from("users")
          .select("business_id, role")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          const { store } = await import("@/lib/store");
          await store.loadForBusiness(profile.business_id);
          setIsLoading(false);
          router.push(profile.role === "staff" || profile.role === "manager" ? "/add-visit" : "/dashboard");
          return;
        }
      }

      setIsLoading(false);
      router.push("/dashboard");
      return;
    }

    // New user - go to onboarding
    setIsLoading(false);
    router.push("/onboarding");
  };

  return (
    <div className="min-h-screen bg-[#F8F8F9] flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-fade-in">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl brand-gradient text-white shadow-md shadow-[#6C4DFF]/25">
            <Zap className="h-5 w-5" />
          </div>
          <span className="text-xl font-black tracking-tight text-[#111439]">
            Revia
          </span>
        </Link>
        <h1 className="text-2xl font-black text-[#111439]">
          Start Your 14-Day Free Trial
        </h1>
        <p className="text-xs text-[#667085] mt-1.5">
          Zero risk. No credit card required. Setup takes under 2 minutes.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="brand-card p-6 sm:p-8 shadow-sm space-y-6">
          {error && (
            <div className="rounded-xl bg-[#EF4444]/10 p-3 text-xs text-[#EF4444] font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#111439] mb-1.5">
                Your Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikram Mehta"
                  className="w-full rounded-xl border border-[#E8E8ED] bg-[#F8F8F9] pl-10 pr-4 py-2.5 text-xs font-medium text-[#111439] focus:border-[#6C4DFF] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111439] mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@business.com"
                  className="w-full rounded-xl border border-[#E8E8ED] bg-[#F8F8F9] pl-10 pr-4 py-2.5 text-xs font-medium text-[#111439] focus:border-[#6C4DFF] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111439] mb-1.5">
                Create Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-[#E8E8ED] bg-[#F8F8F9] pl-10 pr-4 py-2.5 text-xs font-medium text-[#111439] focus:border-[#6C4DFF] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="rounded-xl bg-[#F8F8F9] p-3 space-y-1.5 border border-[#E8E8ED]">
              <div className="flex items-center gap-1.5 text-[11px] text-[#667085]">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#16A34A]" />
                <span>14 Days Unrestricted Access</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#667085]">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#16A34A]" />
                <span>1-Click WhatsApp Return Offers</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl brand-gradient text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#6C4DFF]/20 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? "Creating account..." : "Create Account & Start Free Trial"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-[#E8E8ED]">
            <p className="text-xs text-[#667085]">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-[#6C4DFF] font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
