"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase/client";
import {
  Zap,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

type ResetStep = "loading" | "form" | "success" | "error";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<ResetStep>("loading");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  // Validate password strength
  const validatePassword = useCallback((pw: string): string[] => {
    const errs: string[] = [];
    if (pw.length < 6) errs.push("At least 6 characters");
    if (pw.length > 0 && pw.length < 6) errs.push("Password too short");
    return errs;
  }, []);

  useEffect(() => {
    if (newPassword) {
      setPasswordErrors(validatePassword(newPassword));
    } else {
      setPasswordErrors([]);
    }
  }, [newPassword, validatePassword]);

  // On mount, extract tokens from URL hash or query params and establish session
  useEffect(() => {
    const handleTokenExchange = async () => {
      const supabase = getSupabase();

      // Supabase sends tokens in URL hash (#access_token=...&refresh_token=...&type=recovery)
      // or as query params depending on version
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.substring(1)); // remove the #
      const queryParams = searchParams;

      const accessToken = params.get("access_token") || queryParams.get("access_token");
      const refreshToken = params.get("refresh_token") || queryParams.get("refresh_token");
      const type = params.get("type") || queryParams.get("type");

      // Also handle the "code" flow (PKCE) that newer Supabase versions use
      const code = params.get("code") || queryParams.get("code");

      if (code) {
        // PKCE code exchange
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error("Code exchange error:", error);
            setStep("error");
            setError("This reset link is invalid or has expired. Please request a new one.");
            return;
          }
          setStep("form");
          return;
        } catch (e) {
          console.error("Code exchange failed:", e);
          setStep("error");
          setError("This reset link is invalid or has expired. Please request a new one.");
          return;
        }
      }

      if (accessToken && refreshToken && type === "recovery") {
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("Session set error:", error);
            setStep("error");
            setError("This reset link is invalid or has expired. Please request a new one.");
            return;
          }

          setStep("form");
        } catch (e) {
          console.error("Token exchange failed:", e);
          setStep("error");
          setError("This reset link is invalid or has expired. Please request a new one.");
        }
        return;
      }

      // If user already has a session (e.g., came back to the page), allow form
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setStep("form");
      } else {
        setStep("error");
        setError("This reset link is invalid or has expired. Please request a new password reset from the login page.");
      }
    };

    handleTokenExchange();
  }, [searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword.trim()) {
      setError("Please enter a new password.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = getSupabase();
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        console.error("Password update error:", updateError);
        setError(updateError.message || "Failed to update password. The link may have expired.");
        setIsLoading(false);
        return;
      }

      // Password updated successfully
      setStep("success");

      // Sign out and redirect to login after 3 seconds
      setTimeout(async () => {
        await supabase.auth.signOut();
        router.push("/auth/login");
      }, 3000);
    } catch (e: any) {
      console.error("Reset error:", e);
      setError(e?.message || "Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  // Loading state while checking token
  if (step === "loading") {
    return (
      <div className="min-h-screen bg-[#F8F8F9] flex flex-col items-center justify-center px-4">
        <div className="relative w-full max-w-sm animate-fade-in">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient text-white shadow-lg shadow-purple-500/20">
                <Zap className="h-5 w-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-[#111439]">Revia</span>
            </Link>
          </div>
          <div className="brand-card p-8 shadow-xl text-center space-y-4">
            <Loader2 className="h-8 w-8 text-[#6C4DFF] animate-spin mx-auto" />
            <p className="text-xs text-[#667085] font-medium">Verifying your reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (step === "error") {
    return (
      <div className="min-h-screen bg-[#F8F8F9] flex flex-col items-center justify-center px-4">
        <div className="relative w-full max-w-sm animate-fade-in">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient text-white shadow-lg shadow-purple-500/20">
                <Zap className="h-5 w-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-[#111439]">Revia</span>
            </Link>
          </div>
          <div className="brand-card p-8 shadow-xl text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444]">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h1 className="text-lg font-black text-[#111439]">Link Expired or Invalid</h1>
            <p className="text-xs text-[#667085] leading-relaxed">{error}</p>
            <div className="space-y-2.5 pt-2">
              <Link
                href="/auth/login"
                className="w-full flex items-center justify-center gap-2 rounded-xl brand-gradient py-3 text-xs font-bold text-white shadow-md shadow-purple-500/20 hover:opacity-95 transition-all btn-interactive"
              >
                <span>Back to Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth/login"
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#EAECF0] bg-white py-3 text-xs font-bold text-[#6C4DFF] hover:bg-[#6C4DFF]/5 transition-all"
              >
                Request New Reset Link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (step === "success") {
    return (
      <div className="min-h-screen bg-[#F8F8F9] flex flex-col items-center justify-center px-4">
        <div className="relative w-full max-w-sm animate-fade-in">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient text-white shadow-lg shadow-purple-500/20">
                <Zap className="h-5 w-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-[#111439]">Revia</span>
            </Link>
          </div>
          <div className="brand-card p-8 shadow-xl text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#16A34A]/10 border border-[#16A34A]/20 text-[#16A34A]">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h1 className="text-lg font-black text-[#111439]">Password Updated!</h1>
            <p className="text-xs text-[#667085] leading-relaxed">
              Your password has been successfully changed. Redirecting you to sign in...
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-[#6C4DFF] font-bold">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Redirecting to login...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen bg-[#F8F8F9] flex flex-col items-center justify-center px-4">
      <div className="relative w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient text-white shadow-lg shadow-purple-500/20">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-[#111439]">Revia</span>
          </Link>
          <h1 className="text-2xl font-black text-[#111439]">Set New Password</h1>
          <p className="text-sm text-[#667085] mt-2 font-medium">
            Create a strong password for your account.
          </p>
        </div>

        <div className="brand-card p-8 shadow-xl">
          {error && (
            <div className="rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 p-3 text-xs text-[#EF4444] font-semibold flex items-center gap-2 mb-4 animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#111439] mb-1.5 uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoFocus
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
              {passwordErrors.length > 0 && newPassword.length > 0 && (
                <div className="mt-1.5 space-y-0.5">
                  {passwordErrors.map((err, i) => (
                    <p key={i} className="text-[10px] text-[#EF4444] font-medium">
                      {err}
                    </p>
                  ))}
                </div>
              )}
              {newPassword.length > 0 && passwordErrors.length === 0 && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <div className="flex-1 h-1.5 rounded-full bg-[#EAECF0] overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${
                      newPassword.length >= 12 ? "w-full bg-[#16A34A]" :
                      newPassword.length >= 8 ? "w-2/3 bg-[#F59E0B]" :
                      "w-1/3 bg-[#EF4444]"
                    }`} />
                  </div>
                  <span className={`text-[10px] font-bold ${
                    newPassword.length >= 12 ? "text-[#16A34A]" :
                    newPassword.length >= 8 ? "text-[#F59E0B]" :
                    "text-[#EF4444]"
                  }`}>
                    {newPassword.length >= 12 ? "Strong" : newPassword.length >= 8 ? "Good" : "Weak"}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111439] mb-1.5 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] pl-10 pr-10 py-2.5 text-xs text-[#111439] placeholder:text-[#94A3B8] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#111439]"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-1.5 text-[10px] text-[#EF4444] font-medium">
                  Passwords do not match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              className="w-full py-3 rounded-xl brand-gradient text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50 btn-interactive mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Updating password...</span>
                </>
              ) : (
                <>
                  <span>Update Password</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-4 border-t border-[#EAECF0] mt-4">
            <Link
              href="/auth/login"
              className="text-xs text-[#6C4DFF] hover:underline font-bold transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#F8F8F9] flex flex-col items-center justify-center px-4">
      <div className="relative w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient text-white shadow-lg shadow-purple-500/20">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-[#111439]">Revia</span>
          </Link>
        </div>
        <div className="brand-card p-8 shadow-xl text-center space-y-4">
          <Loader2 className="h-8 w-8 text-[#6C4DFF] animate-spin mx-auto" />
          <p className="text-xs text-[#667085] font-medium">Loading...</p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
