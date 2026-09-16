// Importers/Callers: Next.js route `/whatsapp`, AppSidebar, MobileNav
// Affected API: WhatsAppPage React component (Industry Presets, Category Tabs, Token Chips, Live Chat Simulator, 1-Click Dispatch, Custom Date & Personalization)
// Data Schemas: WhatsAppTemplate, Customer, Business, WhatsAppLog, WhatsAppCustomData, IndustryType from src/lib/types.ts.
// User's Verbatim Instruction: "c:\AI\Revia_Final_All_Three_Business_Updates_Claude_Code_Prompt.docx now this make todo and complete updaate"

"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import {
  MessageCircle,
  Copy,
  Check,
  History,
  Sparkles,
  Send,
  User,
  Zap,
  Filter,
  Utensils,
  Coffee,
  Scissors,
  Dumbbell,
  ShoppingBag,
  HeartPulse,
  Building2,
  Tag,
  Home,
  ChevronRight,
  CalendarDays,
  Clock,
  Percent,
} from "lucide-react";
import { formatWhatsAppMessage, buildWhatsAppLink, WhatsAppCustomData } from "@/lib/intelligence";
import { formatDistanceToNow } from "date-fns";
import { IndustryType, WhatsAppTemplate } from "@/lib/types";

/* ─────────────────────────── Constants ─────────────────────────── */
const INDUSTRY_META: Record<IndustryType, { label: string; icon: React.ReactNode; color: string }> = {
  restaurant: { label: "Restaurant", icon: <Utensils className="h-3.5 w-3.5" />, color: "#EF4444" },
  cafe:       { label: "Café",       icon: <Coffee className="h-3.5 w-3.5" />,      color: "#F59E0B" },
  salon_spa:  { label: "Salon & Spa", icon: <Scissors className="h-3.5 w-3.5" />,   color: "#EC4899" },
  gym:        { label: "Gym",        icon: <Dumbbell className="h-3.5 w-3.5" />,    color: "#16A34A" },
  clothing:   { label: "Clothing",   icon: <ShoppingBag className="h-3.5 w-3.5" />,  color: "#8B5CF6" },
  pg_hostel:  { label: "PG & Hostel", icon: <Home className="h-3.5 w-3.5" />,        color: "#0284C7" },
  retail:     { label: "Retail",     icon: <ShoppingBag className="h-3.5 w-3.5" />,  color: "#3B82F6" },
  clinic:     { label: "Clinic",     icon: <HeartPulse className="h-3.5 w-3.5" />,   color: "#6C4DFF" },
  hotel:      { label: "Hotel",      icon: <Building2 className="h-3.5 w-3.5" />,    color: "#06b6d4" },
  other:      { label: "General",    icon: <Tag className="h-3.5 w-3.5" />,          color: "#667085" },
};

type TemplateCategory = "all" | "thank_you" | "comeback" | "vip_offer" | "reminder" | "festival";

const CATEGORY_META: Record<TemplateCategory, { label: string; color: string }> = {
  all:        { label: "All Presets",    color: "#6C4DFF" },
  thank_you:  { label: "Thank You",      color: "#16A34A" },
  comeback:   { label: "Win-Back",       color: "#3B82F6" },
  vip_offer:  { label: "VIP Offers",     color: "#F59E0B" },
  reminder:   { label: "Reminders",      color: "#06b6d4" },
  festival:   { label: "Festival / Seasonal", color: "#EC4899" },
};

const SMART_TOKENS = [
  { token: "{customer_name}",   label: "Customer Name" },
  { token: "{business_name}",   label: "Business Name" },
  { token: "{offer_discount}",  label: "Discount %" },
  { token: "{days_since_last_visit}", label: "Days Since Visit" },
  { token: "{favorite_item}",   label: "Favorite Item" },
  { token: "{currency_symbol}", label: "Currency Symbol" },
  { token: "{custom_date}",     label: "Custom Date" },
  { token: "{valid_until}",       label: "Valid Until" },
  { token: "{appointment_date}",   label: "Appointment Date" },
];


/* ─────────────────────────── Component ─────────────────────────── */
export default function WhatsAppPage() {
  const {
    activeBusiness,
    customers,
    templates,
    whatsappLogs,
    logWhatsAppSend,
  } = useApp();

  const industry: IndustryType = (activeBusiness?.industry as IndustryType) || "other";

  /* ── Local state ── */
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.id || ""
  );
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory>("all");
  const [targetSegment, setTargetSegment] = useState<string>("all");
  const [selectedCustomerId] = useState<string>("");
  const [customMessage, setCustomMessage] = useState<string>("");
  const [customData, setCustomData] = useState<WhatsAppCustomData>({});
  const [copied, setCopied] = useState(false);

  /* ── Derived template list: industry presets + system defaults ── */
  const filteredTemplates = useMemo(() => {
    const industryPresets = templates.filter(
      (t) => t.industry === industry || (!t.industry && t.is_default)
    );
    const byCategory =
      categoryFilter === "all"
        ? industryPresets
        : industryPresets.filter((t) => t.category === categoryFilter);
    return byCategory;
  }, [templates, industry, categoryFilter]);

  /* ── Active template object ── */
  const activeTemplate = useMemo(() => {
    return (
      filteredTemplates.find((t) => t.id === selectedTemplateId) ||
      filteredTemplates[0] ||
      templates[0]
    );
  }, [filteredTemplates, selectedTemplateId, templates]);

  /* ── Preview customer ── */
  const previewCustomer = useMemo(() => {
    if (selectedCustomerId) {
      return customers.find((c) => c.id === selectedCustomerId) || customers[0];
    }
    if (targetSegment !== "all") {
      return customers.find((c) => c.segment === targetSegment) || customers[0];
    }
    return customers[0];
  }, [customers, selectedCustomerId, targetSegment]);

  /* ── Filtered customer list ── */
  const segmentCustomers = useMemo(() => {
    if (targetSegment === "all") return customers;
    return customers.filter((c) => c.segment === targetSegment);
  }, [customers, targetSegment]);

  /* ── Final interpolated message ── */
  const finalMessageBody = useMemo(() => {
    const rawTemplate = customMessage || activeTemplate?.message || "";
    if (!previewCustomer) return rawTemplate;
    return formatWhatsAppMessage(rawTemplate, previewCustomer, activeBusiness, customData);
  }, [customMessage, activeTemplate, previewCustomer, activeBusiness, customData]);

  /* ── Handlers ── */
  const handleCopy = () => {
    navigator.clipboard.writeText(finalMessageBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const insertToken = (token: string) => {
    setCustomMessage((prev) => (prev || activeTemplate?.message || "") + " " + token + " ");
  };

  const handleSendToCustomer = (customer: (typeof customers)[0]) => {
    const rawTemplate = customMessage || activeTemplate?.message || "";
    const msg = formatWhatsAppMessage(rawTemplate, customer, activeBusiness, customData);
    const link = buildWhatsAppLink(customer.phone, msg);

    logWhatsAppSend({
      customer_id: customer.id,
      customer_name: customer.name,
      customer_phone: customer.phone,
      template_name: activeTemplate?.name || "Custom",
      message_sent: msg,
    });

    window.open(link, "_blank");
  };

  /* ── Industry accent color helper ── */
  const industryColor = INDUSTRY_META[industry]?.color || "#6C4DFF";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in text-[#111439]">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[#111439] tracking-tight">
              WhatsApp Outreach Hub
            </h1>
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-bold flex items-center gap-1 border"
              style={{
                backgroundColor: `${industryColor}15`,
                borderColor: `${industryColor}40`,
                color: industryColor,
              }}
            >
              <MessageCircle className="h-3.5 w-3.5" /> 1-Click Dispatch
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#667085] mt-1">
            Send high-converting return offers, thank you notes, and VIP perks
            directly to your customers.
          </p>
        </div>

        {/* Industry Badge */}
        <div
          className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2"
          style={{
            backgroundColor: `${industryColor}12`,
            borderColor: `${industryColor}30`,
          }}
        >
          {INDUSTRY_META[industry]?.icon}
          <span className="text-xs font-bold" style={{ color: industryColor }}>
            {INDUSTRY_META[industry]?.label} Templates
          </span>
        </div>
      </div>

      {/* ────────────────────── Main Grid ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT: Template Selector ── */}
        <div className="space-y-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(CATEGORY_META) as TemplateCategory[]).map((cat) => {
              const meta = CATEGORY_META[cat];
              const isActive = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setCategoryFilter(cat);
                    setSelectedTemplateId("");
                  }}
                  className="rounded-xl px-3 py-1.5 text-[11px] font-bold border transition-all btn-interactive cursor-pointer"
                  style={{
                    backgroundColor: isActive ? `${meta.color}15` : "#FFFFFF",
                    borderColor: isActive ? `${meta.color}60` : "#EAECF0",
                    color: isActive ? meta.color : "#667085",
                  }}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>

          {/* Template Count */}
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#667085] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#6C4DFF]" />
              Preset Templates
            </h2>
            <span className="text-xs font-bold text-[#6C4DFF] bg-[#6C4DFF]/10 border border-[#6C4DFF]/20 px-2 py-0.5 rounded-full tabular-nums">
              {filteredTemplates.length} Ready
            </span>
          </div>

          {/* Template Cards */}
          <div className="space-y-2.5">
            {filteredTemplates.length === 0 ? (
              <div className="brand-card p-6 text-center">
                <p className="text-xs text-[#667085]">
                  No presets for this category yet.
                </p>
              </div>
            ) : (
              filteredTemplates.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                const catColor = CATEGORY_META[tpl.category as TemplateCategory]?.color || "#6C4DFF";
                return (
                  <div
                    key={tpl.id}
                    onClick={() => {
                      setSelectedTemplateId(tpl.id);
                      setCustomMessage("");
                    }}
                    className={`rounded-2xl border p-4 cursor-pointer transition-all duration-200 btn-interactive ${
                      isSelected
                        ? "border-[#6C4DFF] bg-[#6C4DFF]/10 shadow-md shadow-[#6C4DFF]/10"
                        : "border-[#EAECF0] bg-[#FFFFFF] hover:bg-[#F8F8F9] hover:border-[#6C4DFF]/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <p className={`text-xs font-bold ${isSelected ? "text-[#111439]" : "text-[#111439]/90"}`}>
                        {tpl.name}
                      </p>
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: `${catColor}15`,
                          borderColor: `${catColor}40`,
                          color: catColor,
                        }}
                      >
                        {tpl.category.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#667085] line-clamp-2">
                      {tpl.message}
                    </p>
                    {isSelected && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-[#6C4DFF]">
                        <ChevronRight className="h-3 w-3" /> Editing this template
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT: Composer & Simulator ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Composer Card */}
          <div className="brand-card p-6 sm:p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAECF0] pb-4">
              <div>
                <h3 className="text-sm font-bold text-[#111439] tracking-tight flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#F59E0B]" />
                  Personalized Message Composer
                </h3>
                <p className="text-[11px] text-[#667085] mt-0.5">
                  Use smart tokens below or type freely. Tokens are auto-filled with real customer data.
                </p>
              </div>

              {/* Segment Target */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#667085]">Target:</span>
                <select
                  value={targetSegment}
                  onChange={(e) => setTargetSegment(e.target.value)}
                  className="rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3 py-1.5 text-xs font-bold text-[#111439] focus:outline-none focus:border-[#6C4DFF] transition-colors"
                >
                  <option value="all">
                    All Customers ({customers.length})
                  </option>
                  <option value="vip">
                    VIP Members
                  </option>
                  <option value="regular">
                    Regulars
                  </option>
                  <option value="becoming_inactive">
                    Becoming Inactive
                  </option>
                  <option value="inactive">
                    Inactive Win-Back
                  </option>
                  <option value="new">
                    New First-Timers
                  </option>
                </select>
              </div>
            </div>

            {/* Smart Token Chips */}
            <div>
              <label className="block text-[10px] font-bold text-[#667085] uppercase tracking-wider mb-1.5">
                Quick Insert Tokens
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SMART_TOKENS.map((st) => (
                  <button
                    key={st.token}
                    onClick={() => insertToken(st.token)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#EAECF0] bg-[#F8F8F9] px-2.5 py-1 text-[10px] font-bold text-[#667085] hover:text-[#111439] hover:border-[#6C4DFF]/40 hover:bg-[#6C4DFF]/10 transition-all btn-interactive cursor-pointer"
                  >
                    <span className="text-[#6C4DFF] font-black">{st.token}</span>
                    <span className="hidden sm:inline font-medium">({st.label})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date & Personalization UI */}
            <div className="rounded-2xl border border-[#EAECF0] bg-[#F8F8F9] p-4 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays className="h-4 w-4 text-[#6C4DFF]" />
                <h4 className="text-xs font-bold text-[#111439] uppercase tracking-wider">Customize Dates & Offers</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* validUntil / customDate input */}
                <div>
                  <label className="block text-[10px] font-bold text-[#667085] uppercase tracking-wider mb-1.5 mt-0">
                    Expiry / Custom Date <span className="text-[#6C4DFF] ml-1 font-black">{"{valid_until}"}</span>
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="date"
                      className="w-[110px] rounded-lg border border-[#EAECF0] bg-[#FFFFFF] px-2 py-1.5 text-xs font-medium text-[#111439] focus:border-[#6C4DFF] focus:outline-none transition-all cursor-pointer"
                      onChange={(e) => {
                        if (e.target.value) {
                           const d = new Date(e.target.value);
                           const formatted = d.toLocaleDateString("en-IN", { weekday: 'short', month: 'short', day: 'numeric' });
                           setCustomData(prev => ({ ...prev, validUntil: formatted, customDate: formatted }));
                        }
                      }}
                    />
                    <input
                      type="text"
                      placeholder="e.g. this Sunday"
                      value={customData.validUntil || ""}
                      onChange={(e) => setCustomData(prev => ({ ...prev, validUntil: e.target.value, customDate: e.target.value }))}
                      className="flex-1 w-full min-w-0 rounded-lg border border-[#EAECF0] bg-[#FFFFFF] px-3 py-1.5 text-xs font-medium text-[#111439] focus:border-[#6C4DFF] focus:outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {["Today", "Tomorrow", "This Weekend", "Next 7 Days"].map(label => (
                      <button
                        key={label}
                        onClick={() => setCustomData(prev => ({ ...prev, validUntil: label, customDate: label }))}
                        className="rounded px-2 py-0.5 text-[9px] font-bold text-[#667085] bg-[#FFFFFF] border border-[#EAECF0] hover:border-[#6C4DFF]/40 hover:text-[#6C4DFF] transition-colors cursor-pointer"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* appointmentDate input */}
                <div>
                  <label className="block text-[10px] font-bold text-[#667085] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Appointment Time <span className="text-[#6C4DFF] ml-1 font-black">{"{appointment_date}"}</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tomorrow at 11:00 AM"
                    value={customData.appointmentDate || ""}
                    onChange={(e) => setCustomData(prev => ({ ...prev, appointmentDate: e.target.value }))}
                    className="w-full rounded-lg border border-[#EAECF0] bg-[#FFFFFF] px-3 py-1.5 text-xs font-medium text-[#111439] focus:border-[#6C4DFF] focus:outline-none transition-all"
                  />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {["Tomorrow 10 AM", "Tomorrow 4 PM", "Saturday 11 AM"].map(label => (
                      <button
                        key={label}
                        onClick={() => setCustomData(prev => ({ ...prev, appointmentDate: label }))}
                        className="rounded px-2 py-0.5 text-[9px] font-bold text-[#667085] bg-[#FFFFFF] border border-[#EAECF0] hover:border-[#6C4DFF]/40 hover:text-[#6C4DFF] transition-colors cursor-pointer"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* customOfferDiscount input */}
                <div>
                  <label className="block text-[10px] font-bold text-[#667085] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Percent className="h-3 w-3" /> Offer Discount <span className="text-[#6C4DFF] ml-1 font-black">{"{offer_discount}"}</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 15, 20, Flat ₹100 Off"
                    value={customData.customOfferDiscount || ""}
                    onChange={(e) => setCustomData(prev => ({ ...prev, customOfferDiscount: e.target.value }))}
                    className="w-full rounded-lg border border-[#EAECF0] bg-[#FFFFFF] px-3 py-1.5 text-xs font-medium text-[#111439] focus:border-[#6C4DFF] focus:outline-none transition-all"
                  />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {["10", "15", "20", "25", "30"].map(val => (
                      <button
                        key={val}
                        onClick={() => setCustomData(prev => ({ ...prev, customOfferDiscount: val }))}
                        className="rounded px-2 py-0.5 text-[9px] font-bold text-[#667085] bg-[#FFFFFF] border border-[#EAECF0] hover:border-[#6C4DFF]/40 hover:text-[#6C4DFF] transition-colors cursor-pointer"
                      >
                        {val}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Template Message Body */}

            <div>
              <label className="block text-xs font-bold text-[#667085] uppercase tracking-wider mb-1.5">
                Template Message Body
              </label>
              <textarea
                rows={5}
                value={customMessage || activeTemplate?.message || ""}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Type your WhatsApp message or select a preset template..."
                className="w-full rounded-2xl border border-[#EAECF0] bg-[#F8F8F9] p-4 text-xs font-medium text-[#111439] placeholder:text-[#94A3B8] focus:border-[#6C4DFF] focus:bg-[#FFFFFF] focus:outline-none transition-all leading-relaxed"
              />
              <p className="text-[10px] text-[#667085] mt-1">
                {activeTemplate && (
                  <>
                    Using preset:{" "}
                    <span className="text-[#6C4DFF] font-bold">{activeTemplate.name}</span>
                    {" "}({activeTemplate.category.replace("_", " ")})
                  </>
                )}
              </p>
            </div>
          </div>

          {/* ── Live WhatsApp Chat Simulator ── */}
          <div className="brand-card p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAECF0] pb-4">
              <h3 className="text-sm font-bold text-[#111439] tracking-tight flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-[#25D366]" />
                Live Chat Simulator
              </h3>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#667085] hover:text-[#111439] transition-colors btn-interactive cursor-pointer"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-[#16A34A]" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span>{copied ? "Copied!" : "Copy Text"}</span>
              </button>
            </div>

            {/* Phone Frame */}
            <div className="mx-auto max-w-sm rounded-3xl overflow-hidden border border-[#EAECF0] shadow-xl">
              {/* Status bar */}
              <div className="bg-[#075e54] px-4 py-2.5 flex items-center justify-between text-[11px] text-white/90">
                <span>9:41</span>
                <span className="flex items-center gap-1">
                  <span className="font-bold text-white text-xs">
                    {activeBusiness?.name || "Business"}
                  </span>
                </span>
                <span>●●●</span>
              </div>

              {/* Chat area */}
              <div className="bg-[#efeae2] px-3 py-4 space-y-3 min-h-[280px]">
                {/* Date line */}
                <div className="text-center text-[10px] text-[#667085] bg-[#FFFFFF] shadow-sm rounded-lg px-3 py-1 mx-auto w-fit font-medium">
                  Today
                </div>

                {/* Incoming bubble */}
                {previewCustomer && (
                  <div className="flex gap-2 max-w-[85%]">
                    <div className="h-7 w-7 rounded-full bg-[#25D366]/20 flex items-center justify-center shrink-0 mt-1">
                      <User className="h-3.5 w-3.5 text-[#075e54]" />
                    </div>
                    <div>
                      <div className="bg-[#FFFFFF] rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm">
                        <p className="text-[11px] text-[#111439] leading-relaxed font-medium">
                          Hi! I&apos;m a customer at {activeBusiness?.name || "your store"}. 😊
                        </p>
                      </div>
                      <span className="text-[9px] text-[#667085] ml-1">9:42 AM</span>
                    </div>
                  </div>
                )}

                {/* Outgoing message bubble */}
                <div className="flex justify-end">
                  <div className="max-w-[85%]">
                    <div className="bg-[#d9fdd3] rounded-2xl rounded-tr-sm px-3.5 py-2.5 shadow-sm">
                      <p className="text-[11px] text-[#111439] whitespace-pre-wrap leading-relaxed font-medium">
                        {finalMessageBody || "Select a template or type a message..."}
                      </p>
                      <div className="text-right flex items-center justify-end gap-1 mt-1">
                        <span className="text-[9px] text-[#667085] tabular-nums">
                          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="text-[9px] text-[#34B7F1] font-bold">✓✓</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input bar */}
              <div className="bg-[#f0f2f5] px-3 py-2 flex items-center gap-2 border-t border-[#EAECF0]">
                <div className="flex-1 bg-[#FFFFFF] border border-[#EAECF0] rounded-full px-4 py-1.5 text-[11px] text-[#667085]">
                  Type a message
                </div>
                <div className="h-8 w-8 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-sm">
                  <Send className="h-3.5 w-3.5 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Quick Send Table ── */}
          <div className="brand-card p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAECF0] pb-4">
              <h3 className="text-sm font-bold text-[#111439] tracking-tight flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#3B82F6]" />
                Send to Customer
              </h3>
              <span className="text-[11px] font-bold text-[#667085] tabular-nums">
                {segmentCustomers.length} in segment
              </span>
            </div>

            <div className="max-h-60 overflow-y-auto border border-[#EAECF0] rounded-2xl divide-y divide-[#EAECF0] bg-[#FFFFFF]">
              {segmentCustomers.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#667085]">
                  No customers found in this segment.
                </div>
              ) : (
                segmentCustomers.map((cust) => (
                  <div
                    key={cust.id}
                    className="flex items-center justify-between p-3.5 hover:bg-[#F8F8F9] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-[#F8F8F9] border border-[#EAECF0] flex items-center justify-center text-[#667085]">
                        <User className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#111439]">{cust.name}</p>
                        <p className="text-[10px] text-[#667085] tabular-nums">{cust.phone}</p>
                      </div>
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                        style={{
                          backgroundColor:
                            cust.segment === "vip"
                              ? "#F59E0B18"
                              : cust.segment === "inactive"
                              ? "#EF444418"
                              : cust.segment === "new"
                              ? "#16A34A18"
                              : "#3B82F618",
                          borderColor:
                            cust.segment === "vip"
                              ? "#F59E0B40"
                              : cust.segment === "inactive"
                              ? "#EF444440"
                              : cust.segment === "new"
                              ? "#16A34A40"
                              : "#3B82F640",
                          color:
                            cust.segment === "vip"
                              ? "#F59E0B"
                              : cust.segment === "inactive"
                              ? "#EF4444"
                              : cust.segment === "new"
                              ? "#16A34A"
                              : "#3B82F6",
                        }}
                      >
                        {cust.segment}
                      </span>
                    </div>

                    <button
                      onClick={() => handleSendToCustomer(cust)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-[#25D366]/20 hover:brightness-105 transition-all btn-interactive cursor-pointer"
                    >
                      <Send className="h-3 w-3" />
                      <span>Send</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────────── Campaign History ────────────────────── */}
      <div className="brand-card p-6 sm:p-7">
        <div className="flex items-center gap-2 mb-4 border-b border-[#EAECF0] pb-4">
          <History className="h-4 w-4 text-[#6C4DFF]" />
          <h2 className="text-sm font-bold text-[#111439] tracking-tight">
            Recent Outreach History
          </h2>
        </div>

        {whatsappLogs.length === 0 ? (
          <p className="text-xs text-[#667085] py-6 text-center">
            No messages sent yet. Send your first campaign above!
          </p>
        ) : (
          <div className="divide-y divide-[#EAECF0]">
            {whatsappLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start justify-between py-3.5 gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-[#111439]">{log.customer_name}</p>
                    <span className="rounded-full bg-[#F8F8F9] border border-[#EAECF0] px-2 py-0.5 text-[10px] font-semibold text-[#667085] tabular-nums">
                      {log.customer_phone}
                    </span>
                    <span className="rounded-full bg-[#16A34A]/15 border border-[#16A34A]/30 px-2 py-0.5 text-[10px] font-bold text-[#16A34A]">
                      Dispatched
                    </span>
                  </div>
                  <p className="text-xs text-[#667085] mt-1 line-clamp-1 italic">
                    &ldquo;{log.message_sent}&rdquo;
                  </p>
                </div>
                <span className="text-[11px] text-[#667085] whitespace-nowrap shrink-0 tabular-nums">
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
