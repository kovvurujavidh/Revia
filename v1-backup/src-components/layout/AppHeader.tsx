"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";

export function AppHeader({ onOpenQR }: { onOpenQR?: () => void }) {
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

  if (pathname === "/" || pathname?.startsWith("/join") || pathname?.startsWith("/auth")) {
    return null;
  }

  if (!activeBusiness?.id) return null;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#27272a] bg-[#09090b]/90 backdrop-blur-xl px-4 md:px-6">
      {/* Left: Revia Brand + Business Switcher */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Revia Brand */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient text-white shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-shadow">
            <Zap className="h-5 w-5" />
          </div>
          <span className="text-xl font-black tracking-tight brand-gradient-text hidden sm:block">
            Revia
          </span>
        </Link>

        {/* Divider */}
        <div className="h-6 w-px bg-[#3f3f46] hidden sm:block"></div>

        {/* Business Switcher Dropdown */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setIsBizDropdownOpen(!isBizDropdownOpen)}
            className="flex items-center gap-2.5 rounded-xl border border-[#27272a] bg-[#18181b] px-3 py-1.5 text-left text-sm font-semibold text-white hover:border-[#3f3f46] transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="hidden md:block">
              <p className="line-clamp-1 max-w-[150px] font-bold text-xs leading-tight text-white">
                {activeBusiness.name}
              </p>
              <p className="text-[10px] text-[#71717a] capitalize">
                {activeBusiness.industry.replace("_", " ")}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-[#52525b]" />
          </button>

          {isBizDropdownOpen && (
            <div className="absolute left-0 mt-2 w-64 rounded-xl border border-[#27272a] bg-[#18181b] p-2 shadow-2xl z-50">
              <p className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[#52525b]">
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
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                      b.id === activeBusiness.id
                        ? "bg-purple-500/10 text-purple-400"
                        : "text-[#a1a1aa] hover:bg-[#27272a]"
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{b.name}</p>
                      <p className="text-[10px] text-[#52525b] capitalize">{b.industry.replace("_", " ")}</p>
                    </div>
                    {b.id === activeBusiness.id && (
                      <span className="h-2 w-2 rounded-full bg-purple-500" />
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-2 border-t border-[#27272a] pt-2">
                <Link
                  href="/onboarding"
                  onClick={() => setIsBizDropdownOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-purple-400 hover:bg-purple-500/10"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>+ Create New Business</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Trial Badge */}
        {isTrialActive && (
          <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400 whitespace-nowrap">
            <Clock className="h-3.5 w-3.5 animate-pulse" />
            <span>{trialDaysRemaining} Days Trial</span>
            <Link
              href="/profile"
              className="rounded-full bg-purple-500 px-2 py-0.5 text-[10px] text-white hover:bg-purple-600 transition-colors"
            >
              Upgrade
            </Link>
          </div>
        )}

        {isReadOnly && (
          <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400 whitespace-nowrap">
            <span>Read-Only</span>
            <Link
              href="/profile"
              className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] text-white hover:bg-red-600 transition-colors"
            >
              Activate
            </Link>
          </div>
        )}
      </div>

      {/* Right: Fast Actions & User Menu */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Counter QR Code Action */}
        <button
          onClick={onOpenQR}
          className="hidden sm:flex items-center gap-1.5 rounded-xl border border-[#27272a] bg-[#18181b] px-3 py-1.5 text-xs font-semibold text-[#a1a1aa] hover:text-white hover:border-[#3f3f46] transition-colors"
          title="Show Table/Counter QR Code"
        >
          <QrCode className="h-4 w-4 text-purple-400" />
          <span>QR</span>
        </button>

        {/* Add Visit Button */}
        <Link
          href="/add-visit"
          className="flex items-center gap-1.5 rounded-xl brand-gradient px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:opacity-95 transition-all"
        >
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Add Visit</span>
        </Link>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex items-center gap-2 rounded-xl border border-[#27272a] bg-[#18181b] p-1.5 sm:px-3 sm:py-1.5 hover:border-[#3f3f46] transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 font-bold text-xs">
              {currentUser.full_name.charAt(0)}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-white leading-tight">
                {currentUser.full_name}
              </p>
              <p className="text-[10px] text-[#71717a] uppercase font-semibold">
                {currentUser.role}
              </p>
            </div>
            <ChevronDown className="hidden md:block h-3.5 w-3.5 text-[#52525b]" />
          </button>

          {isUserDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[#27272a] bg-[#18181b] p-2 shadow-2xl z-50">
              <div className="px-3 py-2 border-b border-[#27272a] mb-1">
                <p className="text-xs font-bold text-white">{currentUser.full_name}</p>
                <p className="text-[11px] text-[#71717a]">{currentUser.email}</p>
              </div>

              {/* Role Switcher */}
              <div className="px-3 py-1.5">
                <p className="text-[10px] font-bold uppercase text-[#52525b] tracking-wider mb-1">
                  Preview Role
                </p>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <button
                    onClick={() => { switchRole("owner"); setIsUserDropdownOpen(false); }}
                    className={`rounded-lg px-2 py-1.5 text-center font-semibold transition-all ${
                      currentUser.role === "owner"
                        ? "bg-purple-500 text-white"
                        : "bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]"
                    }`}
                  >
                    Owner
                  </button>
                  <button
                    onClick={() => { switchRole("staff"); setIsUserDropdownOpen(false); }}
                    className={`rounded-lg px-2 py-1.5 text-center font-semibold transition-all ${
                      currentUser.role === "staff"
                        ? "bg-purple-500 text-white"
                        : "bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]"
                    }`}
                  >
                    Staff
                  </button>
                </div>
              </div>

              <div className="border-t border-[#27272a] my-1" />

              {currentUser.role !== "staff" && (
                <Link
                  href="/settings"
                  onClick={() => setIsUserDropdownOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-[#a1a1aa] hover:bg-[#27272a] hover:text-white transition-colors"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Account Settings</span>
                </Link>
              )}
              {currentUser.role !== "staff" && (
                <Link
                  href="/profile"
                  onClick={() => setIsUserDropdownOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-[#a1a1aa] hover:bg-[#27272a] hover:text-white transition-colors"
                >
                  <Clock className="h-3.5 w-3.5 text-purple-400" />
                  <span>Subscription & Founder</span>
                </Link>
              )}
              <Link
                href="/auth/login"
                onClick={() => setIsUserDropdownOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
