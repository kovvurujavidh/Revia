// Importers/Callers: Next.js App Router route /opportunities, Dashboard quick actions, AppSidebar.
// Affected API: Retention action center (at-risk regulars, win-back, VIP appreciation, 2nd-visit conversion).
// Data Schemas: Opportunity, Customer, WhatsAppTemplate, User from src/lib/types.ts.
// User's Verbatim Instruction: "WHEN THE STAF LOGIN USING GAMIL THEY CAN OLY ENTER DATA MAKE IT LIKE OWNER CAN ONLY SEE THE ANALYTICS AND REPORT"

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
  if (currentUser.role === "staff") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 animate-fade-in">
        <div className="max-w-md w-full brand-card p-8 text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#6C4DFF]/10 text-[#6C4DFF]">
            <Lock className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black text-[#111439]">Staff Access Restricted</h1>
            <p className="text-xs text-[#667085] leading-relaxed">
              Customer win-back opportunities and marketing campaigns are managed exclusively by Store Owners. Staff accounts are configured for counter visit entry.
            </p>
          </div>

          <div className="rounded-2xl bg-[#F8F8F9] p-4 text-left border border-[#E8E8ED] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#111439]">
              <span>Current Role:</span>
              <span className="capitalize px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                {currentUser.role}
              </span>
            </div>
            <p className="text-[11px] text-[#667085]">
              Logged in as <strong>{currentUser.email}</strong>
            </p>
          </div>

          <Link
            href="/add-visit"
            className="w-full flex items-center justify-center gap-2 rounded-xl brand-gradient py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-95 transition-opacity"
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
      customer_id: customer.id,
      customer_name: customer.name,
      customer_phone: customer.phone,
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
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#111439]">Retention Action Center</h1>
            <span className="rounded-full bg-[#EF4444] px-2.5 py-0.5 text-xs font-bold text-white">
              {pendingOpportunities.length} Pending Actions
            </span>
          </div>
          <p className="text-xs text-[#667085] mt-1">
            Prioritized retention actions with 1-click personalized WhatsApp offers.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
        <button
          onClick={() => setActiveTab("all")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
            activeTab === "all"
              ? "bg-[#111439] text-white shadow-xs"
              : "bg-white text-[#667085] hover:bg-gray-50 border border-[#E8E8ED]"
          }`}
        >
          All Actions ({pendingOpportunities.length})
        </button>
        <button
          onClick={() => setActiveTab("at_risk")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
            activeTab === "at_risk"
              ? "bg-[#EF4444] text-white shadow-xs"
              : "bg-white text-[#667085] hover:bg-gray-50 border border-[#E8E8ED]"
          }`}
        >
          At-Risk Regulars
        </button>
        <button
          onClick={() => setActiveTab("inactive_winback")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
            activeTab === "inactive_winback"
              ? "bg-[#F59E0B] text-white shadow-xs"
              : "bg-white text-[#667085] hover:bg-gray-50 border border-[#E8E8ED]"
          }`}
        >
          Win-Back Inactive
        </button>
        <button
          onClick={() => setActiveTab("vip_appreciation")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
            activeTab === "vip_appreciation"
              ? "bg-[#6C4DFF] text-white shadow-xs"
              : "bg-white text-[#667085] hover:bg-gray-50 border border-[#E8E8ED]"
          }`}
        >
          VIP Retention
        </button>
        <button
          onClick={() => setActiveTab("new_customer_retention")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
            activeTab === "new_customer_retention"
              ? "bg-[#16A34A] text-white shadow-xs"
              : "bg-white text-[#667085] hover:bg-gray-50 border border-[#E8E8ED]"
          }`}
        >
          2nd-Visit Conversion
        </button>
      </div>

      {/* Opportunities List */}
      {filteredOpportunities.length === 0 ? (
        <div className="rounded-3xl border border-[#E8E8ED] bg-white p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#16A34A]/10 text-[#16A34A] mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-bold text-[#111439]">No pending actions in this category!</h2>
          <p className="text-xs text-[#667085] mt-1 max-w-md mx-auto">
            You are completely caught up. When customers miss their expected visit rhythm, new opportunities will automatically show up here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOpportunities.map((opp) => {
            const customer = customers.find((c) => c.id === opp.customer_id);
            const badge = getBadgeDetails(opp.type);
            const BadgeIcon = badge.icon;

            return (
              <div
                key={opp.id}
                className="rounded-2xl border border-[#E8E8ED] bg-white p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${badge.color}`}
                    >
                      <BadgeIcon className="h-3.5 w-3.5" />
                      <span>{badge.label}</span>
                    </span>

                    <span className="rounded-lg bg-[#F8F8F9] px-2.5 py-1 text-xs font-black text-[#111439] border border-[#E8E8ED]">
                      ₹{opp.potential_revenue} at stake
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#111439]">
                    {customer ? customer.name : opp.customer_name || "Customer"}{" "}
                    <span className="text-xs text-[#667085] font-normal">
                      ({customer?.phone || opp.customer_phone})
                    </span>
                  </h3>

                  <p className="text-xs text-[#667085] mt-1.5 leading-relaxed">
                    {opp.reason}
                  </p>

                  <div className="mt-3.5 rounded-xl bg-[#F8F8F9] p-3 border border-[#E8E8ED]">
                    <p className="text-[11px] font-bold text-[#6C4DFF] uppercase tracking-wider">
                      Suggested Action:
                    </p>
                    <p className="text-xs font-semibold text-[#111439] mt-0.5">
                      {opp.recommended_action}
                    </p>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-5 pt-4 border-t border-[#E8E8ED] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => resolveOpportunity(opp.id, "dismissed")}
                      className="rounded-xl border border-[#E8E8ED] p-2 text-[#667085] hover:bg-gray-50 hover:text-[#EF4444] transition-colors cursor-pointer"
                      title="Dismiss"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => resolveOpportunity(opp.id, "contacted")}
                      className="rounded-xl border border-[#E8E8ED] p-2 text-[#667085] hover:bg-gray-50 hover:text-[#16A34A] transition-colors cursor-pointer"
                      title="Mark as Already Handled"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleSendWhatsApp(opp)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 text-xs font-bold text-white hover:bg-[#20bd5a] transition-colors shadow-xs cursor-pointer"
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
