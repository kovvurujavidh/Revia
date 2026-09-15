// Importers/Callers: Root layout (`src/app/layout.tsx`)
// Affected API: MobileNav React component
// Data Schemas: Opportunity, User { role: "owner" | "staff" | "manager" | "superadmin" }
// User's Verbatim Instruction: "Revenue Over Time +584% Growth Interactive revenue timeline compared with prior period IS OVERFLOWING AND Preview Role Owner ONLY GIVE THERE OWNER AND STAFF WHEN THE STAF LOGIN USING GAMIL THEY CAN OLY ENTER DATA MAKE IT LIKE OWNER CAN ONLY SEE THE ANALYTICS AND REPORT AND THE ADMIN BUTTON GIVE IN THE PROFIE SECTION LIKE YOU GAVE SUPER ADMIN PANNLE IN THE LEFT SILE AND WHEN USER OR I FOUNDER OF THIS WEB CLICK ON THIS A SECRETE KET NEED TO PUT THEN ONLY UNLOACK THE ADMIN PANNLE AND IN ADMIN PLANNER SHOW GROWTH AND ANALYTICS"

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  LayoutDashboard,
  Users,
  PlusCircle,
  Megaphone,
  Menu,
  X,
  MessageCircle,
  BarChart2,
  TrendingUp,
  Settings,
  CreditCard,
  ShieldCheck,
  QrCode,
} from "lucide-react";

export function MobileNav({ onOpenQR }: { onOpenQR?: () => void }) {
  const pathname = usePathname();
  const { opportunities, currentUser } = useApp();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Hide on public / landing / join / auth pages
  if (pathname === "/" || pathname?.startsWith("/join") || pathname?.startsWith("/auth") || pathname?.startsWith("/onboarding")) {
    return null;
  }

  const isStaff = currentUser.role === "staff";
  const pendingOpportunitiesCount = opportunities.filter((o) => o.status === "pending").length;

  return (
    <>
      {/* "More" Drawer Modal for Mobile */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md md:hidden animate-fade-in flex flex-col justify-end">
          <div className="bg-[#121215] border-t border-white/[0.1] rounded-t-3xl p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="font-bold text-sm text-white">
                {isStaff ? "Staff Actions" : "All Features"}
              </h3>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 rounded-full bg-white/[0.06] text-[#a1a1aa] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  setIsMoreOpen(false);
                  if (onOpenQR) onOpenQR();
                }}
                className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs font-semibold text-white text-left hover:bg-white/[0.06] transition-colors"
              >
                <QrCode className="h-4 w-4 text-purple-400" />
                <span>Counter QR</span>
              </button>

              {!isStaff && (
                <>
                  <Link
                    href="/whatsapp"
                    onClick={() => setIsMoreOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs font-semibold text-white hover:bg-white/[0.06] transition-colors"
                  >
                    <MessageCircle className="h-4 w-4 text-purple-400" />
                    <span>WhatsApp</span>
                  </Link>
                  <Link
                    href="/reports"
                    onClick={() => setIsMoreOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs font-semibold text-white hover:bg-white/[0.06] transition-colors"
                  >
                    <BarChart2 className="h-4 w-4 text-blue-400" />
                    <span>Reports</span>
                  </Link>
                  <Link
                    href="/analytics"
                    onClick={() => setIsMoreOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs font-semibold text-white hover:bg-white/[0.06] transition-colors"
                  >
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    <span>Analytics</span>
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setIsMoreOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs font-semibold text-white hover:bg-white/[0.06] transition-colors"
                  >
                    <CreditCard className="h-4 w-4 text-amber-400" />
                    <span>Subscription</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setIsMoreOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs font-semibold text-white hover:bg-white/[0.06] transition-colors"
                  >
                    <Settings className="h-4 w-4 text-[#a1a1aa]" />
                    <span>Settings</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Mobile Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/95 backdrop-blur-xl border-t border-white/[0.08] md:hidden pb-safe">
        <div className={`grid ${isStaff ? "grid-cols-3" : "grid-cols-5"} items-center px-2 py-1.5`}>
          {!isStaff && (
            <Link
              href="/dashboard"
              className={`flex flex-col items-center py-1 rounded-xl text-[10px] font-semibold transition-colors ${
                pathname === "/dashboard"
                  ? "text-purple-400"
                  : "text-[#71717a] hover:text-white"
              }`}
            >
              <LayoutDashboard className="h-4 w-4 mb-0.5" />
              <span>Dashboard</span>
            </Link>
          )}

          {!isStaff && (
            <Link
              href="/customers"
              className={`flex flex-col items-center py-1 rounded-xl text-[10px] font-semibold transition-colors ${
                pathname === "/customers"
                  ? "text-purple-400"
                  : "text-[#71717a] hover:text-white"
              }`}
            >
              <Users className="h-4 w-4 mb-0.5" />
              <span>Customers</span>
            </Link>
          )}

          {/* Centered Add Visit Highlight Button */}
          <div className="flex justify-center -mt-3">
            <Link
              href="/add-visit"
              className="flex h-11 w-11 items-center justify-center rounded-full brand-gradient text-white shadow-lg shadow-purple-500/30 active:scale-95 transition-transform"
              title="Add Visit"
            >
              <PlusCircle className="h-5 w-5" />
            </Link>
          </div>

          {!isStaff && (
            <Link
              href="/opportunities"
              className={`relative flex flex-col items-center py-1 rounded-xl text-[10px] font-semibold transition-colors ${
                pathname === "/opportunities"
                  ? "text-purple-400"
                  : "text-[#71717a] hover:text-white"
              }`}
            >
              <div className="relative">
                <Megaphone className="h-4 w-4 mb-0.5" />
                {pendingOpportunitiesCount > 0 && (
                  <span className="absolute -top-1 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold text-white tabular-nums">
                    {pendingOpportunitiesCount}
                  </span>
                )}
              </div>
              <span>Action</span>
            </Link>
          )}

          <button
            onClick={() => setIsMoreOpen(true)}
            className="flex flex-col items-center py-1 rounded-xl text-[10px] font-semibold text-[#71717a] hover:text-white"
          >
            <Menu className="h-4 w-4 mb-0.5" />
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
