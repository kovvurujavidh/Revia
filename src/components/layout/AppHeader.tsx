// Importers/Callers: AppLayoutWrapper.tsx in src/components/layout/AppLayoutWrapper.tsx.
// Affected API: AppHeader component props and navigation UI. Added onToggleMobileMenu prop.
// Data Schemas: AppHeader props { onOpenQR?: () => void, onToggleMobileMenu?: () => void }.
// User's Verbatim Instruction: "AFTER LOGIN THE LEFT SIDE BAR IS GOOD NOT FIT FOR MOBILE OK SEE THE WHOLE DOT CHANGECONCEPTOR CODE PLESE CHECH MOBILE FRENDLY AND THE COLORS WE CHOOSE NOW AND REQUIREMETS DOC IS DIFFERENT KEEP ANIMATIONS ONLY CHANGE COLORS TO MACTH PRODUCTION LEVEL WEBSITE"

"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import {
  Sparkles,
  PlusCircle,
  Building2,
  Clock,
  ShieldCheck,
  ChevronDown,
  User,
  LogOut,
  QrCode,
  Zap,
  Home,
  Menu,
} from "lucide-react";

interface AppHeaderProps {
  onOpenQR?: () => void;
  onToggleMobileMenu?: () => void;
}

export function AppHeader({ onOpenQR, onToggleMobileMenu }: AppHeaderProps) {
  const pathname = usePathname();
  const {
    activeBusiness,
    businesses,
    setActiveBusinessId,
    trialDaysRemaining,
    isTrialActive,
    isReadOnly,
    currentUser,
    switchRole,
  } = useApp();

  const [isBizDropdownOpen, setIsBizDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  if (pathname === "/" || pathname?.startsWith("/join") || pathname?.startsWith("/auth") || pathname?.startsWith("/onboarding")) {
    return null;
  }

  if (!activeBusiness?.id) return null;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#EAECF0] bg-[#FFFFFF]/90 backdrop-blur-xl px-4 md:px-6 shadow-sm">
      {/* Left: Mobile Nav Hamburger + Revia Brand + Business Switcher */}
      <div className="flex items-center gap-3 min-w-0">

        {/* Hamburger Menu Trigger (Mobile Only) */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg bg-[#F8F8F9] text-[#111439] border border-[#EAECF0] hover:bg-[#F1F1F4] hover:text-[#6C4DFF] transition-colors"
          aria-label="Open mobile navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Revia Brand (Hidden on extra small screens to save space) */}
        <Link href="/dashboard" className="hidden xs:flex items-center gap-2.5 group shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#6C4DFF] to-[#3B82F6] text-white shadow-md shadow-purple-500/20 group-hover:shadow-purple-500/30 transition-shadow">
            <Zap className="h-5 w-5" />
          </div>
          <span className="text-xl font-black tracking-tight brand-gradient-text hidden sm:block">
            Revia
          </span>
        </Link>

        {/* Divider */}
        <div className="hidden sm:block h-6 w-px bg-[#EAECF0]"></div>

        {/* Business Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsBizDropdownOpen(!isBizDropdownOpen)}
            className="flex items-center gap-2.5 rounded-xl border border-[#EAECF0] bg-[#FFFFFF] px-2.5 py-1.5 text-left text-sm font-semibold text-[#111439] hover:border-[#D0D5DD] hover:bg-[#F8F8F9] transition-all shadow-xs"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6C4DFF]/10 text-[#6C4DFF]">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="hidden xs:block">
              <p className="line-clamp-1 max-w-[120px] md:max-w-[150px] font-bold text-xs leading-tight text-[#111439]">
                {activeBusiness.name}
              </p>
              <p className="text-[10px] text-[#667085] capitalize font-medium">
                {activeBusiness.industry.replace("_", " ")}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-[#667085]" />
          </button>

          {isBizDropdownOpen && (
            <div className="absolute left-0 mt-2 w-64 rounded-xl border border-[#EAECF0] bg-[#FFFFFF] p-2 shadow-[0_10px_30px_-5px_rgba(17,20,57,0.1)] z-50 animate-scale-in origin-top-left">
              <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                Switch Business
              </p>
              <div className="mt-1 space-y-1">
                {businesses.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setActiveBusinessId(b.id);
                      setIsBizDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors ${
                      b.id === activeBusiness.id
                        ? "bg-[#6C4DFF]/10 text-[#6C4DFF]"
                        : "text-[#667085] hover:bg-[#F8F8F9] hover:text-[#111439]"
                    }`}
                  >
                    <div>
                      <p className="font-bold">{b.name}</p>
                      <p className="text-[10px] text-[#94A3B8] capitalize font-medium">{b.industry.replace("_", " ")}</p>
                    </div>
                    {b.id === activeBusiness.id && (
                      <span className="h-2 w-2 rounded-full bg-[#6C4DFF]" />
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-2 border-t border-[#EAECF0] pt-2">
                <Link
                  href="/onboarding"
                  onClick={() => setIsBizDropdownOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#6C4DFF] hover:bg-[#6C4DFF]/10 transition-colors"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>+ Create New Business</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Trial Badge Desktop */}
        {isTrialActive && (
          <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-[#6C4DFF]/20 bg-[#6C4DFF]/5 px-3 py-1 text-xs font-bold text-[#6C4DFF] whitespace-nowrap">
            <Clock className="h-3.5 w-3.5 animate-pulse" />
            <span>{trialDaysRemaining} Days Trial</span>
            <Link
              href="/profile"
              className="rounded-full bg-[#6C4DFF] px-2 py-0.5 text-[10px] text-white hover:bg-[#5b3df5] transition-colors shadow-sm shadow-[#6C4DFF]/30"
            >
              Upgrade
            </Link>
          </div>
        )}

        {isReadOnly && (
          <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-[#EF4444]/20 bg-[#EF4444]/5 px-3 py-1 text-xs font-bold text-[#EF4444] whitespace-nowrap">
            <span>Read-Only</span>
            <Link
              href="/profile"
              className="rounded-full bg-[#EF4444] px-2 py-0.5 text-[10px] text-white hover:bg-[#DC2626] transition-colors shadow-sm shadow-[#EF4444]/30"
            >
              Activate
            </Link>
          </div>
        )}
      </div>

      {/* Right: Fast Actions & User Menu */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">

        {/* Return Home */}
        <Link
          href="/"
          className="hidden md:flex items-center gap-1.5 rounded-xl border border-[#EAECF0] bg-[#FFFFFF] px-3 py-1.5 text-xs font-semibold text-[#667085] hover:text-[#111439] hover:border-[#D0D5DD] hover:bg-[#F8F8F9] transition-all shadow-xs"
          title="Return to Revia Home Page"
        >
          <Home className="h-4 w-4 text-[#6C4DFF]" />
          <span>Home</span>
        </Link>

        <Link
          href="/"
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-[#EAECF0] bg-[#FFFFFF] text-[#6C4DFF] hover:bg-[#F8F8F9] transition-all shadow-xs"
          title="Return to Revia Home Page"
        >
          <Home className="h-4 w-4" />
        </Link>

        {/* Counter QR Code Action */}
        <button
          onClick={onOpenQR}
          className="hidden sm:flex items-center gap-1.5 rounded-xl border border-[#EAECF0] bg-[#FFFFFF] px-3 py-1.5 text-xs font-semibold text-[#667085] hover:text-[#111439] hover:border-[#D0D5DD] hover:bg-[#F8F8F9] transition-all shadow-xs"
          title="Show Table/Counter QR Code"
        >
          <QrCode className="h-4 w-4 text-[#6C4DFF]" />
          <span>QR Code</span>
        </button>

        {/* Add Visit Button */}
        <Link
          href="/add-visit"
          className="hidden sm:flex items-center gap-1.5 rounded-xl brand-gradient px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-purple-500/25 hover:shadow-purple-500/40 transform hover:-translate-y-0.5 transition-all"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Log Visit</span>
        </Link>

        {/* Divider before User Dropdown */}
        <div className="hidden sm:block h-6 w-px bg-[#EAECF0]"></div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex items-center gap-2 rounded-xl border border-[#EAECF0] bg-[#FFFFFF] p-1.5 sm:px-3 sm:py-1.5 hover:border-[#D0D5DD] hover:bg-[#F8F8F9] transition-all shadow-xs"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6C4DFF]/10 text-[#6C4DFF] font-black text-xs">
              {currentUser.full_name.charAt(0)}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-[#111439] leading-tight">
                {currentUser.full_name}
              </p>
              <p className="text-[10px] text-[#667085] uppercase font-bold tracking-wider">
                {currentUser.role}
              </p>
            </div>
            <ChevronDown className="hidden md:block h-3.5 w-3.5 text-[#667085]" />
          </button>

          {isUserDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[#EAECF0] bg-[#FFFFFF] p-2 shadow-[0_10px_30px_-5px_rgba(17,20,57,0.1)] z-50 animate-scale-in origin-top-right">
              <div className="px-3 py-2 border-b border-[#EAECF0] mb-1 bg-[#F8F8F9] rounded-lg">
                <p className="text-xs font-bold text-[#111439]">{currentUser.full_name}</p>
                <p className="text-[11px] font-medium text-[#667085]">{currentUser.email}</p>
              </div>

              {/* Role Switcher */}
              <div className="px-2 py-2">
                <p className="text-[10px] font-bold uppercase text-[#94A3B8] tracking-wider mb-2 px-1">
                  Preview Role
                </p>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <button
                    onClick={() => { switchRole("owner"); setIsUserDropdownOpen(false); }}
                    className={`rounded-lg px-2 py-1.5 text-center font-bold transition-all ${
                      currentUser.role === "owner"
                        ? "bg-[#6C4DFF] text-white shadow-sm shadow-[#6C4DFF]/30"
                        : "bg-[#F8F8F9] text-[#667085] hover:bg-[#F1F1F4] hover:text-[#111439]"
                    }`}
                  >
                    Owner
                  </button>
                  <button
                    onClick={() => { switchRole("staff"); setIsUserDropdownOpen(false); }}
                    className={`rounded-lg px-2 py-1.5 text-center font-bold transition-all ${
                      currentUser.role === "staff"
                        ? "bg-[#6C4DFF] text-white shadow-sm shadow-[#6C4DFF]/30"
                        : "bg-[#F8F8F9] text-[#667085] hover:bg-[#F1F1F4] hover:text-[#111439]"
                    }`}
                  >
                    Staff
                  </button>
                </div>
              </div>

              <div className="border-t border-[#EAECF0] my-1" />

              <Link
                href="/"
                onClick={() => setIsUserDropdownOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-[#667085] hover:bg-[#F8F8F9] hover:text-[#111439] transition-colors"
              >
                <Home className="h-4 w-4 text-[#6C4DFF]" />
                <span>Website Home</span>
              </Link>

              {currentUser.role !== "staff" && (
                <Link
                  href="/settings"
                  onClick={() => setIsUserDropdownOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-[#667085] hover:bg-[#F8F8F9] hover:text-[#111439] transition-colors"
                >
                  <User className="h-4 w-4 text-[#94A3B8]" />
                  <span>Account Settings</span>
                </Link>
              )}
              {currentUser.role !== "staff" && (
                <Link
                  href="/profile"
                  onClick={() => setIsUserDropdownOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-[#667085] hover:bg-[#F8F8F9] hover:text-[#111439] transition-colors"
                >
                  <Clock className="h-4 w-4 text-[#94A3B8]" />
                  <span>Subscription & Founder</span>
                </Link>
              )}

              <div className="border-t border-[#EAECF0] my-1" />

              <Link
                href="/auth/login"
                onClick={() => setIsUserDropdownOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
