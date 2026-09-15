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
      setError("Account created but sign-in failed. Please go to login page.");
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
          <h1 className="text-2xl font-black text-white">Start Your Free Trial</h1>
          <p className="text-sm text-[#a1a1aa] mt-2">14 days free. No credit card required.</p>
        </div>

        <div className="rounded-2xl border border-[#27272a] bg-[#18181b] p-8">
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 font-medium flex items-center gap-2 mb-4">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52525b]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikram Mehta"
                  className="w-full rounded-xl border border-[#3f3f46] bg-[#27272a] pl-10 pr-4 py-3 text-sm text-white placeholder:text-[#52525b] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                />
              </div>
            </div>

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
              <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52525b]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-[#3f3f46] bg-[#27272a] pl-10 pr-4 py-3 text-sm text-white placeholder:text-[#52525b] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="rounded-xl border border-[#27272a] bg-[#09090b] p-3 space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#a1a1aa]">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>14 Days Unrestricted Access</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#a1a1aa]">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>1-Click WhatsApp Return Offers</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl brand-gradient text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? "Creating account..." : "Create Account & Start Free Trial"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="text-center pt-4 border-t border-[#27272a] mt-4">
            <p className="text-sm text-[#71717a]">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-purple-400 font-bold hover:text-purple-300 transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
