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
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#111439]">Fast Visit Entry</h1>
            <span className="rounded-full bg-[#16A34A]/10 px-2.5 py-0.5 text-xs font-bold text-[#16A34A] inline-flex items-center gap-1">
              <Zap className="h-3 w-3" /> 5-10s Speed Mode
            </span>
          </div>
          <p className="text-xs text-[#667085] mt-1">
            Lookup phone number, enter amount, and keep your counter queue moving fast.
          </p>
        </div>

        <button
          onClick={() => setIsQROpen(true)}
          className="flex items-center gap-2 rounded-xl border border-[#E8E8ED] bg-white px-3.5 py-2 text-xs font-bold text-[#111439] hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
        >
          <QrCode className="h-4 w-4 text-[#6C4DFF]" />
          <span>Table / Counter QR Code</span>
        </button>
      </div>

      {isReadOnly && (
        <div className="rounded-xl bg-[#EF4444]/10 p-4 border border-[#EF4444]/20 flex items-center gap-3 text-xs text-[#EF4444] font-semibold">
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
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#16A34A] text-white">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#111439]">
                Visit recorded successfully! (₹{successData.amount.toLocaleString()})
              </p>
              <p className="text-xs text-[#667085] mt-0.5">
                Logged for <strong className="text-[#111439]">{successData.customerName}</strong>
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
                className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-xl bg-[#25D366] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#20bd5a]"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Send WhatsApp Thanks</span>
              </a>
            )}
            <button
              onClick={() => setSuccessData(null)}
              className="text-xs font-semibold text-[#667085] hover:text-[#111439] px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Entry Form Card */}
      <div className="rounded-3xl border border-[#E8E8ED] bg-white p-6 sm:p-8 shadow-sm">
        {/* Toggle Mode: Known Customer vs Anonymous */}
        <div className="flex items-center justify-between border-b border-[#E8E8ED] pb-5 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#111439] uppercase tracking-wider">
              Entry Type
            </span>
          </div>

          <div className="flex rounded-xl bg-[#F8F8F9] p-1 border border-[#E8E8ED]">
            <button
              type="button"
              onClick={() => setIsAnonymous(false)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                !isAnonymous
                  ? "bg-white text-[#6C4DFF] shadow-xs"
                  : "text-[#667085] hover:text-[#111439]"
              }`}
            >
              Customer Visit
            </button>
            <button
              type="button"
              onClick={() => setIsAnonymous(true)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                isAnonymous
                  ? "bg-white text-[#6C4DFF] shadow-xs"
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
                <label className="block text-xs font-bold text-[#111439] mb-1.5">
                  Customer Mobile / Search *
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#667085]">
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
                    className="w-full rounded-xl border border-[#E8E8ED] bg-[#F8F8F9] pl-10 pr-4 py-3 text-sm font-medium text-[#111439] focus:border-[#6C4DFF] focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Matched Customer Autocomplete Suggestion */}
              {matchedCustomer && !selectedCustomerId && (
                <div
                  onClick={() => handleSelectCustomer(matchedCustomer)}
                  className="rounded-xl border border-[#6C4DFF]/30 bg-[#6C4DFF]/5 p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#6C4DFF]/10 transition-colors animate-fade-in"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6C4DFF] text-white font-bold text-xs">
                      {matchedCustomer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#111439]">
                        {matchedCustomer.name}{" "}
                        <span className="text-[10px] text-[#667085] font-normal">
                          ({matchedCustomer.phone})
                        </span>
                      </p>
                      <p className="text-[11px] text-[#667085]">
                        {matchedCustomer.total_visits} visits recorded • Last seen {new Date(matchedCustomer.last_visit_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#6C4DFF] px-2.5 py-1 text-[10px] font-bold text-white">
                    Select Member
                  </span>
                </div>
              )}

              {/* Selected Customer Banner */}
              {selectedCustomerId && (
                <div className="rounded-xl border border-[#16A34A]/30 bg-[#16A34A]/5 p-3.5 flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#16A34A]" />
                    <div>
                      <p className="text-xs font-bold text-[#111439]">{name}</p>
                      <p className="text-[11px] text-[#667085]">{phoneSearch}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearSelected}
                    className="text-xs font-semibold text-[#EF4444] hover:underline"
                  >
                    Change
                  </button>
                </div>
              )}

              {/* If New Customer (no match & not selected) */}
              {!matchedCustomer && !selectedCustomerId && phoneSearch.length >= 3 && (
                <div className="rounded-xl border border-[#E8E8ED] bg-[#F8F8F9] p-4 space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#6C4DFF]">
                    <Sparkles className="h-4 w-4" />
                    <span>New Customer Detected — Enter Name</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#111439] mb-1">
                      Customer Full Name *
                    </label>
                    <input
                      type="text"
                      required={!isAnonymous && !selectedCustomerId}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full rounded-xl border border-[#E8E8ED] bg-white px-3 py-2 text-xs font-medium text-[#111439] focus:outline-none focus:border-[#6C4DFF]"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Amount Input & Fast Quick-Select Chips */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#111439]">
                Visit Bill / Order Amount ({activeBusiness.currency || "INR"}) *
              </label>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#667085] font-bold text-sm">
                ₹
              </div>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-[#E8E8ED] bg-[#F8F8F9] pl-9 pr-4 py-3.5 text-lg font-black text-[#111439] focus:border-[#6C4DFF] focus:bg-white focus:outline-none transition-all"
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="mt-2.5 flex flex-wrap gap-2">
              {quickAmountPresets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  className="rounded-lg border border-[#E8E8ED] bg-white px-3 py-1.5 text-xs font-bold text-[#111439] hover:border-[#6C4DFF] hover:bg-[#6C4DFF]/5 transition-colors"
                >
                  ₹{val}
                </button>
              ))}
            </div>
          </div>

          {/* Notes or Order details */}
          <div>
            <label className="block text-xs font-bold text-[#111439] mb-1.5">
              Items / Notes <span className="text-[10px] text-[#667085] font-normal">(Optional, e.g. Table 4 / Hair Spa / Cold Brew)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Table 2, 2x Cappuccino + Croissant"
              className="w-full rounded-xl border border-[#E8E8ED] bg-[#F8F8F9] px-4 py-2.5 text-xs font-medium text-[#111439] focus:border-[#6C4DFF] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isReadOnly}
            className="w-full flex items-center justify-center gap-2 rounded-xl brand-gradient py-4 text-sm font-black text-white shadow-lg shadow-[#6C4DFF]/25 hover:opacity-95 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Record Visit & Update Retention Intelligence</span>
          </button>
        </form>
      </div>
    </div>
  );
}
