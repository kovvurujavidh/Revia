// Importers/Callers: Next.js route `/auth/login`, Landing Page navigation, AppHeader.
// Affected API: Unified progressive user login & registration flow, Google OAuth, password reset, account-business sync.
// Data Schemas: User, Business, StaffMember from src/lib/types.ts.
// User's Verbatim Instruction: "Email login is working now so remove the manual email entry and password entry keep that one also and keep email google login when the google login and email login and need to be connected and when the user just login using the email it need to go to next step of login and create account and when the user uses google login or email login with same email it need to show the same data and do it like this Think and what need to be added and what connections need to be done for better experience and security please add this"

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { getSupabase, signInWithGooglePopup } from "@/lib/supabase/client";
import {
  Zap,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Pencil,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

type AuthStep = "email" | "password" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const { businesses, staffMembers } = useApp();

  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // 1. Google 1-Click Login / Signup
  const handleGoogleAuth = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      const { error: oauthError } = await signInWithGooglePopup();
      if (oauthError) {
        setIsGoogleLoading(false);
        setError(oauthError.message || "Failed to initialize Google Sign-In.");
      }
    } catch (err: any) {
      setIsGoogleLoading(false);
      setError(err.message || "Google authentication error occurred.");
    }
  };

  // 2. Step 1: Check Email and advance to Password or Signup step
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await res.json();

      setIsLoading(false);

      if (data.exists) {
        if (data.name) {
          setFullName(data.name);
        }
        setStep("password");
      } else {
        setStep("signup");
      }
    } catch (err: any) {
      setIsLoading(false);
      // Fallback to password step on network error
      setStep("password");
    }
  };

  // 3. Step 2A: Sign In with Password
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setError(null);
    setIsLoading(true);

    const supabase = getSupabase();
    const cleanEmail = email.trim().toLowerCase();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password,
    });

    if (authError) {
      setIsLoading(false);
      if (authError.message.includes("Invalid login credentials")) {
        setError("Incorrect password. Please try again or reset your password.");
      } else {
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

  // 4. Step 2B: Create Account (New User)
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Please enter your full name.");
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
      body: JSON.stringify({
        email: cleanEmail,
        password,
        name: fullName.trim(),
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      setIsLoading(false);
      if (result.error?.includes("already registered") || result.error?.includes("already exists")) {
        setStep("password");
        setError("This email is already registered. Please enter your password to sign in.");
      } else {
        setError(result.error || "Failed to create account. Please try again.");
      }
      return;
    }

    // Sign in on client to establish session
    const supabase = getSupabase();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (signInError) {
      setIsLoading(false);
      setError("Account created! Please sign in with your password.");
      setStep("password");
      return;
    }

    setIsLoading(false);
    router.push("/onboarding");
  };

  // 5. Post Auth Routing & Data Linking
  const handlePostAuth = async (userId: string, cleanEmail: string) => {
    const supabase = getSupabase();

    // 1. Direct user profile lookup
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (profile?.business_id) {
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

    // 2. Lookup existing business by owner_email
    const matchedBiz = businesses.find(
      (b) => b.owner_email?.toLowerCase().trim() === cleanEmail
    );

    if (matchedBiz) {
      await supabase.from("users").upsert({
        id: userId,
        business_id: matchedBiz.id,
        email: cleanEmail,
        full_name: matchedBiz.owner_name || fullName || cleanEmail.split("@")[0],
        role: "owner",
      });

      const { store } = await import("@/lib/store");
      await store.loadForBusiness(matchedBiz.id);
      setIsLoading(false);
      router.push("/dashboard");
      return;
    }

    // 3. Lookup staff member by email
    const matchedStaff = staffMembers.find(
      (s) => s.email?.toLowerCase().trim() === cleanEmail
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

  // 6. Reset Password Handler
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
    setSuccessMsg("Password reset link sent! Check your inbox.");
  };

  if (showForgot) {
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
            <h1 className="text-2xl font-black text-[#111439]">Reset Password</h1>
            <p className="text-sm text-[#667085] mt-2 font-medium">Enter your email and we&apos;ll send you a secure reset link.</p>
          </div>

          <div className="brand-card p-8 shadow-xl">
            {error && (
              <div className="rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 p-3 text-xs text-[#EF4444] font-medium flex items-center gap-2 mb-4">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#111439] mb-1.5 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@business.com"
                    className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] pl-10 pr-4 py-2.5 text-xs text-[#111439] placeholder:text-[#94A3B8] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full py-3 rounded-xl brand-gradient text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50 btn-interactive"
              >
                <span>{resetLoading ? "Sending link..." : "Send Reset Link"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="text-center pt-4 border-t border-[#EAECF0] mt-4">
              <button
                onClick={() => { setShowForgot(false); setError(null); setResetSent(false); }}
                className="text-xs text-[#6C4DFF] hover:underline font-bold cursor-pointer transition-colors"
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
    <div className="min-h-screen bg-[#F8F8F9] flex flex-col items-center justify-center px-4">
      <div className="relative w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient text-white shadow-lg shadow-purple-500/20">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-[#111439]">Revia</span>
          </Link>
          <h1 className="text-2xl font-black text-[#111439]">
            {step === "signup" ? "Start Your Free Trial" : "Welcome Back"}
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] mt-1 font-medium">
            {step === "signup"
              ? "14 days unrestricted access. No credit card required."
              : "Sign in to your customer retention workspace"}
          </p>
        </div>

        <div className="brand-card p-6 sm:p-8 shadow-xl">
          {error && (
            <div className="rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 p-3 text-xs text-[#EF4444] font-semibold flex items-center gap-2 mb-4 animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/20 p-3 text-xs text-[#16A34A] font-semibold flex items-center gap-2 mb-4 animate-fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Google 1-Click Secure Login / Signup (Always visible on step 1) */}
          {step === "email" && (
            <>
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isGoogleLoading || isLoading}
                className="w-full py-3 px-4 rounded-xl border border-[#EAECF0] bg-[#FFFFFF] hover:bg-[#F8F8F9] hover:border-[#D0D5DD] text-xs font-bold text-[#111439] flex items-center justify-center gap-3 transition-all shadow-xs cursor-pointer disabled:opacity-50 btn-interactive mb-4"
              >
                {isGoogleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#6C4DFF]" />
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>{isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
              </button>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-[#EAECF0] w-full" />
                <span className="bg-[#FFFFFF] px-3 text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8] absolute">
                  or continue with email
                </span>
              </div>
            </>
          )}

          {/* STEP 1: EMAIL ENTRY */}
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#111439] mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@business.com"
                    className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] pl-10 pr-4 py-2.5 text-xs text-[#111439] placeholder:text-[#94A3B8] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl brand-gradient text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50 btn-interactive mt-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2A: PASSWORD (EXISTING USER) */}
          {step === "password" && (
            <form onSubmit={handlePasswordLogin} className="space-y-4 animate-fade-in">
              {/* Selected Email Chip */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8F8F9] border border-[#EAECF0]">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Mail className="h-4 w-4 text-[#6C4DFF] shrink-0" />
                  <span className="text-xs font-bold text-[#111439] truncate">{email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setError(null);
                  }}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#6C4DFF] hover:underline shrink-0 ml-2"
                >
                  <Pencil className="h-3 w-3" />
                  <span>Edit</span>
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#111439] uppercase tracking-wider">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgot(true);
                      setResetEmail(email);
                      setError(null);
                    }}
                    className="text-xs text-[#6C4DFF] hover:underline font-bold cursor-pointer transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl brand-gradient text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50 btn-interactive mt-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Workspace</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep("signup")}
                  className="text-xs text-[#667085] hover:text-[#6C4DFF] font-medium"
                >
                  Need a new account? <span className="font-bold text-[#6C4DFF]">Create one here</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 2B: CREATE ACCOUNT & FREE TRIAL (NEW USER) */}
          {step === "signup" && (
            <form onSubmit={handleCreateAccount} className="space-y-4 animate-fade-in">
              {/* Selected Email Chip */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8F8F9] border border-[#EAECF0]">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Mail className="h-4 w-4 text-[#6C4DFF] shrink-0" />
                  <span className="text-xs font-bold text-[#111439] truncate">{email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setError(null);
                  }}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#6C4DFF] hover:underline shrink-0 ml-2"
                >
                  <Pencil className="h-3 w-3" />
                  <span>Edit</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111439] mb-1.5 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                  <input
                    type="text"
                    required
                    autoFocus
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Vikram Mehta"
                    className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] pl-10 pr-4 py-2.5 text-xs text-[#111439] placeholder:text-[#94A3B8] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111439] mb-1.5 uppercase tracking-wider">Set Password</label>
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
                  <span>14 Days Unrestricted Growth Access</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#667085] font-medium">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#16A34A]" />
                  <span>Zero Setup Fees • No Credit Card Required</span>
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

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep("password")}
                  className="text-xs text-[#667085] hover:text-[#6C4DFF] font-medium"
                >
                  Already have a password? <span className="font-bold text-[#6C4DFF]">Sign in directly</span>
                </button>
              </div>
            </form>
          )}

          {/* Footer Navigation */}
          <div className="text-center pt-4 border-t border-[#EAECF0] mt-5 space-y-2">
            <p className="text-[11px] text-[#667085]">
              Cashier / Staff Member?{" "}
              <Link href="/auth/staff-login" className="text-[#3B82F6] font-bold hover:underline">
                Login with Mobile Number
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
