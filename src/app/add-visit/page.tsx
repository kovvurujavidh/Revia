// Importers/Callers: Next.js App Router route /add-visit, AppSidebar, MobileNav, AppHeader
// Affected API: AddVisitPage React page component (Salon Service Tracking, Fast Counter Speed Entry, Customer Auto-Detection)
// Data Schemas: Business, Customer, Visit, WhatsAppLog from src/lib/types.ts
// User's Verbatim Instruction: "c:\AI\Revia_Salon_Final_Update_Claude_Code_Prompt.docx  Cheque the whole file and Make a todo list of the updates and Please update What are I mentioned in this document And after completing one by one Up update the  To do list"

"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { CounterQRCode } from "@/components/add-visit/CounterQRCode";
import {
  Sparkles,
  PlusCircle,
  CheckCircle2,
  QrCode,
  Zap,
  Phone,
  MessageCircle,
  ShieldAlert,
  Scissors,
  Tag,
  UserCheck,
  RefreshCw,
} from "lucide-react";
import { buildWhatsAppLink } from "@/lib/intelligence";

const SALON_POPULAR_SERVICES = [
  "Haircut",
  "Beard Trim",
  "Hair Color",
  "Facial & Cleanup",
  "Hair Spa",
  "Head Massage",
  "Manicure & Pedicure",
  "Waxing / Threading",
  "Keratin Treatment",
  "Bridal & Groom Makeup",
];

export default function AddVisitPage() {
  const {
    activeBusiness,
    customers,
    addVisit,
    addCustomer,
    isReadOnly,
    logWhatsAppSend,
  } = useApp();

  const isSalon = activeBusiness?.industry === "salon_spa";

  const [isQROpen, setIsQROpen] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Form State
  const [phoneSearch, setPhoneSearch] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [serviceTaken, setServiceTaken] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Feedback State
  const [successData, setSuccessData] = useState<{
    customerName: string;
    phone: string;
    amount: number;
    visitId: string;
    service?: string;
    isNew: boolean;
  } | null>(null);

  // Match existing customer
  const matchedCustomer = useMemo(() => {
    if (!phoneSearch.trim() || phoneSearch.length < 3) return null;
    const cleanSearch = phoneSearch.replace(/\D/g, "");
    return customers.find(
      (c) =>
        c.phone.replace(/\D/g, "").includes(cleanSearch) ||
        c.name.toLowerCase().includes(phoneSearch.toLowerCase())
    );
  }, [phoneSearch, customers]);

  // Handle select customer from autocomplete
  const handleSelectCustomer = (cust: (typeof customers)[0]) => {
    setSelectedCustomerId(cust.id);
    setName(cust.name);
    setPhoneSearch(cust.phone);
    if (cust.favorite_items && cust.favorite_items.length > 0 && !serviceTaken) {
      setServiceTaken(cust.favorite_items[0]);
    }
  };

  const handleClearSelected = () => {
    setSelectedCustomerId(null);
    setName("");
    setPhoneSearch("");
    setServiceTaken("");
  };

  const handleRefresh = () => {
    setPhoneSearch("");
    setName("");
    setAmount("");
    setServiceTaken("");
    setNotes("");
    setSelectedCustomerId(null);
    setSuccessData(null);
    setIsAnonymous(false);
  };

  const quickAmountPresets = isSalon
    ? [200, 400, 800, 1500, 2500, 5000]
    : [200, 500, 1000, 1500, 2500, 5000];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    let targetCustId: string | undefined = undefined;
    let targetPhone = "";
    let targetName = "Anonymous Walk-in";
    let isNewCustomer = false;

    if (!isAnonymous) {
      if (selectedCustomerId) {
        targetCustId = selectedCustomerId;
        const cust = customers.find((c) => c.id === selectedCustomerId);
        if (cust) {
          targetPhone = cust.phone;
          targetName = cust.name;
        }
      } else if (phoneSearch.trim() && name.trim()) {
        // Auto-create new customer
        isNewCustomer = true;
        const newCust = addCustomer({
          business_id: activeBusiness.id,
          name: name.trim(),
          phone: phoneSearch.trim(),
          whatsapp_opt_in: true,
          favorite_items: serviceTaken ? [serviceTaken] : [],
          notes: serviceTaken ? `First service: ${serviceTaken}` : "Created during visit entry",
        });
        targetCustId = newCust.id;
        targetPhone = newCust.phone;
        targetName = newCust.name;
      } else if (matchedCustomer) {
        targetCustId = matchedCustomer.id;
        targetPhone = matchedCustomer.phone;
        targetName = matchedCustomer.name;
      }
    }

    const visit = addVisit({
      business_id: activeBusiness.id,
      customer_id: targetCustId,
      customer_name: targetName,
      customer_phone: targetPhone,
      amount: numAmount,
      items: serviceTaken ? [serviceTaken] : undefined,
      notes: notes.trim() || undefined,
    });

    setSuccessData({
      customerName: targetName,
      phone: targetPhone,
      amount: numAmount,
      visitId: visit.id,
      service: serviceTaken || undefined,
      isNew: isNewCustomer,
    });

    // Reset Form
    setPhoneSearch("");
    setName("");
    setAmount("");
    setServiceTaken("");
    setNotes("");
    setSelectedCustomerId(null);
  };

  // WhatsApp Thank You Message link
  const thankYouWhatsAppUrl = useMemo(() => {
    if (!successData || !successData.phone) return null;
    const msg = isSalon
      ? `Hi ${successData.customerName}! Thank you for visiting *${activeBusiness.name}* today${successData.service ? ` for ${successData.service}` : ""}! ✨ We hope you loved your look. See you again soon!`
      : `Hi ${successData.customerName}! Thank you for visiting *${activeBusiness.name}* today! We hope you had a great experience. See you again soon! ⭐`;
    return buildWhatsAppLink(successData.phone, msg);
  }, [successData, activeBusiness, isSalon]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Modal for QR Code */}
      <CounterQRCode isOpen={isQROpen} onClose={() => setIsQROpen(false)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#111439] tracking-tight">
              {isSalon ? "Salon Fast Visit Entry" : "Fast Visit Entry"}
            </h1>
            <span className="rounded-full bg-[#16A34A]/10 border border-[#16A34A]/25 px-2.5 py-0.5 text-xs font-bold text-[#16A34A] inline-flex items-center gap-1">
              <Zap className="h-3 w-3" /> 5-10s Speed Mode
            </span>
          </div>
          <p className="text-xs text-[#667085] mt-1 font-medium">
            {isSalon
              ? "Record client visit, select services taken, enter bill amount, and automatically track retention."
              : "Lookup phone number, enter amount, and keep your counter queue moving fast."}
          </p>
        </div>

        <button
          onClick={() => setIsQROpen(true)}
          className="flex items-center gap-2 rounded-xl border border-[#EAECF0] bg-[#FFFFFF] px-3.5 py-2 text-xs font-bold text-[#111439] hover:bg-[#F8F8F9] hover:border-[#D0D5DD] transition-all shadow-xs btn-interactive"
        >
          <QrCode className="h-4 w-4 text-[#6C4DFF]" />
          <span>Table / Counter QR Code</span>
        </button>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 rounded-xl border border-[#EAECF0] bg-[#FFFFFF] px-3.5 py-2 text-xs font-bold text-[#667085] hover:bg-[#F8F8F9] hover:border-[#D0D5DD] hover:text-[#111439] transition-all shadow-xs btn-interactive"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {isReadOnly && (
        <div className="rounded-xl bg-[#EF4444]/10 p-4 border border-[#EF4444]/25 flex items-center gap-3 text-xs text-[#EF4444] font-bold">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>
            Your trial has expired. You are currently in read-only mode. Please upgrade your plan in Profile to record new visits.
          </span>
        </div>
      )}

      {/* Success Notification Banner */}
      {successData && (
        <div className="rounded-2xl border border-[#16A34A]/30 bg-[#16A34A]/10 p-5 animate-fade-in flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#16A34A] text-white font-black shadow-sm">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-[#111439]">
                  Visit recorded successfully! (₹{successData.amount.toLocaleString()})
                </p>
                {successData.isNew ? (
                  <span className="rounded-full bg-blue-100 text-blue-700 text-[10px] font-extrabold px-2 py-0.5 border border-blue-200">
                    New Client
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 border border-emerald-200">
                    Returning Client
                  </span>
                )}
              </div>
              <p className="text-xs text-[#667085] mt-0.5">
                Logged for <strong className="text-[#16A34A]">{successData.customerName}</strong>
                {successData.service && ` • Service: ${successData.service}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {thankYouWhatsAppUrl && (
              <a
                href={thankYouWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  logWhatsAppSend({
                    business_id: activeBusiness.id,
                    customer_id: "",
                    phone: successData.phone,
                    customer_name: successData.customerName,
                    template_name: "thank_you",
                    message_sent: "Thank you for visiting!",
                  });
                }}
                className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-xl bg-[#25D366] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:brightness-105 transition-all btn-interactive"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Send WhatsApp Thanks</span>
              </a>
            )}
            <button
              onClick={() => setSuccessData(null)}
              className="text-xs font-bold text-[#667085] hover:text-[#111439] px-2 py-1 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Entry Form Card */}
      <div className="brand-card p-6 sm:p-8">
        {/* Toggle Mode: Known Customer vs Anonymous */}
        <div className="flex items-center justify-between border-b border-[#EAECF0] pb-5 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#667085] uppercase tracking-wider">
              Entry Type
            </span>
          </div>

          <div className="flex rounded-xl bg-[#F8F8F9] p-1 border border-[#EAECF0]">
            <button
              type="button"
              onClick={() => setIsAnonymous(false)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all btn-interactive ${
                !isAnonymous
                  ? "brand-gradient text-white shadow-md shadow-purple-500/20"
                  : "text-[#667085] hover:text-[#111439]"
              }`}
            >
              {isSalon ? "Salon Client Visit" : "Customer Visit"}
            </button>
            <button
              type="button"
              onClick={() => setIsAnonymous(true)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all btn-interactive ${
                isAnonymous
                  ? "brand-gradient text-white shadow-md shadow-purple-500/20"
                  : "text-[#667085] hover:text-[#111439]"
              }`}
            >
              Anonymous Walk-in
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isAnonymous && (
            <div className="space-y-4">
              {/* Phone / Search Input */}
              <div>
                <label className="block text-xs font-bold text-[#667085] uppercase tracking-wider mb-1.5">
                  {isSalon ? "Client Mobile / Search *" : "Customer Mobile / Search *"}
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#94A3B8]">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required={!isAnonymous}
                    value={phoneSearch}
                    onChange={(e) => {
                      setPhoneSearch(e.target.value);
                      if (selectedCustomerId) setSelectedCustomerId(null);
                    }}
                    placeholder="Enter 10-digit mobile number or client name"
                    className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] pl-10 pr-4 py-3 text-sm font-medium text-[#111439] placeholder:text-[#94A3B8] focus:border-[#6C4DFF] focus:bg-[#FFFFFF] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Name Input - Always visible for non-anonymous */}
              <div>
                <label className="block text-xs font-bold text-[#667085] uppercase tracking-wider mb-1.5">
                  {isSalon ? "Client Full Name *" : "Customer Full Name *"}
                </label>
                <input
                  type="text"
                  required={!isAnonymous}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isSalon ? "e.g. Priya Sharma" : "e.g. John Doe"}
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-4 py-3 text-sm font-medium text-[#111439] placeholder:text-[#94A3B8] focus:border-[#6C4DFF] focus:bg-[#FFFFFF] focus:outline-none transition-all"
                />
              </div>

              {/* Matched Customer Autocomplete Suggestion */}
              {matchedCustomer && !selectedCustomerId && (
                <div
                  onClick={() => handleSelectCustomer(matchedCustomer)}
                  className="rounded-xl border border-[#6C4DFF]/30 bg-[#6C4DFF]/5 p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#6C4DFF]/10 transition-colors animate-fade-in"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient text-white font-bold text-xs shadow-xs">
                      {matchedCustomer.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-[#111439]">
                          {matchedCustomer.name}
                        </p>
                        <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 border border-emerald-200 inline-flex items-center gap-0.5">
                          <UserCheck className="h-2.5 w-2.5" /> Returning Client
                        </span>
                      </div>
                      <p className="text-[11px] text-[#667085] tabular-nums">
                        {matchedCustomer.phone} • {matchedCustomer.total_visits} visits recorded • Total ₹{(matchedCustomer.total_spend || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-lg brand-gradient px-3 py-1 text-[10px] font-bold text-white shadow-sm shadow-purple-500/20">
                    Select Client
                  </span>
                </div>
              )}

              {/* Selected Customer Banner */}
              {selectedCustomerId && (
                <div className="rounded-xl border border-[#16A34A]/30 bg-[#16A34A]/10 p-3.5 flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#16A34A]" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-[#111439]">{name}</p>
                        <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                          Verified Client
                        </span>
                      </div>
                      <p className="text-[11px] text-[#667085] tabular-nums">{phoneSearch}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearSelected}
                    className="text-xs font-bold text-[#EF4444] hover:text-[#DC2626] transition-colors cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Salon Specific: Service Taken Selection */}
          {isSalon && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#667085] uppercase tracking-wider flex items-center gap-1.5">
                  <Scissors className="h-3.5 w-3.5 text-[#6C4DFF]" />
                  <span>Service Taken</span>
                </label>
                {serviceTaken && (
                  <button
                    type="button"
                    onClick={() => setServiceTaken("")}
                    className="text-[10px] text-[#EF4444] font-bold hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              <input
                type="text"
                value={serviceTaken}
                onChange={(e) => setServiceTaken(e.target.value)}
                placeholder="e.g. Haircut, Hair Spa, Facial, Beard Grooming..."
                className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-4 py-2.5 text-xs font-medium text-[#111439] placeholder:text-[#94A3B8] focus:border-[#6C4DFF] focus:bg-[#FFFFFF] focus:outline-none transition-colors mb-2.5"
              />

              {/* Service Quick Chips */}
              <div className="flex flex-wrap gap-1.5">
                {SALON_POPULAR_SERVICES.map((srv) => {
                  const isSelected = serviceTaken.toLowerCase() === srv.toLowerCase();
                  return (
                    <button
                      key={srv}
                      type="button"
                      onClick={() => setServiceTaken(srv)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all btn-interactive flex items-center gap-1 ${
                        isSelected
                          ? "brand-gradient text-white shadow-sm"
                          : "border border-[#EAECF0] bg-[#F8F8F9] text-[#475467] hover:border-[#6C4DFF]/40 hover:bg-[#6C4DFF]/10"
                      }`}
                    >
                      <Tag className="h-2.5 w-2.5 opacity-70" />
                      {srv}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Amount Input & Fast Quick-Select Chips */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#667085] uppercase tracking-wider">
                {isSalon ? "Service Bill Amount (INR) *" : `Visit Bill / Order Amount (${activeBusiness.currency || "INR"}) *`}
              </label>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#6C4DFF] font-bold text-base">
                ₹
              </div>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] pl-10 pr-4 py-3.5 text-xl font-black text-[#111439] placeholder:text-[#94A3B8] focus:border-[#6C4DFF] focus:bg-[#FFFFFF] focus:outline-none tabular-nums transition-all"
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="mt-3 flex flex-wrap gap-2">
              {quickAmountPresets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  className="rounded-lg border border-[#EAECF0] bg-[#F8F8F9] px-3 py-1.5 text-xs font-bold text-[#111439] hover:border-[#6C4DFF]/40 hover:bg-[#6C4DFF]/10 transition-all btn-interactive tabular-nums cursor-pointer"
                >
                  ₹{val}
                </button>
              ))}
            </div>
          </div>

          {/* Notes or Additional details */}
          <div>
            <label className="block text-xs font-bold text-[#667085] uppercase tracking-wider mb-1.5">
              Notes &amp; Preferences <span className="text-[10px] text-[#94A3B8] font-normal lowercase">(optional, e.g. prefers organic dye / stylist Anand)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Requested ammonia-free color, short layers"
              className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-4 py-2.5 text-xs font-medium text-[#111439] placeholder:text-[#94A3B8] focus:border-[#6C4DFF] focus:bg-[#FFFFFF] focus:outline-none transition-colors"
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isReadOnly}
            className="w-full flex items-center justify-center gap-2 rounded-xl brand-gradient py-4 text-sm font-black text-white shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:opacity-95 transition-all btn-interactive disabled:opacity-50 cursor-pointer"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Record Visit &amp; Update Customer Retention</span>
          </button>
        </form>
      </div>
    </div>
  );
}
