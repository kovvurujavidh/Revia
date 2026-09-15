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
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { businesses, staffMembers } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password,
    });

    if (authError) {
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
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await handlePostAuth(session.user.id, cleanEmail);
      }
      return;
    }

    setIsLoading(false);
    setSuccessMsg("Account created! Redirecting to business setup...");
    setTimeout(() => {
      router.push("/onboarding");
    }, 1000);
  };

  const handlePostAuth = async (userId: string, cleanEmail: string) => {
    const supabase = getSupabase();

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

    setIsLoading(false);
    router.push("/onboarding");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;

    setResetLoading(true);

    await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: resetEmail.trim().toLowerCase() }),
    });

    setResetLoading(false);
    setResetSent(true);
    setShowForgot(false);
  };

  if (showForgot) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center px-4">
        <div className="absolute inset-0 grid-bg opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] radial-glow"></div>

        <div className="relative w-full max-w-md animate-fade-in-up">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient text-white shadow-lg shadow-purple-500/20">
                <Zap className="h-5 w-5" />
              </div>
              <span className="text-xl font-black tracking-tight">Revia</span>
            </Link>
            <h1 className="text-2xl font-black text-white">Reset Password</h1>
            <p className="text-sm text-[#a1a1aa] mt-2">Enter your email and we&apos;ll send you a reset link.</p>
          </div>

          <div className="rounded-2xl border border-[#27272a] bg-[#18181b] p-8">
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 font-medium flex items-center gap-2 mb-4">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52525b]" />
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@business.com"
                    className="w-full rounded-xl border border-[#3f3f46] bg-[#27272a] pl-10 pr-4 py-3 text-sm text-white placeholder:text-[#52525b] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full py-3 rounded-xl brand-gradient text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{resetLoading ? "Sending..." : "Send Reset Link"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="text-center pt-4 border-t border-[#27272a] mt-4">
              <button
                onClick={() => { setShowForgot(false); setError(null); setResetSent(false); }}
                className="text-sm text-purple-400 hover:text-purple-300 font-semibold cursor-pointer transition-colors"
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
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center px-4">
      <div className="absolute inset-0 grid-bg opacity-20"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] radial-glow"></div>

      <div className="relative w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient text-white shadow-lg shadow-purple-500/20">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-tight">Revia</span>
          </Link>
          <h1 className="text-2xl font-black text-white">Welcome back</h1>
          <p className="text-sm text-[#a1a1aa] mt-2">Sign in to your retention dashboard</p>
        </div>

        <div className="rounded-2xl border border-[#27272a] bg-[#18181b] p-8">
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 font-medium flex items-center gap-2 mb-4">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-400 font-medium flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52525b]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@business.com"
                  className="w-full rounded-xl border border-[#3f3f46] bg-[#27272a] pl-10 pr-4 py-3 text-sm text-white placeholder:text-[#52525b] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[#a1a1aa]">Password</label>
                <button
                  type="button"
                  onClick={() => { setShowForgot(true); setResetEmail(email); setError(null); }}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52525b]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-[#3f3f46] bg-[#27272a] pl-10 pr-4 py-3 text-sm text-white placeholder:text-[#52525b] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl brand-gradient text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? "Signing in..." : "Sign In"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="text-center pt-4 border-t border-[#27272a] mt-4">
            <p className="text-sm text-[#71717a]">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="text-purple-400 font-bold hover:text-purple-300 transition-colors">
                Start Free Trial
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
