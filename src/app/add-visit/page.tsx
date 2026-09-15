// Importers/Callers: Next.js App Router route /add-visit, AppSidebar, MobileNav
// Affected API: AddVisitPage React component
// Data Schemas: Business, Customer, Visit, WhatsAppLog from src/lib/types.ts
// User's Verbatim Instruction: "https://emilkowal.ski/skill https://github.com/emilkowalski/skills https://www.ui-skills.com/skills INSTALL AND AUTOMATICALLY USE THIS SKILLS AND REDESIGH MY WEBSITE CONCEPT IS SAME CODE IS SAME JUST DESINE AND LOOK IF YOU HAVE PROBLEM MAKE A V1 VERSION AND SAVE ALL OLD VERSION AND USE THE NEW VERSION TO TEST"

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
  User,
} from "lucide-react";
import { buildWhatsAppLink } from "@/lib/intelligence";

export default function AddVisitPage() {
  const {
    activeBusiness,
    customers,
    addVisit,
    addCustomer,
    isReadOnly,
    logWhatsAppSend,
  } = useApp();

  const [isQROpen, setIsQROpen] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Form State
  const [phoneSearch, setPhoneSearch] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Feedback State
  const [successData, setSuccessData] = useState<{
    customerName: string;
    phone: string;
    amount: number;
    visitId: string;
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
  };

  const handleClearSelected = () => {
    setSelectedCustomerId(null);
    setName("");
    setPhoneSearch("");
  };

  const quickAmountPresets = [200, 500, 1000, 1500, 2500, 5000];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    let targetCustId: string | undefined = undefined;
    let targetPhone = "";
    let targetName = "Anonymous Walk-in";

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
        const newCust = addCustomer({
          business_id: activeBusiness.id,
          name: name.trim(),
          phone: phoneSearch.trim(),
          whatsapp_opt_in: true,
          notes: "Created during visit entry",
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
      amount: numAmount,
      notes: notes.trim() || undefined,
    });

    setSuccessData({
      customerName: targetName,
      phone: targetPhone,
      amount: numAmount,
      visitId: visit.id,
    });

    // Reset Form
    setPhoneSearch("");
    setName("");
    setAmount("");
    setNotes("");
    setSelectedCustomerId(null);
  };

  // WhatsApp Thank You Message link
  const thankYouWhatsAppUrl = useMemo(() => {
    if (!successData || !successData.phone) return null;
    const msg = `Hi ${successData.customerName}! Thank you for visiting *${activeBusiness.name}* today! We hope you had a great experience. See you again soon! ⭐`;
    return buildWhatsAppLink(successData.phone, msg);
  }, [successData, activeBusiness]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Modal for QR Code */}
      <CounterQRCode isOpen={isQROpen} onClose={() => setIsQROpen(false)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-white tracking-tight">Fast Visit Entry</h1>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-400 inline-flex items-center gap-1">
              <Zap className="h-3 w-3" /> 5-10s Speed Mode
            </span>
          </div>
          <p className="text-xs text-[#71717a] mt-1">
            Lookup phone number, enter amount, and keep your counter queue moving fast.
          </p>
        </div>

        <button
          onClick={() => setIsQROpen(true)}
          className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/[0.08] transition-colors btn-interactive"
        >
          <QrCode className="h-4 w-4 text-purple-400" />
          <span>Table / Counter QR Code</span>
        </button>
      </div>

      {isReadOnly && (
        <div className="rounded-xl bg-red-500/10 p-4 border border-red-500/25 flex items-center gap-3 text-xs text-red-400 font-semibold">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>
            Your trial has expired. You are currently in read-only mode. Please upgrade your plan in Profile to record new visits.
          </span>
        </div>
      )}

      {/* Success Notification Banner */}
      {successData && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 animate-fade-in flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-zinc-950 font-black">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                Visit recorded successfully! (₹{successData.amount.toLocaleString()})
              </p>
              <p className="text-xs text-[#a1a1aa] mt-0.5">
                Logged for <strong className="text-emerald-400">{successData.customerName}</strong>
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
                className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-xl bg-[#25D366] px-4 py-2.5 text-xs font-bold text-zinc-950 shadow-lg shadow-emerald-500/20 hover:brightness-105 transition-all btn-interactive"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Send WhatsApp Thanks</span>
              </a>
            )}
            <button
              onClick={() => setSuccessData(null)}
              className="text-xs font-semibold text-[#71717a] hover:text-white px-2 py-1 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Entry Form Card */}
      <div className="brand-card-elevated p-6 sm:p-8">
        {/* Toggle Mode: Known Customer vs Anonymous */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-5 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">
              Entry Type
            </span>
          </div>

          <div className="flex rounded-xl bg-white/[0.03] p-1 border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setIsAnonymous(false)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all btn-interactive ${
                !isAnonymous
                  ? "bg-purple-500 text-white shadow-md shadow-purple-500/25"
                  : "text-[#71717a] hover:text-white"
              }`}
            >
              Customer Visit
            </button>
            <button
              type="button"
              onClick={() => setIsAnonymous(true)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all btn-interactive ${
                isAnonymous
                  ? "bg-purple-500 text-white shadow-md shadow-purple-500/25"
                  : "text-[#71717a] hover:text-white"
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
                <label className="block text-xs font-bold text-[#a1a1aa] uppercase tracking-wider mb-1.5">
                  Customer Mobile / Search *
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#52525b]">
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
                    placeholder="Enter 10-digit mobile number or customer name"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-10 pr-4 py-3 text-sm font-medium text-white placeholder:text-[#52525b] focus:border-purple-500/50 focus:bg-white/[0.06] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Matched Customer Autocomplete Suggestion */}
              {matchedCustomer && !selectedCustomerId && (
                <div
                  onClick={() => handleSelectCustomer(matchedCustomer)}
                  className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3.5 flex items-center justify-between cursor-pointer hover:bg-purple-500/15 transition-colors animate-fade-in"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500 text-white font-bold text-xs">
                      {matchedCustomer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        {matchedCustomer.name}{" "}
                        <span className="text-[10px] text-[#a1a1aa] font-normal">
                          ({matchedCustomer.phone})
                        </span>
                      </p>
                      <p className="text-[11px] text-[#71717a] tabular-nums">
                        {matchedCustomer.total_visits} visits recorded • Last seen {new Date(matchedCustomer.last_visit_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-lg bg-purple-500 px-3 py-1 text-[10px] font-bold text-white shadow-sm shadow-purple-500/30">
                    Select Member
                  </span>
                </div>
              )}

              {/* Selected Customer Banner */}
              {selectedCustomerId && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <div>
                      <p className="text-xs font-bold text-white">{name}</p>
                      <p className="text-[11px] text-[#71717a] tabular-nums">{phoneSearch}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearSelected}
                    className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
                  >
                    Change
                  </button>
                </div>
              )}

              {/* If New Customer (no match & not selected) */}
              {!matchedCustomer && !selectedCustomerId && phoneSearch.length >= 3 && (
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                    <Sparkles className="h-4 w-4" />
                    <span>New Customer Detected — Enter Name</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#a1a1aa] uppercase tracking-wider mb-1">
                      Customer Full Name *
                    </label>
                    <input
                      type="text"
                      required={!isAnonymous && !selectedCustomerId}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-xs font-medium text-white placeholder:text-[#52525b] focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.06] transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Amount Input & Fast Quick-Select Chips */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">
                Visit Bill / Order Amount ({activeBusiness.currency || "INR"}) *
              </label>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-purple-400 font-bold text-base">
                ₹
              </div>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-10 pr-4 py-3.5 text-xl font-black text-white placeholder:text-[#52525b] focus:border-purple-500/50 focus:bg-white/[0.06] focus:outline-none tabular-nums transition-all"
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="mt-3 flex flex-wrap gap-2">
              {quickAmountPresets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-bold text-white hover:border-purple-500/40 hover:bg-purple-500/10 transition-all btn-interactive tabular-nums"
                >
                  ₹{val}
                </button>
              ))}
            </div>
          </div>

          {/* Notes or Order details */}
          <div>
            <label className="block text-xs font-bold text-[#a1a1aa] uppercase tracking-wider mb-1.5">
              Items / Notes <span className="text-[10px] text-[#71717a] font-normal lowercase">(optional, e.g. Table 4 / Hair Spa / Cold Brew)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Table 2, 2x Cappuccino + Croissant"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-white placeholder:text-[#52525b] focus:border-purple-500/50 focus:bg-white/[0.06] focus:outline-none transition-colors"
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isReadOnly}
            className="w-full flex items-center justify-center gap-2 rounded-xl brand-gradient py-4 text-sm font-black text-white shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:opacity-95 transition-all btn-interactive disabled:opacity-50 cursor-pointer"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Record Visit &amp; Update Retention Intelligence</span>
          </button>
        </form>
      </div>
    </div>
  );
}
