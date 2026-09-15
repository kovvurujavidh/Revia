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
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { businesses, staffMembers } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    const supabase = getSupabase();
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try Supabase Auth sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password,
    });

    if (authError) {
      // Wrong password or user not found
      if (authError.message.includes("Invalid login credentials")) {
        setIsLoading(false);
        setError("Email or password is incorrect. Please try again.");
        return;
      } else {
        setIsLoading(false);
        setError(authError.message || "Login failed. Please try again.");
      }
      return;
    }

    if (authData?.user) {
      await handlePostAuth(authData.user.id, cleanEmail);
    } else {
      setIsLoading(false);
      setError("Login failed. Please try again.");
    }
  };

  // Auto-create account if email not found (server-side, no rate limit)
  const handleAutoSignup = async (cleanEmail: string, pass: string) => {
    setIsLoading(true);
    setError(null);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, password: pass, name: cleanEmail.split("@")[0] }),
    });

    const result = await res.json();

    if (!res.ok) {
      setIsLoading(false);
      setError(result.error || "Failed to create account. Please try again.");
      return;
    }

    if (result.existing) {
      // Already had auth account - signed in via the API
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await handlePostAuth(session.user.id, cleanEmail);
      }
      return;
    }

    // New account created
    setIsLoading(false);
    setSuccessMsg("Account created! Redirecting to business setup...");
    setTimeout(() => {
      router.push("/onboarding");
    }, 1000);
  };

  // After successful auth - load business profile
  const handlePostAuth = async (userId: string, cleanEmail: string) => {
    const supabase = getSupabase();

    // Check if user profile exists in public.users
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (profile) {
      const { store } = await import("@/lib/store");
      await store.loadForBusiness(profile.business_id);
      setIsLoading(false);

      if (profile.role === "staff" || profile.role === "manager") {
        router.push("/add-visit");
      } else {
        router.push("/dashboard");
      }
      return;
    }

    // No profile yet - check if email is owner or staff
    const matchedBiz = businesses.find(
      (b) => b.owner_email?.toLowerCase() === cleanEmail
    );

    if (matchedBiz) {
      await supabase.from("users").upsert({
        id: userId,
        business_id: matchedBiz.id,
        email: cleanEmail,
        full_name: matchedBiz.owner_name || cleanEmail.split("@")[0],
        role: "owner",
      });

      const { store } = await import("@/lib/store");
      await store.loadForBusiness(matchedBiz.id);
      setIsLoading(false);
      router.push("/dashboard");
      return;
    }

    const matchedStaff = staffMembers.find(
      (s) => s.email?.toLowerCase() === cleanEmail
    );

    if (matchedStaff) {
      const bizId = matchedStaff.business_id || businesses[0]?.id;
      if (bizId) {
        await supabase.from("users").upsert({
          id: userId,
          business_id: bizId,
          email: cleanEmail,
          full_name: matchedStaff.name || cleanEmail.split("@")[0],
          role: matchedStaff.role || "staff",
        });

        const { store } = await import("@/lib/store");
        await store.loadForBusiness(bizId);
        setIsLoading(false);
        router.push("/add-visit");
        return;
      }
    }

    // New user - go to onboarding
    setIsLoading(false);
    router.push("/onboarding");
  };

  // Forgot password (server-side, bypasses rate limit)
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;

    setResetLoading(true);

    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: resetEmail.trim().toLowerCase() }),
    });

    setResetLoading(false);

    // Always show success (don't reveal if email exists)
    setResetSent(true);
    setShowForgot(false);
  };

  // Forgot password modal
  if (showForgot) {
    return (
      <div className="min-h-screen bg-[#F8F8F9] flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-fade-in">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl brand-gradient text-white shadow-md shadow-[#6C4DFF]/25">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-[#111439]">Revia</span>
          </Link>
          <h1 className="text-2xl font-black text-[#111439]">Reset Password</h1>
          <p className="text-xs text-[#667085] mt-1.5">
            Enter your email and we&apos;ll send you a reset link.
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

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#111439] mb-1.5">
                  Your Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" />
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@business.com"
                    className="w-full rounded-xl border border-[#E8E8ED] bg-[#F8F8F9] pl-10 pr-4 py-2.5 text-xs font-semibold text-[#111439] focus:border-[#6C4DFF] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full py-3 rounded-xl brand-gradient text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#6C4DFF]/20 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{resetLoading ? "Sending..." : "Send Reset Link"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="text-center pt-2 border-t border-[#E8E8ED]">
              <button
                onClick={() => {
                  setShowForgot(false);
                  setError(null);
                  setResetSent(false);
                }}
                className="text-xs font-bold text-[#6C4DFF] hover:underline cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          Sign In to Your Workspace
        </h1>
        <p className="text-xs text-[#667085] mt-1.5">
          Owner &amp; Staff access to customer retention intelligence
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

          {successMsg && (
            <div className="rounded-xl bg-[#16A34A]/10 p-3 text-xs text-[#16A34A] font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
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
                  className="w-full rounded-xl border border-[#E8E8ED] bg-[#F8F8F9] pl-10 pr-4 py-2.5 text-xs font-semibold text-[#111439] focus:border-[#6C4DFF] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#111439]">Password *</label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgot(true);
                    setResetEmail(email);
                    setError(null);
                  }}
                  className="text-[11px] text-[#6C4DFF] hover:underline font-semibold cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-[#E8E8ED] bg-[#F8F8F9] pl-10 pr-4 py-2.5 text-xs font-semibold text-[#111439] focus:border-[#6C4DFF] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl brand-gradient text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#6C4DFF]/20 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? "Signing in..." : "Sign In"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-[#E8E8ED]">
            <p className="text-xs text-[#667085]">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="text-[#6C4DFF] font-bold hover:underline">
                Start 14-Day Free Trial
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
