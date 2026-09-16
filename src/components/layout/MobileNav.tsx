// Importers/Callers: AppLayoutWrapper (`src/components/layout/AppLayoutWrapper.tsx`)
// Affected API: MobileNav React component (responsive bottom bar with Salon adaptivity)
// Data Schemas: Opportunity, User, Business from src/lib/types.ts
// User's Verbatim Instruction: "c:\AI\Revia_Salon_Final_Update_Claude_Code_Prompt.docx  make todo list and update this one after another"

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
  const { opportunities, currentUser, activeBusiness } = useApp();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Hide on public / landing / join / auth pages
  if (
    pathname === "/" ||
    pathname?.startsWith("/join") ||
    pathname?.startsWith("/auth") ||
    pathname?.startsWith("/onboarding")
  ) {
    return null;
  }

  const isStaff = currentUser.role === "staff";
  const industry = activeBusiness?.industry;
  const isSalon = industry === "salon_spa";
  const isPG = industry === "pg_hostel";
  const isGym = industry === "gym";
  const isClothing = industry === "clothing";
  const pendingOpportunitiesCount = opportunities.filter((o) => o.status === "pending").length;

  const getCustomerLabel = () => {
    if (isSalon) return "Clients";
    if (isPG) return "Residents";
    if (isGym) return "Members";
    if (isClothing) return "Shoppers";
    return "Customers";
  };

  return (
    <>
      {/* "More" Drawer Modal for Mobile */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 bg-[#111439]/60 backdrop-blur-xs md:hidden animate-fade-in flex flex-col justify-end">
          <div className="bg-[#FFFFFF] border-t border-[#EAECF0] rounded-t-3xl p-5 space-y-4 max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EAECF0] pb-3">
              <h3 className="font-bold text-sm text-[#111439]">
                {isStaff ? "Staff Quick Actions" : "All Features & Shortcuts"}
              </h3>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 rounded-full bg-[#F8F8F9] text-[#667085] hover:text-[#111439] hover:bg-[#F1F1F4]"
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
                className="flex items-center gap-3 p-3 rounded-xl border border-[#EAECF0] bg-[#F8F8F9] text-xs font-semibold text-[#111439] text-left hover:bg-[#F1F1F4] hover:border-[#D0D5DD] transition-all"
              >
                <QrCode className="h-4 w-4 text-[#6C4DFF]" />
                <span>Counter QR</span>
              </button>

              {!isStaff && (
                <>
                  <Link
                    href="/whatsapp"
                    onClick={() => setIsMoreOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-[#EAECF0] bg-[#F8F8F9] text-xs font-semibold text-[#111439] hover:bg-[#F1F1F4] hover:border-[#D0D5DD] transition-all"
                  >
                    <MessageCircle className="h-4 w-4 text-[#6C4DFF]" />
                    <span>WhatsApp</span>
                  </Link>
                  {!isSalon && (
                    <Link
                      href="/reports"
                      onClick={() => setIsMoreOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-xl border border-[#EAECF0] bg-[#F8F8F9] text-xs font-semibold text-[#111439] hover:bg-[#F1F1F4] hover:border-[#D0D5DD] transition-all"
                    >
                      <BarChart2 className="h-4 w-4 text-[#3B82F6]" />
                      <span>Reports</span>
                    </Link>
                  )}
                  <Link
                    href="/analytics"
                    onClick={() => setIsMoreOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-[#EAECF0] bg-[#F8F8F9] text-xs font-semibold text-[#111439] hover:bg-[#F1F1F4] hover:border-[#D0D5DD] transition-all"
                  >
                    <TrendingUp className="h-4 w-4 text-[#16A34A]" />
                    <span>Analytics</span>
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setIsMoreOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-[#EAECF0] bg-[#F8F8F9] text-xs font-semibold text-[#111439] hover:bg-[#F1F1F4] hover:border-[#D0D5DD] transition-all"
                  >
                    <CreditCard className="h-4 w-4 text-[#F59E0B]" />
                    <span>Subscription</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setIsMoreOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-[#EAECF0] bg-[#F8F8F9] text-xs font-semibold text-[#111439] hover:bg-[#F1F1F4] hover:border-[#D0D5DD] transition-all"
                  >
                    <Settings className="h-4 w-4 text-[#667085]" />
                    <span>Settings</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Mobile Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-xl border-t border-[#EAECF0] md:hidden pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
        <div className={`grid ${isStaff ? "grid-cols-2" : "grid-cols-5"} items-center px-2 py-1.5`}>
          {!isStaff && (
            <Link
              href="/dashboard"
              className={`flex flex-col items-center py-1 rounded-xl text-[10px] font-bold transition-colors ${
                pathname === "/dashboard"
                  ? "text-[#6C4DFF]"
                  : "text-[#667085] hover:text-[#111439]"
              }`}
            >
              <LayoutDashboard className="h-4 w-4 mb-0.5" />
              <span>Dashboard</span>
            </Link>
          )}

          {!isStaff && (
            <Link
              href="/customers"
              className={`flex flex-col items-center py-1 rounded-xl text-[10px] font-bold transition-colors ${
                pathname === "/customers"
                  ? "text-[#6C4DFF]"
                  : "text-[#667085] hover:text-[#111439]"
              }`}
            >
              <Users className="h-4 w-4 mb-0.5" />
              <span>{getCustomerLabel()}</span>
            </Link>
          )}

          {/* Centered Add Visit Highlight Button */}
          <div className="flex justify-center -mt-3">
            <Link
              href="/add-visit"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#6C4DFF] to-[#3B82F6] text-white shadow-lg shadow-purple-500/30 active:scale-95 transition-transform"
              title="Add Visit"
            >
              <PlusCircle className="h-5 w-5" />
            </Link>
          </div>

          {!isStaff && isSalon && (
            <Link
              href="/analytics"
              className={`flex flex-col items-center py-1 rounded-xl text-[10px] font-bold transition-colors ${
                pathname === "/analytics"
                  ? "text-[#6C4DFF]"
                  : "text-[#667085] hover:text-[#111439]"
              }`}
            >
              <TrendingUp className="h-4 w-4 mb-0.5" />
              <span>Analytics</span>
            </Link>
          )}

          {!isStaff && !isSalon && (
            <Link
              href="/opportunities"
              className={`relative flex flex-col items-center py-1 rounded-xl text-[10px] font-bold transition-colors ${
                pathname === "/opportunities"
                  ? "text-[#6C4DFF]"
                  : "text-[#667085] hover:text-[#111439]"
              }`}
            >
              <div className="relative">
                <Megaphone className="h-4 w-4 mb-0.5" />
                {pendingOpportunitiesCount > 0 && (
                  <span className="absolute -top-1 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[8px] font-bold text-white tabular-nums">
                    {pendingOpportunitiesCount}
                  </span>
                )}
              </div>
              <span>Action</span>
            </Link>
          )}

          <button
            onClick={() => setIsMoreOpen(true)}
            className="flex flex-col items-center py-1 rounded-xl text-[10px] font-bold text-[#667085] hover:text-[#111439]"
          >
            <Menu className="h-4 w-4 mb-0.5" />
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
