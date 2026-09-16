// Importers/Callers: App layout (`src/components/layout/AppLayoutWrapper.tsx`)
// Affected API: AppSidebar React component (desktop fixed & mobile drawer with Salon-specific navigation)
// Data Schemas: Opportunity, User, Business from src/lib/types.ts
// User's Verbatim Instruction: "c:\AI\Revia_Salon_Final_Update_Claude_Code_Prompt.docx  make todo list and update this one after another"

"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  LayoutDashboard,
  Users,
  PlusCircle,
  Megaphone,
  MessageCircle,
  BarChart2,
  TrendingUp,
  Settings,
  CreditCard,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";

interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AppSidebar({ isOpen = false, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const { opportunities, currentUser, activeBusiness } = useApp();

  // Auto-close mobile drawer on route change
  useEffect(() => {
    if (onClose) {
      onClose();
    }
  }, [pathname]);

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

  interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
    badge?: number;
  }

  let navItems: NavItem[] = [];
  let bottomNavItems: NavItem[] = [];

  if (isStaff) {
    navItems = [
      { name: "Add Visit", href: "/add-visit", icon: PlusCircle },
    ];
  } else if (isPG) {
    navItems = [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Residents", href: "/customers", icon: Users },
      { name: "Add Resident", href: "/add-visit", icon: PlusCircle },
      { name: "WhatsApp", href: "/whatsapp", icon: MessageCircle },
      { name: "Analytics", href: "/analytics", icon: TrendingUp },
    ];

    bottomNavItems = [
      { name: "Settings", href: "/settings", icon: Settings },
      { name: "Subscription", href: "/profile", icon: CreditCard },
    ];
  } else if (isGym) {
    navItems = [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Members", href: "/customers", icon: Users },
      { name: "Check-in / Visit", href: "/add-visit", icon: PlusCircle },
      { name: "WhatsApp", href: "/whatsapp", icon: MessageCircle },
      { name: "Analytics", href: "/analytics", icon: TrendingUp },
    ];

    bottomNavItems = [
      { name: "Settings", href: "/settings", icon: Settings },
      { name: "Subscription", href: "/profile", icon: CreditCard },
    ];
  } else if (isClothing) {
    navItems = [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Shoppers CRM", href: "/customers", icon: Users },
      { name: "Add Sale", href: "/add-visit", icon: PlusCircle },
      {
        name: "Opportunities",
        href: "/opportunities",
        icon: Megaphone,
        badge: pendingOpportunitiesCount > 0 ? pendingOpportunitiesCount : undefined,
      },
      { name: "WhatsApp", href: "/whatsapp", icon: MessageCircle },
      { name: "Analytics", href: "/analytics", icon: TrendingUp },
    ];

    bottomNavItems = [
      { name: "Settings", href: "/settings", icon: Settings },
      { name: "Subscription", href: "/profile", icon: CreditCard },
    ];
  } else if (isSalon) {
    navItems = [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Clients", href: "/customers", icon: Users },
      { name: "Add Visit", href: "/add-visit", icon: PlusCircle },
      { name: "Analytics", href: "/analytics", icon: TrendingUp },
      { name: "WhatsApp", href: "/whatsapp", icon: MessageCircle },
    ];

    bottomNavItems = [
      { name: "Settings", href: "/settings", icon: Settings },
      { name: "Subscription", href: "/profile", icon: CreditCard },
    ];
  } else {
    navItems = [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Customers", href: "/customers", icon: Users },
      { name: "Add Visit", href: "/add-visit", icon: PlusCircle },
      {
        name: "Opportunities",
        href: "/opportunities",
        icon: Megaphone,
        badge: pendingOpportunitiesCount > 0 ? pendingOpportunitiesCount : undefined,
      },
      { name: "WhatsApp", href: "/whatsapp", icon: MessageCircle },
      { name: "Reports", href: "/reports", icon: BarChart2 },
      { name: "Analytics", href: "/analytics", icon: TrendingUp },
    ];

    bottomNavItems = [
      { name: "Settings", href: "/settings", icon: Settings },
      { name: "Subscription", href: "/profile", icon: CreditCard },
    ];
  }

  const sidebarNavContent = (
    <div className="flex h-full flex-col justify-between">
      {/* Scrollable Nav Area */}
      <div className="flex-1 overflow-y-auto py-5 px-3">
        <nav className="space-y-1">
          <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
            {isStaff ? "Staff Actions" : "Main Menu"}
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-[#6C4DFF] text-white shadow-md shadow-[#6C4DFF]/25"
                    : "text-[#E2E8F0] hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={`h-[18px] w-[18px] transition-colors ${
                      isActive ? "text-white" : "text-[#94A3B8] group-hover:text-white"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums ${
                      isActive
                        ? "bg-white text-[#6C4DFF]"
                        : "bg-[#EF4444] text-white"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Nav Area */}
      {!isStaff && (
        <div className="border-t border-white/10 p-3">
          <nav className="space-y-1">
            {bottomNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "text-[#94A3B8] hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <item.icon
                    className={`h-4 w-4 ${
                      isActive ? "text-[#6C4DFF]" : "text-[#94A3B8] group-hover:text-white"
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden w-64 flex-col bg-[#111439] text-white md:flex z-40 fixed h-screen left-0 top-0 pt-16 border-r border-[#111439]/50 shadow-sm">
        {sidebarNavContent}
      </aside>

      {/* Mobile Sliding Drawer & Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#111439]/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
            onClick={onClose}
          />

          {/* Drawer Sheet */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#111439] text-white shadow-2xl flex flex-col z-50 transform transition-transform duration-300 ease-out animate-slide-in">
            {/* Mobile Drawer Header */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#6C4DFF] to-[#3B82F6] text-white shadow-md">
                  <Zap className="h-4 w-4" />
                </div>
                <span className="text-lg font-black tracking-tight text-white">
                  Revia
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {sidebarNavContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
