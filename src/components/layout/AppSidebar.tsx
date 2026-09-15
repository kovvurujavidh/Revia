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
    <aside className="hidden w-64 flex-col border-r border-white/[0.08] bg-[#0c0c0f]/95 backdrop-blur-xl md:flex z-40 fixed h-screen left-0 top-0 pt-16">
      {/* Scrollable Nav Area */}
      <div className="flex-1 overflow-y-auto py-5 px-3">
        <nav className="space-y-1">
          <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-widest text-[#52525b]">
            {isStaff ? "Staff Actions" : "Main Menu"}
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-purple-500/15 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                    : "text-[#a1a1aa] hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={`h-[18px] w-[18px] ${
                      isActive ? "text-purple-400" : "text-[#52525b] group-hover:text-[#a1a1aa]"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums ${
                      isActive
                        ? "bg-purple-500 text-white"
                        : "bg-red-500/90 text-white"
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
        <div className="border-t border-white/[0.06] p-3">
          <nav className="space-y-1">
            {bottomNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white/[0.06] text-white"
                      : "text-[#71717a] hover:bg-white/[0.04] hover:text-[#a1a1aa]"
                  }`}
                >
                  <item.icon
                    className={`h-4 w-4 ${
                      isActive ? "text-purple-400" : "text-[#52525b] group-hover:text-[#71717a]"
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
