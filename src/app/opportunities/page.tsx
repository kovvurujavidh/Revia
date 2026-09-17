// Importers/Callers: Next.js App Router route /opportunities, Dashboard quick actions, AppSidebar, MobileNav
// Affected API: OpportunitiesPage React page component for Retention Action Center
// Data Schemas: Opportunity, Customer, WhatsAppTemplate, User from src/lib/types.ts
// User's Verbatim Instruction: "AFTER LOGIN THE LEFT SIDE BAR IS GOOD NOT FIT FOR MOBILE OK SEE THE WHOLE DOT CHANGECONCEPTOR CODE PLESE CHECH MOBILE FRENDLY AND THE COLORS WE CHOOSE NOW AND REQUIREMETS DOC IS DIFFERENT KEEP ANIMATIONS ONLY CHANGE COLORS TO MACTH PRODUCTION LEVEL WEBSITE"

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import {
  CheckCircle2,
  XCircle,
  MessageCircle,
  Sparkles,
  Star,
  UserCheck,
  AlertTriangle,
  Clock,
  Lock,
  ArrowRight,
} from "lucide-react";
import { formatWhatsAppMessage, buildWhatsAppLink } from "@/lib/intelligence";

export default function OpportunitiesPage() {
  const {
    opportunities,
    customers,
    activeBusiness,
    templates,
    resolveOpportunity,
    logWhatsAppSend,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    "all" | "at_risk" | "inactive_winback" | "vip_appreciation" | "new_customer_retention"
  >("all");

  // Staff Access Gate: Staff members only have access to Visit Data Entry
  if (currentUser?.role === "staff") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 animate-fade-in">
        <div className="max-w-md w-full brand-card p-8 text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6C4DFF]/10 border border-[#6C4DFF]/20 text-[#6C4DFF]">
            <Lock className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black text-[#111439] tracking-tight">Staff Access Restricted</h1>
            <p className="text-xs text-[#667085] leading-relaxed">
              Customer win-back opportunities and marketing campaigns are managed exclusively by Store Owners. Staff accounts are configured for counter visit entry.
            </p>
          </div>

          <div className="rounded-xl bg-[#F8F8F9] p-4 text-left border border-[#EAECF0] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#111439]">
              <span>Current Role:</span>
              <span className="capitalize px-2.5 py-0.5 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6] text-[10px] font-bold">
                {currentUser.role}
              </span>
            </div>
            <p className="text-[11px] text-[#667085]">
              Logged in as <strong className="text-[#111439]">{currentUser.email}</strong>
            </p>
          </div>

          <Link
            href="/add-visit"
            className="w-full flex items-center justify-center gap-2 rounded-xl brand-gradient py-3 text-xs font-bold text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 hover:opacity-95 transition-all btn-interactive"
          >
            <span>Go to Add Visit Entry</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const pendingOpportunities = opportunities.filter((o) => o.status === "pending");

  const filteredOpportunities = pendingOpportunities.filter((o) => {
    if (activeTab === "all") return true;
    return o.type === activeTab;
  });

  const getBadgeDetails = (type: string) => {
    switch (type) {
      case "at_risk":
        return {
          label: "At-Risk Regular",
          icon: AlertTriangle,
          color: "text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20",
        };
      case "inactive_winback":
        return {
          label: "Win-Back Offer",
          icon: Clock,
          color: "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20",
        };
      case "vip_appreciation":
        return {
          label: "VIP Appreciation",
          icon: Star,
          color: "text-[#6C4DFF] bg-[#6C4DFF]/10 border-[#6C4DFF]/20",
        };
      case "new_customer_retention":
        return {
          label: "2nd Visit Incentive",
          icon: UserCheck,
          color: "text-[#16A34A] bg-[#16A34A]/10 border-[#16A34A]/20",
        };
      default:
        return {
          label: "Opportunity",
          icon: Sparkles,
          color: "text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20",
        };
    }
  };

  const handleSendWhatsApp = (opp: (typeof opportunities)[0]) => {
    const customer = customers.find((c) => c.id === opp.customer_id);
    if (!customer) return;

    // Pick appropriate template
    let template = templates.find((t) => t.category === "comeback");
    if (opp.type === "vip_appreciation") {
      template = templates.find((t) => t.category === "vip_offer");
    } else if (opp.type === "new_customer_retention") {
      template = templates.find((t) => t.category === "thank_you");
    }

    const messageText = template
      ? formatWhatsAppMessage(template.message, customer, activeBusiness)
      : `Hi ${customer.name}! We noticed you haven't visited ${activeBusiness.name} in a while. Here is a special comeback treat for you! 🎁`;

    const link = buildWhatsAppLink(customer.phone, messageText);

    // Log dispatch & mark opportunity resolved
    logWhatsAppSend({
      business_id: activeBusiness.id,
      customer_id: customer.id,
      phone: customer.phone,
      customer_name: customer.name,
      template_name: template ? template.name : "Custom Opportunity",
      message_sent: messageText,
    });

    resolveOpportunity(opp.id, "contacted");

    // Open WhatsApp
    window.open(link, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] animate-fade-in">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-[#EAECF0]">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] shrink-0">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-[#111439] tracking-tight truncate">Actions</h1>
                  {pendingOpportunities.length > 0 && (
                    <span className="rounded-full bg-[#EF4444]/10 border border-[#EF4444]/25 px-2 py-0.5 text-[10px] font-bold text-[#EF4444] tabular-nums shrink-0">
                      {pendingOpportunities.length}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[#667085] font-medium hidden sm:block">Retention actions with 1-click WhatsApp</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs - Scrollable */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1.5 overflow-x-auto pb-3 -mb-px scrollbar-hide">
            {[
              { key: "all" as const, label: "All", color: "brand-gradient", count: pendingOpportunities.length },
              { key: "at_risk" as const, label: "At Risk", color: "bg-[#EF4444]", count: pendingOpportunities.filter(o => o.type === "at_risk").length },
              { key: "inactive_winback" as const, label: "Win-Back", color: "bg-[#F59E0B]", count: pendingOpportunities.filter(o => o.type === "inactive_winback").length },
              { key: "vip_appreciation" as const, label: "VIP", color: "bg-[#6C4DFF]", count: pendingOpportunities.filter(o => o.type === "vip_appreciation").length },
              { key: "new_customer_retention" as const, label: "2nd Visit", color: "bg-[#16A34A]", count: pendingOpportunities.filter(o => o.type === "new_customer_retention").length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all shrink-0 ${
                  activeTab === tab.key
                    ? `${tab.color} text-white shadow-sm`
                    : "bg-white text-[#667085] border border-[#EAECF0] hover:border-[#D0D5DD]"
                }`}
              >
                {tab.label}
                <span className={`text-[9px] px-1 py-0.5 rounded-full ${activeTab === tab.key ? "bg-white/20" : "bg-[#F4F5F7]"}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-4 space-y-3 max-w-7xl mx-auto">
        {/* Opportunities List */}
        {filteredOpportunities.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EAECF0] p-8 sm:p-12 text-center shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#16A34A]/10 border border-[#16A34A]/25 text-[#16A34A] mb-3">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-[#111439]">All caught up!</h2>
            <p className="text-xs text-[#667085] mt-1 max-w-sm mx-auto">
              No pending actions. New opportunities appear when customers miss their visit rhythm.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOpportunities.map((opp) => {
              const customer = customers.find((c) => c.id === opp.customer_id);
              const badge = getBadgeDetails(opp.type);
              const BadgeIcon = badge.icon;

              return (
                <div
                  key={opp.id}
                  className="bg-white rounded-2xl border border-[#EAECF0] p-4 shadow-xs transition-all"
                >
                  {/* Top: Badge + Revenue */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${badge.color}`}>
                      <BadgeIcon className="h-3 w-3" />
                      {badge.label}
                    </span>
                    {opp.potential_revenue && (
                      <span className="text-[11px] font-bold text-[#111439] tabular-nums">
                        ₹{opp.potential_revenue.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Customer Info */}
                  <h3 className="text-sm font-bold text-[#111439]">
                    {customer ? customer.name : opp.customer_name || "Customer"}
                  </h3>
                  <p className="text-[11px] text-[#667085] mt-0.5">{opp.reason}</p>

                  {/* Suggested Action */}
                  <div className="mt-2.5 rounded-xl bg-[#F4F5F7] px-3 py-2">
                    <p className="text-[10px] font-bold text-[#6C4DFF] uppercase tracking-wider">Suggested:</p>
                    <p className="text-[11px] font-semibold text-[#111439] mt-0.5">{opp.recommended_action}</p>
                  </div>

                  {/* Action Buttons - Full Width Touch Targets */}
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <button
                      onClick={() => resolveOpportunity(opp.id, "dismissed")}
                      className="flex items-center justify-center gap-1 rounded-xl border border-[#EAECF0] bg-white py-2.5 text-[11px] font-bold text-[#94A3B8] hover:bg-red-50 hover:text-[#EF4444] hover:border-[#EF4444]/30 transition-all"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Skip
                    </button>
                    <button
                      onClick={() => resolveOpportunity(opp.id, "contacted")}
                      className="flex items-center justify-center gap-1 rounded-xl border border-[#EAECF0] bg-white py-2.5 text-[11px] font-bold text-[#94A3B8] hover:bg-emerald-50 hover:text-[#16A34A] hover:border-[#16A34A]/30 transition-all"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Done
                    </button>
                    <button
                      onClick={() => handleSendWhatsApp(opp)}
                      className="flex items-center justify-center gap-1 rounded-xl bg-[#25D366] py-2.5 text-[11px] font-bold text-white shadow-sm hover:brightness-105 transition-all"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      WhatsApp
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
