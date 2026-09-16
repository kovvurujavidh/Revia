"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { getSupabase } from "@/lib/supabase/client";
import {
  Smartphone,
  Mail,
  Lock,
  User,
  Building2,
  ArrowRight,
  Zap,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Home,
  Clock,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

export default function StaffLoginPage() {
  const router = useRouter();
  const { loginAsStaffUser, businesses } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    name: string;
    businessName: string;
    role: string;
  } | null>(null);

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessInfo(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = getSupabase();

      // Sign in with Supabase Auth (email + password)
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (authError) {
        setIsLoading(false);
        if (authError.message.includes("Invalid login credentials")) {
          setError("Incorrect email or password. Please try again or ask your owner to reset your access.");
        } else {
          setError(authError.message || "Login failed. Please try again.");
        }
        return;
      }

      if (!authData?.user) {
        setIsLoading(false);
        setError("Login failed. Please try again.");
        return;
      }

      // Look up the user profile in public.users to get role and business
      const { data: userProfile, error: profileErr } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (profileErr) {
        console.error("Profile lookup error:", profileErr);
      }

      if (!userProfile?.business_id) {
        setIsLoading(false);
        setError("Your account is not linked to any business. Please ask your store owner to set up your access.");
        return;
      }

      // Fetch business name
      let bizName = "Your Business";
      const { data: bizRecord } = await supabase
        .from("businesses")
        .select("name")
        .eq("id", userProfile.business_id)
        .maybeSingle();

      if (bizRecord?.name) {
        bizName = bizRecord.name;
      }

      setSuccessInfo({
        name: userProfile.full_name,
        businessName: bizName,
        role: userProfile.role,
      });

      // Set user in context
      await loginAsStaffUser({
        id: authData.user.id,
        email: cleanEmail,
        full_name: userProfile.full_name,
        role: userProfile.role as any,
        business_id: userProfile.business_id,
        created_at: userProfile.created_at || new Date().toISOString(),
      });

      setTimeout(() => {
        if (userProfile.role === "staff") {
          router.push("/add-visit");
        } else {
          router.push("/dashboard");
        }
      }, 1200);
    } catch (err: any) {
      console.error("Staff login error:", err);
      setError(err?.message || "Authentication error. Please check your credentials.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F9] text-[#111439] flex flex-col justify-between">
      {/* Top Header */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient text-white shadow-lg shadow-purple-500/20">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-[#111439]">
              Revia
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-xl border border-[#EAECF0] bg-[#FFFFFF] px-3.5 py-2 text-xs font-semibold text-[#667085] hover:text-[#111439] hover:bg-[#F1F1F4] transition-colors"
            >
              <Home className="h-4 w-4 text-[#6C4DFF]" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <Link
              href="/auth/login"
              className="text-xs font-bold text-[#6C4DFF] hover:underline transition-colors px-2 py-1"
            >
              Owner Login
            </Link>
          </div>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="brand-card p-6 sm:p-8 shadow-xl">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl brand-gradient text-white shadow-lg shadow-purple-500/20 mb-4">
                  <Smartphone className="h-7 w-7" />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-[#111439]">
                  Staff &amp; Manager Login
                </h1>
                <p className="text-xs text-[#667085] leading-relaxed">
                  Sign in with the email and password set by your business owner.
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 p-3.5 text-xs text-[#EF4444] font-medium flex items-start gap-2.5 animate-fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {successInfo && (
                <div className="rounded-xl border border-[#16A34A]/30 bg-[#16A34A]/10 p-4 text-xs text-[#16A34A] space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Verified! Logging you in...</span>
                  </div>
                  <div className="text-[11px] text-[#111439] bg-[#FFFFFF] p-2.5 rounded-lg border border-[#16A34A]/20">
                    <p>Team Member: <strong>{successInfo.name}</strong></p>
                    <p>Store: <strong>{successInfo.businessName}</strong></p>
                    <p className="capitalize">Role: <strong>{successInfo.role}</strong></p>
                  </div>
                </div>
              )}

              <form onSubmit={handleStaffLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-[#6C4DFF]" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    required
                    disabled={isLoading || !!successInfo}
                    placeholder="you@business.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2.5 text-xs font-medium text-[#111439] placeholder-[#94A3B8] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-[#6C4DFF]" />
                    <span>Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      disabled={isLoading || !!successInfo}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2.5 pr-10 text-xs font-medium text-[#111439] placeholder-[#94A3B8] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none transition-colors"
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
                  disabled={isLoading || !!successInfo}
                  className="w-full flex items-center justify-center gap-2 rounded-xl brand-gradient py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-purple-500/20 hover:opacity-95 disabled:opacity-50 transition-all btn-interactive mt-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In as Staff</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-4 border-t border-[#EAECF0] text-center space-y-2">
                <p className="text-xs text-[#667085] font-medium">
                  Are you the business owner?{" "}
                  <Link href="/auth/login" className="text-[#6C4DFF] font-bold hover:underline">
                    Sign in here
                  </Link>
                </p>
                <p className="text-[11px] text-[#667085]">
                  Platform Founder?{" "}
                  <Link href="/auth/admin-login" className="text-[#111439] hover:underline font-semibold">
                    Admin Portal Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center text-xs text-[#667085] py-4 px-4">
        © {new Date().getFullYear()} Revia Customer Retention Platform • All rights reserved.
      </div>
    </div>
  );
}
