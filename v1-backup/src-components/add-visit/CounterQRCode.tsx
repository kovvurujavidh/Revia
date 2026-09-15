"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useApp } from "@/context/AppContext";
import { X, Printer, Copy, Check, ExternalLink, Sparkles, ShieldCheck } from "lucide-react";

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#E8E8ED]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-[#667085] hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#6C4DFF]/10 px-3 py-1 text-xs font-bold text-[#6C4DFF] mb-2">
            <Sparkles className="h-3.5 w-3.5" /> Table & Counter QR Code
          </span>
          <h2 className="text-xl font-black text-[#111439]">{activeBusiness.name}</h2>
          <p className="text-xs text-[#667085] mt-1">
            Place this on your counter or dining tables. Customers scan to claim their perk and register voluntarily.
          </p>
        </div>

        {/* QR Code Container (Printable) */}
        <div id="printable-qr-flyer" className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#6C4DFF]/30 bg-[#F8F8F9] p-6 text-center">
          <div className="bg-white p-4 rounded-2xl shadow-md border border-[#E8E8ED]">
            <QRCodeSVG
              value={joinUrl}
              size={180}
              level="H"
              includeMargin={true}
              fgColor="#111439"
            />
          </div>

          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#6C4DFF]">
              Scan to Join VIP Club
            </p>
            <p className="text-sm font-bold text-[#111439] mt-1">
              🎁 {activeBusiness.qr_loyalty_perk || "Get 10% OFF on your next visit!"}
            </p>
            <p className="text-[11px] text-[#667085] mt-1">
              No app download required • Instant WhatsApp confirmation
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <button
            onClick={handleCopy}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#E8E8ED] bg-white py-2.5 text-xs font-bold text-[#111439] hover:bg-[#F8F8F9] transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-[#16A34A]" />
                <span className="text-[#16A34A]">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-[#667085]" />
                <span>Copy Opt-In Link</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl brand-gradient py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 transition-opacity"
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
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#6C4DFF] hover:underline"
          >
            <span>Open Customer Mobile View</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
