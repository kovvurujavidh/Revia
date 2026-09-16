// Importers/Callers: AppLayoutWrapper, Dashboard, AddVisitPage
// Affected API: CounterQRCode React modal component (adaptive for PG, Gym, Clothing, and Retail/Restaurant)
// Data Schemas: Business from src/lib/types.ts
// User's Verbatim Instruction: "when i scan this it need to open a sutomer from so the customer can directly register him self into the=is organization"

"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useApp } from "@/context/AppContext";
import { X, Printer, Copy, Check, ExternalLink, Sparkles } from "lucide-react";

export function CounterQRCode({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { activeBusiness } = useApp();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const joinUrl = typeof window !== "undefined"
    ? `${window.location.origin}/join/${activeBusiness.id}`
    : `https://example.com/join/${activeBusiness.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const industry = activeBusiness?.industry;
  const isPG = industry === "pg_hostel";
  const isGym = industry === "gym";
  const isClothing = industry === "clothing";

  const getHeaderBadge = () => {
    if (isPG) return "PG Resident QR Code";
    if (isGym) return "Gym Member QR Code";
    if (isClothing) return "VIP Shopper QR Code";
    return "Table & Counter QR Code";
  };

  const getSubHeader = () => {
    if (isPG) return "Place this at your reception desk or notice board. Residents scan to register directly into your system.";
    if (isGym) return "Place this at your front desk. Members scan to register or check in for daily workouts.";
    if (isClothing) return "Place this at your billing counter. Shoppers scan to get instant perks and join your VIP club.";
    return "Place this on your counter or dining tables. Customers scan to claim their perk and register voluntarily.";
  };

  const getScanTitle = () => {
    if (isPG) return "Scan to Register as Resident";
    if (isGym) return "Scan to Register / Check-In";
    if (isClothing) return "Scan to Join VIP Shoppers";
    return "Scan to Join VIP Club";
  };

  const getPerkText = () => {
    if (isPG) return "🏢 Instant resident registration & WhatsApp rent updates";
    if (isGym) return "💪 Quick workout check-in & membership pass";
    return `🎁 ${activeBusiness.qr_loyalty_perk || "Get 10% OFF on your next visit!"}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-[#121215] p-6 shadow-2xl border border-white/[0.1] text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-[#a1a1aa] hover:bg-white/[0.06] hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/15 border border-purple-500/30 px-3 py-1 text-xs font-bold text-purple-400 mb-2">
            <Sparkles className="h-3.5 w-3.5" /> {getHeaderBadge()}
          </span>
          <h2 className="text-xl font-black text-white">{activeBusiness.name}</h2>
          <p className="text-xs text-[#a1a1aa] mt-1">
            {getSubHeader()}
          </p>
        </div>

        {/* QR Code Container (Printable) */}
        <div id="printable-qr-flyer" className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-purple-500/30 bg-[#18181b] p-6 text-center">
          <div className="bg-white p-4 rounded-2xl shadow-xl">
            <QRCodeSVG
              value={joinUrl}
              size={180}
              level="H"
              includeMargin={true}
              fgColor="#09090b"
            />
          </div>

          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-purple-400">
              {getScanTitle()}
            </p>
            <p className="text-sm font-bold text-white mt-1">
              {getPerkText()}
            </p>
            <p className="text-[11px] text-[#71717a] mt-1">
              No app download required • Instant WhatsApp confirmation
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <button
            onClick={handleCopy}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 text-xs font-bold text-white hover:bg-white/[0.08] transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-[#a1a1aa]" />
                <span>Copy Opt-In Link</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl brand-gradient py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:opacity-95 transition-all"
          >
            <Printer className="h-4 w-4" />
            <span>Print Counter Flyer</span>
          </button>
        </div>

        {/* Live Preview link */}
        <div className="mt-4 text-center">
          <a
            href={joinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-purple-400 hover:text-purple-300 hover:underline"
          >
            <span>Open Customer Mobile View</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
