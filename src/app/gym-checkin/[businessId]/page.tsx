// Importers/Callers: Next.js dynamic App router route /gym-checkin/[businessId], QR Code counter scan
// Affected API: Mobile browser self-check-in page, real-time gym attendance validation & duplicate prevention
// Data Schemas: Business, Customer, Visit from src/lib/types.ts
// User's Verbatim Instruction: "c:\AI\Revia_Final_All_Three_Business_Updates_Claude_Code_Prompt.docx now this make todo and complete updaate"

"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { AppStore } from "@/lib/store";
import { Business, Customer, Visit } from "@/lib/types";
import { parseGymMember, ParsedGymMember } from "@/lib/gymUtils";
import {
  Dumbbell,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Phone,
  ArrowRight,
  Clock,
  Sparkles,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";

export default function GymCheckInPage() {
  const params = useParams();
  const businessId = params.businessId as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [phoneInput, setPhoneInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkInResult, setCheckInResult] = useState<{
    status: "success" | "already_checked_in" | "expired" | "not_found";
    member?: ParsedGymMember;
    message: string;
    checkInTime?: string;
  } | null>(null);

  useEffect(() => {
    const store = AppStore.getInstance();
    const allBusinesses = store.getBusinesses();
    const foundBusiness = allBusinesses.find((b) => b.id === businessId) || store.getActiveBusiness();
    setBusiness(foundBusiness);

    const bCustomers = store.getCustomers(foundBusiness.id);
    const bVisits = store.getVisits(foundBusiness.id);

    setCustomers(bCustomers);
    setVisits(bVisits);
    setIsLoading(false);
  }, [businessId]);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim() || !business) return;

    setIsSubmitting(true);
    setCheckInResult(null);

    // Clean phone number
    const cleanPhone = phoneInput.replace(/[^0-9]/g, "");

    const store = AppStore.getInstance();
    const currentCustomers = store.getCustomers(business.id);
    const currentVisits = store.getVisits(business.id);

    // Find member by matching phone ending (last 10 digits)
    const matchedCustomer = currentCustomers.find((c) => {
      const cClean = c.phone.replace(/[^0-9]/g, "");
      return cClean.endsWith(cleanPhone) || cleanPhone.endsWith(cClean);
    });

    if (!matchedCustomer) {
      setCheckInResult({
        status: "not_found",
        message: `No active membership found for phone ending in "${phoneInput.slice(-4)}". Please register at the front desk.`,
      });
      setIsSubmitting(false);
      return;
    }

    const member = parseGymMember(matchedCustomer, currentVisits);

    // Check if membership is expired
    if (member.status === "expired") {
      setCheckInResult({
        status: "expired",
        member,
        message: `Membership expired on ${member.expiryDate}. Please renew your pass with the front desk.`,
      });
      setIsSubmitting(false);
      return;
    }

    // Check duplicate check-in today
    const todayStr = new Date().toISOString().split("T")[0];
    const alreadyCheckedInVisit = currentVisits.find((v) => {
      const vDate = (v.date || v.created_at).split("T")[0];
      const matchesCustomer = v.customer_id === member.id || v.customer_phone === member.phone;
      return vDate === todayStr && matchesCustomer;
    });

    const nowFormattedTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    if (alreadyCheckedInVisit) {
      const visitTime = new Date(alreadyCheckedInVisit.date || alreadyCheckedInVisit.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      setCheckInResult({
        status: "already_checked_in",
        member,
        checkInTime: visitTime,
        message: `Already checked in today at ${visitTime}! Have a great workout!`,
      });
      setIsSubmitting(false);
      return;
    }

    // Ensure active business ID is set
    store.setActiveBusinessId(business.id);

    // Log Check-in Visit
    await store.addVisit({
      customer_id: member.id,
      customer_name: member.name,
      customer_phone: member.phone,
      amount: 0,
      is_anonymous: false,
      items: ["Daily Workout Check-in"],
      notes: `QR Counter Check-in at ${nowFormattedTime}`,
      date: new Date().toISOString(),
    });

    // Update customer last visit
    await store.updateCustomer({
      ...member.rawCustomer,
      total_visits: member.rawCustomer.total_visits + 1,
      last_visit_date: new Date().toISOString(),
    });

    setCheckInResult({
      status: "success",
      member: {
        ...member,
        totalWorkouts: member.totalWorkouts + 1,
      },
      checkInTime: nowFormattedTime,
      message: `Welcome back, ${member.name}! Workout logged successfully.`,
    });

    setIsSubmitting(false);
  };

  const handleReset = () => {
    setPhoneInput("");
    setCheckInResult(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#111439] flex items-center justify-center text-white p-4">
        <RefreshCw className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#111439] via-[#1A1C4B] to-[#0D0F2D] text-white flex flex-col justify-between p-4 sm:p-6">
      {/* Top Header */}
      <div className="max-w-md w-full mx-auto text-center pt-6 space-y-2">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-orange-500/20 border border-orange-500/30 text-orange-400 mb-1">
          <Dumbbell className="h-8 w-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{business?.name || "Fitness Studio"}</h1>
        <p className="text-xs text-slate-300">Self Check-in &amp; Workout Attendance Portal</p>
      </div>

      {/* Main Check-in Card */}
      <div className="max-w-md w-full mx-auto my-auto bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {!checkInResult ? (
          <form onSubmit={handleCheckIn} className="space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold">Quick Check-in</h2>
              <p className="text-xs text-slate-300">Enter your registered mobile number to log your attendance</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-400" />
                <input
                  type="tel"
                  required
                  autoFocus
                  inputMode="numeric"
                  placeholder="e.g. 98765 43210"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full rounded-2xl border-2 border-white/20 bg-white/10 pl-12 pr-4 py-3.5 text-base font-bold text-white placeholder:text-slate-400 focus:bg-white/20 focus:border-orange-400 focus:outline-none transition-all tracking-wide"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || phoneInput.length < 4}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm tracking-wide shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Verifying Membership...</span>
                </>
              ) : (
                <>
                  <Flame className="h-5 w-5" />
                  <span>Check In for Workout</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-5 animate-fade-in">
            {checkInResult.status === "success" && (
              <>
                <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-emerald-400">Check-in Confirmed!</h3>
                  <p className="text-sm font-bold text-white">{checkInResult.member?.name}</p>
                  <p className="text-xs text-slate-300">Checked in at {checkInResult.checkInTime}</p>
                </div>

                <div className="rounded-2xl bg-white/10 border border-white/15 p-4 text-left space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Pass Plan:</span>
                    <span className="font-bold text-orange-300">{checkInResult.member?.planName}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Valid Until:</span>
                    <span className="font-bold text-emerald-300">{checkInResult.member?.expiryDate}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Total Workouts:</span>
                    <span className="font-bold text-white">{checkInResult.member?.totalWorkouts} Workouts</span>
                  </div>
                </div>
              </>
            )}

            {checkInResult.status === "already_checked_in" && (
              <>
                <div className="h-16 w-16 mx-auto rounded-full bg-blue-500/20 border-2 border-blue-500 text-blue-400 flex items-center justify-center">
                  <Clock className="h-10 w-10" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-blue-400">Already Checked In!</h3>
                  <p className="text-sm font-bold text-white">{checkInResult.member?.name}</p>
                  <p className="text-xs text-slate-300">{checkInResult.message}</p>
                </div>
              </>
            )}

            {checkInResult.status === "expired" && (
              <>
                <div className="h-16 w-16 mx-auto rounded-full bg-rose-500/20 border-2 border-rose-500 text-rose-400 flex items-center justify-center">
                  <ShieldAlert className="h-10 w-10" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-rose-400">Membership Expired</h3>
                  <p className="text-sm font-bold text-white">{checkInResult.member?.name}</p>
                  <p className="text-xs text-rose-200">{checkInResult.message}</p>
                </div>
              </>
            )}

            {checkInResult.status === "not_found" && (
              <>
                <div className="h-16 w-16 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-500 text-amber-400 flex items-center justify-center">
                  <AlertTriangle className="h-10 w-10" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-amber-400">Member Not Found</h3>
                  <p className="text-xs text-slate-300">{checkInResult.message}</p>
                </div>
              </>
            )}

            <button
              onClick={handleReset}
              className="w-full py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Done / Check In Another Member
            </button>
          </div>
        )}
      </div>

      {/* Bottom Footer */}
      <div className="max-w-md w-full mx-auto text-center pb-4 text-[11px] text-slate-400">
        Powered by <span className="text-orange-400 font-bold">Revia</span> Gym Attendance
      </div>
    </div>
  );
}
