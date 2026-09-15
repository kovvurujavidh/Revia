// Importers/Callers: Next.js App Router route /opportunities, Dashboard quick actions, AppSidebar
// Affected API: Retention action center (at-risk regulars, win-back, VIP appreciation, 2nd-visit conversion)
// Data Schemas: Opportunity, Customer, WhatsAppTemplate, User from src/lib/types.ts
// User's Verbatim Instruction: "https://emilkowal.ski/skill https://github.com/emilkowalski/skills https://www.ui-skills.com/skills INSTALL AND AUTOMATICALLY USE THIS SKILLS AND REDESIGH MY WEBSITE CONCEPT IS SAME CODE IS SAME JUST DESINE AND LOOK IF YOU HAVE PROBLEM MAKE A V1 VERSION AND SAVE ALL OLD VERSION AND USE THE NEW VERSION TO TEST"

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
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
            <Lock className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black text-white tracking-tight">Staff Access Restricted</h1>
            <p className="text-xs text-[#71717a] leading-relaxed">
              Customer win-back opportunities and marketing campaigns are managed exclusively by Store Owners. Staff accounts are configured for counter visit entry.
            </p>
          </div>

          <div className="rounded-xl bg-white/[0.03] p-4 text-left border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span>Current Role:</span>
              <span className="capitalize px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[10px] font-bold">
                {currentUser.role}
              </span>
            </div>
            <p className="text-[11px] text-[#71717a]">
              Logged in as <strong className="text-white">{currentUser.email}</strong>
            </p>
          </div>

          <Link
            href="/add-visit"
            className="w-full flex items-center justify-center gap-2 rounded-xl brand-gradient py-3 text-xs font-bold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:opacity-95 transition-all btn-interactive"
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
          color: "text-red-400 bg-red-500/15 border-red-500/30",
        };
      case "inactive_winback":
        return {
          label: "Win-Back Offer",
          icon: Clock,
          color: "text-amber-400 bg-amber-500/15 border-amber-500/30",
        };
      case "vip_appreciation":
        return {
          label: "VIP Appreciation",
          icon: Star,
          color: "text-purple-400 bg-purple-500/15 border-purple-500/30",
        };
      case "new_customer_retention":
        return {
          label: "2nd Visit Incentive",
          icon: UserCheck,
          color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
        };
      default:
        return {
          label: "Opportunity",
          icon: Sparkles,
          color: "text-blue-400 bg-blue-500/15 border-blue-500/30",
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Retention Action Center</h1>
            <span className="rounded-full bg-red-500/15 border border-red-500/30 px-2.5 py-0.5 text-xs font-bold text-red-400 tabular-nums">
              {pendingOpportunities.length} Pending Actions
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#71717a] mt-1">
            Prioritized retention actions with 1-click personalized WhatsApp offers.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab("all")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer btn-interactive whitespace-nowrap ${
            activeTab === "all"
              ? "bg-purple-500 text-white shadow-md shadow-purple-500/25"
              : "bg-white/[0.03] text-[#a1a1aa] border border-white/[0.08] hover:bg-white/[0.06] hover:text-white"
          }`}
        >
          All Actions ({pendingOpportunities.length})
        </button>
        <button
          onClick={() => setActiveTab("at_risk")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer btn-interactive whitespace-nowrap ${
            activeTab === "at_risk"
              ? "bg-red-500 text-white shadow-md shadow-red-500/25"
              : "bg-white/[0.03] text-[#a1a1aa] border border-white/[0.08] hover:bg-white/[0.06] hover:text-white"
          }`}
        >
          At-Risk Regulars
        </button>
        <button
          onClick={() => setActiveTab("inactive_winback")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer btn-interactive whitespace-nowrap ${
            activeTab === "inactive_winback"
              ? "bg-amber-500 text-white shadow-md shadow-amber-500/25"
              : "bg-white/[0.03] text-[#a1a1aa] border border-white/[0.08] hover:bg-white/[0.06] hover:text-white"
          }`}
        >
          Win-Back Inactive
        </button>
        <button
          onClick={() => setActiveTab("vip_appreciation")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer btn-interactive whitespace-nowrap ${
            activeTab === "vip_appreciation"
              ? "bg-purple-500 text-white shadow-md shadow-purple-500/25"
              : "bg-white/[0.03] text-[#a1a1aa] border border-white/[0.08] hover:bg-white/[0.06] hover:text-white"
          }`}
        >
          VIP Retention
        </button>
        <button
          onClick={() => setActiveTab("new_customer_retention")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer btn-interactive whitespace-nowrap ${
            activeTab === "new_customer_retention"
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
              : "bg-white/[0.03] text-[#a1a1aa] border border-white/[0.08] hover:bg-white/[0.06] hover:text-white"
          }`}
        >
          2nd-Visit Conversion
        </button>
      </div>

      {/* Opportunities List */}
      {filteredOpportunities.length === 0 ? (
        <div className="brand-card p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-bold text-white">No pending actions in this category!</h2>
          <p className="text-xs text-[#71717a] mt-1 max-w-md mx-auto">
            You are completely caught up. When customers miss their expected visit rhythm, new opportunities will automatically show up here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredOpportunities.map((opp) => {
            const customer = customers.find((c) => c.id === opp.customer_id);
            const badge = getBadgeDetails(opp.type);
            const BadgeIcon = badge.icon;

            return (
              <div
                key={opp.id}
                className="brand-card p-5 sm:p-6 flex flex-col justify-between hover:border-purple-500/30 transition-all duration-200"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${badge.color}`}
                    >
                      <BadgeIcon className="h-3.5 w-3.5" />
                      <span>{badge.label}</span>
                    </span>

                    <span className="rounded-lg bg-white/[0.03] px-2.5 py-1 text-xs font-black text-white border border-white/[0.08] tabular-nums">
                      ₹{opp.potential_revenue?.toLocaleString()} at stake
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">
                    {customer ? customer.name : opp.customer_name || "Customer"}{" "}
                    <span className="text-xs text-[#71717a] font-normal tabular-nums">
                      ({customer?.phone || opp.customer_phone})
                    </span>
                  </h3>

                  <p className="text-xs text-[#a1a1aa] mt-1.5 leading-relaxed">
                    {opp.reason}
                  </p>

                  <div className="mt-3.5 rounded-xl bg-white/[0.03] p-3.5 border border-white/[0.06]">
                    <p className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                      Suggested Action:
                    </p>
                    <p className="text-xs font-semibold text-white/90 mt-0.5">
                      {opp.recommended_action}
                    </p>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => resolveOpportunity(opp.id, "dismissed")}
                      className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5 text-[#71717a] hover:bg-white/[0.06] hover:text-red-400 hover:border-red-500/30 transition-all btn-interactive"
                      title="Dismiss"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => resolveOpportunity(opp.id, "contacted")}
                      className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5 text-[#71717a] hover:bg-white/[0.06] hover:text-emerald-400 hover:border-emerald-500/30 transition-all btn-interactive"
                      title="Mark as Handled"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleSendWhatsApp(opp)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 text-xs font-bold text-zinc-950 shadow-lg shadow-emerald-500/20 hover:brightness-105 transition-all btn-interactive"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Send 1-Click WhatsApp</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
