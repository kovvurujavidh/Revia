"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { MobileNav } from "./MobileNav";
import { CounterQRCode } from "@/components/add-visit/CounterQRCode";
import { useApp } from "@/context/AppContext";
import Link from "next/link";
import { AlertTriangle, Clock, ArrowRight } from "lucide-react";

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isTrialActive, trialDaysRemaining, isReadOnly, activeBusiness } = useApp();
  const [isQROpen, setIsQROpen] = useState(false);

  const isPublicPage =
    pathname === "/" ||
    pathname?.startsWith("/join") ||
    pathname?.startsWith("/auth") ||
    pathname?.startsWith("/onboarding");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Table / Counter QR Code Modal */}
      <CounterQRCode isOpen={isQROpen} onClose={() => setIsQROpen(false)} />

      {/* Trial Expiry / Warning Top Bar for App pages */}
      {!isPublicPage && isTrialActive && trialDaysRemaining <= 4 && (
        <div className="bg-[#F59E0B] px-4 py-2 text-center text-xs font-bold text-white flex items-center justify-center gap-2 sticky top-0 z-50 shadow-xs">
          <Clock className="h-4 w-4 animate-bounce" />
          <span>Your 14-day free trial expires in {trialDaysRemaining} days! Upgrade now to keep all retention features.</span>
          <Link
            href="/profile"
            className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-[#F59E0B] hover:bg-yellow-50 transition-colors ml-2"
          >
            Upgrade Now
          </Link>
        </div>
      )}

      {!isPublicPage && isReadOnly && (
        <div className="bg-[#EF4444] px-4 py-2 text-center text-xs font-bold text-white flex items-center justify-center gap-2 sticky top-0 z-50 shadow-xs">
          <AlertTriangle className="h-4 w-4" />
          <span>Your free trial has expired. You are currently in safe read-only mode. Upgrade to continue adding visits & sending messages.</span>
          <Link
            href="/profile"
            className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-[#EF4444] hover:bg-red-50 transition-colors ml-2 inline-flex items-center gap-1"
          >
            <span>Activate Subscription</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Main Top Header */}
      {!isPublicPage && <AppHeader onOpenQR={() => setIsQROpen(true)} />}

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        {!isPublicPage && <AppSidebar />}

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
