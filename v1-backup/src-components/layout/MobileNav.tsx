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
        <div className="fixed inset-0 z-50 bg-black/50 md:hidden animate-fade-in flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8E8ED] pb-3">
              <h3 className="font-bold text-base text-[#111439]">
                {isStaff ? "Staff Actions" : "All Features"}
              </h3>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1 rounded-full bg-gray-100 text-[#667085]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  setIsMoreOpen(false);
                  if (onOpenQR) onOpenQR();
                }}
                className="flex items-center gap-3 p-3 rounded-xl border border-[#E8E8ED] bg-[#F8F8F9] text-xs font-semibold text-[#111439] text-left"
              >
                <QrCode className="h-5 w-5 text-[#6C4DFF]" />
                <span>Counter QR Code</span>
              </button>

              {!isStaff && (
                <>
                  <Link
                    href="/whatsapp"
                    onClick={() => setIsMoreOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-[#E8E8ED] bg-[#F8F8F9] text-xs font-semibold text-[#111439]"
                  >
                    <MessageCircle className="h-5 w-5 text-[#6C4DFF]" />
                    <span>WhatsApp Outreach</span>
                  </Link>
                  <Link
                    href="/reports"
                    onClick={() => setIsMoreOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-[#E8E8ED] bg-[#F8F8F9] text-xs font-semibold text-[#111439]"
                  >
                    <BarChart2 className="h-5 w-5 text-[#3B82F6]" />
                    <span>Reports & CSV</span>
                  </Link>
                  <Link
                    href="/analytics"
                    onClick={() => setIsMoreOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-[#E8E8ED] bg-[#F8F8F9] text-xs font-semibold text-[#111439]"
                  >
                    <TrendingUp className="h-5 w-5 text-[#16A34A]" />
                    <span>Retention Analytics</span>
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setIsMoreOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-[#E8E8ED] bg-[#F8F8F9] text-xs font-semibold text-[#111439]"
                  >
                    <CreditCard className="h-5 w-5 text-[#F59E0B]" />
                    <span>Subscription Plans</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setIsMoreOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-[#E8E8ED] bg-[#F8F8F9] text-xs font-semibold text-[#111439]"
                  >
                    <Settings className="h-5 w-5 text-[#667085]" />
                    <span>Business Settings</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Mobile Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E8E8ED] md:hidden shadow-lg pb-safe">
        <div className={`grid ${isStaff ? "grid-cols-3" : "grid-cols-5"} items-center px-1 py-1.5`}>
          {!isStaff && (
            <Link
              href="/dashboard"
              className={`flex flex-col items-center py-1 rounded-xl text-[10px] font-semibold transition-colors ${
                pathname === "/dashboard"
                  ? "text-[#6C4DFF]"
                  : "text-[#667085] hover:text-[#111439]"
              }`}
            >
              <LayoutDashboard className="h-5 w-5 mb-0.5" />
              <span>Dashboard</span>
            </Link>
          )}

          {!isStaff && (
            <Link
              href="/customers"
              className={`flex flex-col items-center py-1 rounded-xl text-[10px] font-semibold transition-colors ${
                pathname === "/customers"
                  ? "text-[#6C4DFF]"
                  : "text-[#667085] hover:text-[#111439]"
              }`}
            >
              <Users className="h-5 w-5 mb-0.5" />
              <span>Customers</span>
            </Link>
          )}

          {/* Centered Add Visit Highlight Button */}
          <div className="flex justify-center -mt-4">
            <Link
              href="/add-visit"
              className="flex h-12 w-12 items-center justify-center rounded-full brand-gradient text-white shadow-lg shadow-[#6C4DFF]/30 active:scale-95 transition-transform"
              title="Add Visit"
            >
              <PlusCircle className="h-6 w-6" />
            </Link>
          </div>

          {!isStaff && (
            <Link
              href="/opportunities"
              className={`relative flex flex-col items-center py-1 rounded-xl text-[10px] font-semibold transition-colors ${
                pathname === "/opportunities"
                  ? "text-[#6C4DFF]"
                  : "text-[#667085] hover:text-[#111439]"
              }`}
            >
              <div className="relative">
                <Megaphone className="h-5 w-5 mb-0.5" />
                {pendingOpportunitiesCount > 0 && (
                  <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[9px] font-bold text-white">
                    {pendingOpportunitiesCount}
                  </span>
                )}
              </div>
              <span>Action</span>
            </Link>
          )}

          <button
            onClick={() => setIsMoreOpen(true)}
            className="flex flex-col items-center py-1 rounded-xl text-[10px] font-semibold text-[#667085] hover:text-[#111439]"
          >
            <Menu className="h-5 w-5 mb-0.5" />
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
