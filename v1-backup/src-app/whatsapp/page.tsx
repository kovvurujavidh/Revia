// Importers/Callers: Next.js route `/whatsapp`
// Affected API: WhatsAppPage React component
// Data Schemas: WhatsAppTemplate, Customer, Business, WhatsAppLog
// User's Verbatim Instruction: "Customer Directory In this directory when I click VIP or any other Category it not showing related category Template LibraryOnly show the life in libraries according to their company or a business Show discounts and EverythingIn settings there is a staff and permissions what is that and When I click in on Google login when I click on it I have access to the super admin So I is that only for me or is that available for any user if it is available for any user it is a loss for me right It needs to be only for Me and Build the Analytics tab for our Customer Return SaaS exactly in the style and information hierarchy of the provided analytics reference."

"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import {
  MessageCircle,
  Copy,
  Check,
  History,
} from "lucide-react";
import { formatWhatsAppMessage, buildWhatsAppLink } from "@/lib/intelligence";
import { formatDistanceToNow } from "date-fns";

export default function WhatsAppPage() {
  const {
    activeBusiness,
    customers,
    templates,
    whatsappLogs,
    logWhatsAppSend,
  } = useApp();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.id || ""
  );
  const [targetSegment, setTargetSegment] = useState<string>("all");
  const [selectedCustomerId] = useState<string>("");
  const [customMessage, setCustomMessage] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Selected template object
  const activeTemplate = useMemo(() => {
    return templates.find((t) => t.id === selectedTemplateId) || templates[0];
  }, [templates, selectedTemplateId]);

  // Target Customer for Preview
  const previewCustomer = useMemo(() => {
    if (selectedCustomerId) {
      return customers.find((c) => c.id === selectedCustomerId) || customers[0];
    }
    if (targetSegment !== "all") {
      return customers.find((c) => c.segment === targetSegment) || customers[0];
    }
    return customers[0];
  }, [customers, selectedCustomerId, targetSegment]);

  // Filtered customer list by segment
  const segmentCustomers = useMemo(() => {
    if (targetSegment === "all") return customers;
    return customers.filter((c) => c.segment === targetSegment);
  }, [customers, targetSegment]);

  // Final interpolated text
  const finalMessageBody = useMemo(() => {
    const rawTemplate = customMessage || activeTemplate?.message || "";
    if (!previewCustomer) return rawTemplate;
    return formatWhatsAppMessage(rawTemplate, previewCustomer, activeBusiness);
  }, [customMessage, activeTemplate, previewCustomer, activeBusiness]);

  const handleCopy = () => {
    navigator.clipboard.writeText(finalMessageBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToCustomer = (customer: (typeof customers)[0]) => {
    const rawTemplate = customMessage || activeTemplate?.message || "";
    const msg = formatWhatsAppMessage(rawTemplate, customer, activeBusiness);
    const link = buildWhatsAppLink(customer.phone, msg);

    logWhatsAppSend({
      business_id: activeBusiness.id,
      customer_id: customer.id,
      phone: customer.phone,
      customer_name: customer.name,
      template_name: activeTemplate?.name || "Custom",
      message_sent: msg,
    });

    window.open(link, "_blank");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#111439]">WhatsApp Outreach Hub</h1>
            <span className="rounded-full bg-[#25D366]/10 px-2.5 py-0.5 text-xs font-bold text-[#25D366] flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" /> 1-Click Dispatch
            </span>
          </div>
          <p className="text-xs text-[#667085] mt-1">
            Send high-converting return offers, thank you notes, and VIP perks directly to your customers.
          </p>
        </div>
      </div>

      {/* Main Grid: Templates & Composer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates Selector */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#111439] uppercase tracking-wider">
              Template Library
            </h2>
            <span className="text-xs text-[#667085]">{templates.length} Ready</span>
          </div>

          <div className="space-y-2.5">
            {templates.map((tpl) => {
              const isSelected = selectedTemplateId === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => {
                    setSelectedTemplateId(tpl.id);
                    setCustomMessage("");
                  }}
                  className={`rounded-2xl border p-4 cursor-pointer transition-all ${
                    isSelected
                      ? "border-[#6C4DFF] bg-[#6C4DFF]/5 shadow-xs"
                      : "border-[#E8E8ED] bg-white hover:border-[#6C4DFF]/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-bold text-[#111439]">{tpl.name}</p>
                    <span className="text-[10px] font-bold text-[#6C4DFF] uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-[#E8E8ED]">
                      {tpl.category.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#667085] line-clamp-2">
                    {tpl.message}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Composer & Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-[#E8E8ED] bg-white p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E8ED] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#111439]">
                  Personalized Message Composer
                </h3>
                <p className="text-xs text-[#667085]">
                  Dynamic smart tokens: {"{customer_name}"}, {"{business_name}"}, {"{days_since_last_visit}"}, {"{offer_discount}"}% (Default for {activeBusiness.name}: {activeBusiness.default_comeback_discount}%)
                </p>
              </div>

              {/* Segment Target Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#667085]">Target:</span>
                <select
                  value={targetSegment}
                  onChange={(e) => setTargetSegment(e.target.value)}
                  className="rounded-xl border border-[#E8E8ED] bg-[#F8F8F9] px-3 py-1.5 text-xs font-bold text-[#111439] focus:outline-none"
                >
                  <option value="all">All Customers ({customers.length})</option>
                  <option value="vip">VIP Members</option>
                  <option value="regular">Regulars</option>
                  <option value="becoming_inactive">Becoming Inactive</option>
                  <option value="inactive">Inactive Win-Back</option>
                  <option value="new">New First-Timers</option>
                </select>
              </div>
            </div>

            {/* Template Editor Textarea */}
            <div>
              <label className="block text-xs font-bold text-[#111439] mb-1.5">
                Template Message Body
              </label>
              <textarea
                rows={4}
                value={customMessage || activeTemplate?.message || ""}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Type your WhatsApp message..."
                className="w-full rounded-2xl border border-[#E8E8ED] bg-[#F8F8F9] p-4 text-xs font-medium text-[#111439] focus:border-[#6C4DFF] focus:bg-white focus:outline-none"
              />
            </div>

            {/* Live WhatsApp Mockup Preview */}
            <div className="rounded-2xl bg-[#EFEAE2] p-4 border border-[#E8E8ED] space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[#667085] pb-1 border-b border-black/5">
                <span>WhatsApp Live Preview for: <strong>{previewCustomer?.name}</strong></span>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#111439] hover:text-[#6C4DFF]"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-[#16A34A]" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied!" : "Copy Text"}</span>
                </button>
              </div>

              {/* Chat Bubble */}
              <div className="bg-white rounded-2xl rounded-tl-xs p-3.5 shadow-xs max-w-lg space-y-2 border border-black/5">
                <p className="text-xs text-[#111439] whitespace-pre-wrap leading-relaxed">
                  {finalMessageBody}
                </p>
                <div className="text-right">
                  <span className="text-[10px] text-[#667085]">12:45 PM • Read ✓✓</span>
                </div>
              </div>
            </div>

            {/* Quick Send Table for Segment Customers */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-[#111439] uppercase tracking-wider">
                  Select Customer to Send ({segmentCustomers.length})
                </h4>
              </div>

              <div className="max-h-60 overflow-y-auto custom-scrollbar border border-[#E8E8ED] rounded-2xl divide-y divide-[#E8E8ED]">
                {segmentCustomers.map((cust) => (
                  <div
                    key={cust.id}
                    className="flex items-center justify-between p-3 hover:bg-[#F8F8F9] transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#111439]">{cust.name}</p>
                      <p className="text-[11px] text-[#667085]">{cust.phone}</p>
                    </div>

                    <button
                      onClick={() => handleSendToCustomer(cust)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#20bd5a] transition-colors shadow-2xs"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>Send</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dispatched Campaign Logs History */}
      <div className="rounded-3xl border border-[#E8E8ED] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 border-b border-[#E8E8ED] pb-4">
          <History className="h-5 w-5 text-[#667085]" />
          <h2 className="text-base font-bold text-[#111439]">
            Recent Outreach History
          </h2>
        </div>

        {whatsappLogs.length === 0 ? (
          <p className="text-xs text-[#667085] py-4 text-center">
            No messages sent yet. Send your first campaign above!
          </p>
        ) : (
          <div className="divide-y divide-[#E8E8ED]">
            {whatsappLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start justify-between py-3.5 gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-[#111439]">{log.customer_name}</p>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-[#667085]">
                      {log.customer_phone}
                    </span>
                    <span className="rounded-full bg-[#16A34A]/10 px-2 py-0.5 text-[10px] font-bold text-[#16A34A]">
                      Dispatched
                    </span>
                  </div>
                  <p className="text-xs text-[#667085] mt-1 line-clamp-1 italic">
                    &ldquo;{log.message_sent}&rdquo;
                  </p>
                </div>
                <span className="text-[11px] text-[#667085] whitespace-nowrap shrink-0">
                  {formatDistanceToNow(new Date(log.sent_at), { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
