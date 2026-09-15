// Importers/Callers: App layout (`src/app/layout.tsx`)
// Affected API: AppSidebar React component
// Data Schemas: Opportunity, User { role: "owner" | "manager" | "staff" | "superadmin" }
// User's Verbatim Instruction: "Customer Directory In this directory when I click VIP or any other Category it not showing related category Template LibraryOnly show the life in libraries according to their company or a business Show discounts and EverythingIn settings there is a staff and permissions what is that and When I click in on Google login when I click on it I have access to the super admin So I is that only for me or is that available for any user if it is available for any user it is a loss for me right It needs to be only for Me and Build the Analytics tab for our Customer Return SaaS exactly in the style and information hierarchy of the provided analytics reference."

// Importers/Callers: App layout (`src/app/layout.tsx`)
// Affected API: AppSidebar React component
// Data Schemas: Opportunity, User { role: "owner" | "manager" | "staff" | "superadmin" }
// User's Verbatim Instruction: "Customer Directory In this directory when I click VIP or any other Category it not showing related category Template LibraryOnly show the life in libraries according to their company or a business Show discounts and EverythingIn settings there is a staff and permissions what is that and When I click in on Google login when I click on it I have access to the super admin So I is that only for me or is that available for any user if it is available for any user it is a loss for me right It needs to be only for Me and Build the Analytics tab for our Customer Return SaaS exactly in the style and information hierarchy of the provided analytics reference."

"use client";

import React from "react";
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
} from "lucide-react";

export function AppSidebar() {
  const pathname = usePathname();
  const { opportunities, currentUser } = useApp();

  // Hide on public / landing / join / auth pages
  if (pathname === "/" || pathname?.startsWith("/join") || pathname?.startsWith("/auth") || pathname?.startsWith("/onboarding")) {
    return null;
  }

  const isStaff = currentUser.role === "staff";
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

  return (
    <aside className="hidden w-64 flex-col border-r border-[#E8E8ED] bg-[#111439] md:flex z-40 fixed h-screen left-0 top-0 pt-16">
      {/* Scrollable Nav Area */}
      <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
        <nav className="space-y-1.5">
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-[#667085]/70">
            {isStaff ? "Staff Actions" : "Main Menu"}
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? "brand-gradient text-white shadow-md shadow-[#6C4DFF]/20"
                    : "text-gray-300 hover:bg-[#6C4DFF]/15 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={`h-5 w-5 ${
                      isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`flex h-5 items-center justify-center rounded-full px-2 text-[10px] font-bold ${
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
        <div className="border-t border-gray-800 p-3 bg-[#0a0c27]">
          <nav className="space-y-1.5">
            {bottomNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#6C4DFF]/20 text-white"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon
                    className={`h-4 w-4 ${
                      isActive ? "text-[#6C4DFF]" : "text-gray-500 group-hover:text-gray-300"
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </aside>
  );
}
