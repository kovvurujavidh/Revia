// Importers/Callers: Next.js route `/auth/staff-login`, Landing page "Login as Staff" button in header & footer, navigation links.
// Affected API: Staff phone & name authentication, Supabase users lookup, session role derivation (staff | manager), routing to /add-visit.
// Data Schemas: User, StaffMember, Business from src/lib/types.ts.
// User's Verbatim Instruction: "AFTER LOGIN THE LEFT SIDE BAR IS GOOD NOT FIT FOR MOBILE OK SEE THE WHOLE DOT CHANGECONCEPTOR CODE PLESE CHECH MOBILE FRENDLY AND THE COLORS WE CHOOSE NOW AND REQUIREMETS DOC IS DIFFERENT KEEP ANIMATIONS ONLY CHANGE COLORS TO MACTH PRODUCTION LEVEL WEBSITE"

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { getSupabase } from "@/lib/supabase/client";
import {
  Smartphone,
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
} from "lucide-react";

export default function StaffLoginPage() {
  const router = useRouter();
  const { loginAsStaffUser, businesses } = useApp();

  const [staffName, setStaffName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    name: string;
    businessName: string;
    role: string;
  } | null>(null);

  const normalizePhone = (p: string) => {
    return p.replace(/[^0-9]/g, "");
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessInfo(null);

    const cleanName = staffName.trim();
    const cleanDigits = normalizePhone(phone);

    if (!cleanName || cleanDigits.length < 7) {
      setError("Please enter your full name and a valid phone number (at least 7 digits).");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = getSupabase();

      // Search in users table for any staff or manager with matching phone & name
      const { data: usersData, error: usersErr } = await supabase
        .from("users")
        .select("*")
        .in("role", ["staff", "manager", "owner"]);

      if (usersErr) {
        console.error("Supabase user query notice:", usersErr);
      }

      let matchedUser = (usersData || []).find((u: any) => {
        const uPhoneDigits = normalizePhone(u.phone || "");
        const nameMatches =
          u.full_name?.toLowerCase().includes(cleanName.toLowerCase()) ||
          cleanName.toLowerCase().includes(u.full_name?.toLowerCase() || "");

        // Exact 10-digit suffix match or full digits match
        const phoneMatches =
          uPhoneDigits === cleanDigits ||
          (cleanDigits.length >= 10 && uPhoneDigits.endsWith(cleanDigits.slice(-10))) ||
          (uPhoneDigits.length >= 10 && cleanDigits.endsWith(uPhoneDigits.slice(-10)));

        return nameMatches && phoneMatches;
      });

      // Fallback check against active businesses if owner added them
      if (!matchedUser) {
        // Check if there is an existing business with this owner phone & name
        const { data: bizData } = await supabase.from("businesses").select("*");
        const matchedBiz = (bizData || []).find((b: any) => {
          const bPhoneDigits = normalizePhone(b.phone || "");
          const nameMatches = b.owner_name?.toLowerCase().includes(cleanName.toLowerCase());
          const phoneMatches =
            bPhoneDigits === cleanDigits ||
            (cleanDigits.length >= 10 && bPhoneDigits.endsWith(cleanDigits.slice(-10)));
          return nameMatches && phoneMatches;
        });

        if (matchedBiz) {
          matchedUser = {
            id: `owner-${matchedBiz.id}`,
            email: matchedBiz.owner_email || `${cleanName.toLowerCase().replace(/\s+/g, "")}@revia.app`,
            full_name: matchedBiz.owner_name,
            phone: matchedBiz.phone,
            role: "owner",
            business_id: matchedBiz.id,
            created_at: matchedBiz.created_at,
          };
        }
      }

      if (!matchedUser) {
        setIsLoading(false);
        setError(
          `No team member found with name "${cleanName}" and phone "${phone}". Please ask your store owner to add your phone number in Settings > Staff & Permissions.`
        );
        return;
      }

      // Fetch the business name for confirmation
      let bizName = "Your Business";
      const { data: bizRecord } = await supabase
        .from("businesses")
        .select("name")
        .eq("id", matchedUser.business_id)
        .maybeSingle();

      if (bizRecord?.name) {
        bizName = bizRecord.name;
      }

      setSuccessInfo({
        name: matchedUser.full_name,
        businessName: bizName,
        role: matchedUser.role,
      });

      // Hydrate context with staff user & active business
      await loginAsStaffUser({
        id: matchedUser.id,
        email: matchedUser.email || `${cleanDigits}@staff.revia.app`,
        full_name: matchedUser.full_name,
        role: matchedUser.role as any,
        business_id: matchedUser.business_id,
        created_at: matchedUser.created_at || new Date().toISOString(),
      });

      setTimeout(() => {
        if (matchedUser.role === "staff") {
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
    <div className="min-h-screen bg-[#F8F8F9] text-[#111439] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
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
            <span>Home</span>
          </Link>
          <Link
            href="/auth/login"
            className="text-xs font-bold text-[#6C4DFF] hover:underline transition-colors px-2 py-1"
          >
            Owner Login
          </Link>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-8 animate-fade-in">
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
                Log in using the phone number and name registered by your business owner.
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
                  <span>Verified! Logging you into terminal...</span>
                </div>
                <div className="text-[11px] text-[#111439] bg-[#FFFFFF] p-2.5 rounded-lg border border-[#16A34A]/20">
                  <p>👤 Team Member: <strong>{successInfo.name}</strong></p>
                  <p>🏢 Store: <strong>{successInfo.businessName}</strong></p>
                  <p className="capitalize">🔑 Role: <strong>{successInfo.role}</strong></p>
                </div>
              </div>
            )}

            <form onSubmit={handleStaffLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-[#6C4DFF]" />
                  <span>Your Full Name *</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={isLoading || !!successInfo}
                  placeholder="e.g. Ramesh Patel"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2.5 text-xs font-medium text-[#111439] placeholder-[#94A3B8] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5 text-[#6C4DFF]" />
                  <span>Registered Mobile Number *</span>
                </label>
                <input
                  type="tel"
                  required
                  disabled={isLoading || !!successInfo}
                  placeholder="e.g. +91 98765 43210 or 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2.5 text-xs font-medium text-[#111439] placeholder-[#94A3B8] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none transition-colors"
                />
                <p className="text-[10px] text-[#667085] mt-1.5">
                  💡 Must match the mobile number entered by your store owner in Settings.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || !!successInfo}
                className="w-full flex items-center justify-center gap-2 rounded-xl brand-gradient py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-purple-500/20 hover:opacity-95 disabled:opacity-50 transition-all btn-interactive mt-2 cursor-pointer"
              >
                {isLoading ? (
                  <span>Verifying credentials...</span>
                ) : (
                  <>
                    <span>Enter Terminal as Staff</span>
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

      {/* Footer info */}
      <div className="text-center text-xs text-[#667085] py-4">
        © {new Date().getFullYear()} Revia Customer Retention Platform • All rights reserved.
      </div>
    </div>
  );
}