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
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { businesses, staffMembers } = useApp();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, password, name: name.trim() }),
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

    // Sign in on client to establish a session (needed for RLS in onboarding)
    const supabase = getSupabase();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (signInError) {
      setIsLoading(false);
      setError("Account created! Please sign in on the login page.");
      return;
    }

    if (result.existing) {
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

    setIsLoading(false);
    router.push("/onboarding");
  };

  return (
    <div className="min-h-screen bg-[#F8F8F9] flex flex-col items-center justify-center px-4">
      <div className="relative w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient text-white shadow-lg shadow-purple-500/20">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-[#111439]">Revia</span>
          </Link>
          <h1 className="text-2xl font-black text-[#111439]">Start Your Free Trial</h1>
          <p className="text-xs sm:text-sm text-[#667085] mt-1 font-medium">14 days unrestricted. No credit card required.</p>
        </div>

        <div className="brand-card p-6 sm:p-8 shadow-xl">
          {error && (
            <div className="rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 p-3 text-xs text-[#EF4444] font-semibold flex items-center gap-2 mb-4 animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#111439] mb-1.5 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikram Mehta"
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] pl-10 pr-4 py-2.5 text-xs text-[#111439] placeholder:text-[#94A3B8] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111439] mb-1.5 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@business.com"
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] pl-10 pr-4 py-2.5 text-xs text-[#111439] placeholder:text-[#94A3B8] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111439] mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] pl-10 pr-10 py-2.5 text-xs text-[#111439] placeholder:text-[#94A3B8] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#111439]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-[#EAECF0] bg-[#F8F8F9] p-3 space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-[#667085] font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#16A34A]" />
                <span>14 Days Unrestricted Access</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#667085] font-medium">
                <ShieldCheck className="h-3.5 w-3.5 text-[#16A34A]" />
                <span>1-Click WhatsApp Return Offers Included</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl brand-gradient text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50 btn-interactive"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Create Account & Start Free Trial</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-4 border-t border-[#EAECF0] mt-4">
            <p className="text-xs text-[#667085] font-medium">
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
