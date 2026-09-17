"use client";

import React, { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { MobileNav } from "./MobileNav";
import { CounterQRCode } from "@/components/add-visit/CounterQRCode";
import { useApp } from "@/context/AppContext";
import Link from "next/link";
import { AlertTriangle, Clock, ArrowRight } from "lucide-react";

// Importers/Callers: App layout (`src/app/layout.tsx`)
// Affected API: AppLayoutWrapper component, mobile drawer state management
// Data Schemas: AppContext types via useApp()
// User's Verbatim Instruction: "AFTER LOGIN THE LEFT SIDE BAR IS GOOD NOT FIT FOR MOBILE OK SEE THE WHOLE DOT CHANGECONCEPTOR CODE PLESE CHECH MOBILE FRENDLY AND THE COLORS WE CHOOSE NOW AND REQUIREMETS DOC IS DIFFERENT KEEP ANIMATIONS ONLY CHANGE COLORS TO MACTH PRODUCTION LEVEL WEBSITE"

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isTrialActive, trialDaysRemaining, isReadOnly, activeBusiness } = useApp();
  const [isQROpen, setIsQROpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const openMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(true);
  }, []);

  const isPublicPage =
    pathname === "/" ||
    pathname?.startsWith("/join") ||
    pathname?.startsWith("/auth") ||
    pathname?.startsWith("/onboarding");

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F9]">
      {/* Table / Counter QR Code Modal */}
      <CounterQRCode isOpen={isQROpen} onClose={() => setIsQROpen(false)} />

      {/* Trial Expiry / Warning Top Bar for App pages */}
      {!isPublicPage && isTrialActive && trialDaysRemaining <= 4 && (
        <div className="bg-[#F59E0B] px-3 sm:px-4 py-2 text-center text-xs font-bold text-white flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 sticky top-0 z-30 shadow-xs">
          <Clock className="h-4 w-4 animate-bounce shrink-0" />
          <span className="min-w-0">Trial expires in {trialDaysRemaining} days!</span>
          <Link
            href="/profile"
            className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-[#F59E0B] hover:bg-yellow-50 transition-colors shrink-0"
          >
            Upgrade
          </Link>
        </div>
      )}

      {!isPublicPage && isReadOnly && (
        <div className="bg-[#EF4444] px-3 sm:px-4 py-2 text-center text-xs font-bold text-white flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 sticky top-0 z-30 shadow-xs">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="min-w-0">Trial expired. Read-only mode.</span>
          <Link
            href="/profile"
            className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-[#EF4444] hover:bg-red-50 transition-colors shrink-0 inline-flex items-center gap-1"
          >
            <span>Activate</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Main Top Header */}
      {!isPublicPage && (
        <AppHeader
          onOpenQR={() => setIsQROpen(true)}
          onToggleMobileMenu={openMobileMenu}
        />
      )}

      <div className="flex flex-1">
        {/* Desktop Sidebar & Mobile Drawer */}
        {!isPublicPage && (
          <AppSidebar isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
        )}

        {/* Content Area */}
        <main
          className={`flex-1 transition-all ${
            !isPublicPage ? "md:pl-64 pb-20 md:pb-8" : ""
          }`}
        >
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {!isPublicPage && <MobileNav onOpenQR={() => setIsQROpen(true)} />}
    </div>
  );
}
