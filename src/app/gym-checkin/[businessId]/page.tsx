"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Dumbbell,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Zap,
  Clock,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default function GymCheckinPage() {
  const params = useParams();
  const businessId = params.businessId as string;

  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    memberName?: string;
    daysLeft?: number;
  } | null>(null);

  useEffect(() => {
    if (!businessId) return;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    supabase
      .from("businesses")
      .select("name")
      .eq("id", businessId)
      .single()
      .then(({ data }) => {
        if (data?.name) setBusinessName(data.name);
      });
  }, [businessId]);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim().replace(/[^0-9+]/g, "");
    if (!cleanPhone || cleanPhone.length < 6) {
      setResult({ success: false, message: "Please enter a valid phone number." });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      // Find member by phone
      const { data: customer, error: custErr } = await supabase
        .from("customers")
        .select("*")
        .eq("business_id", businessId)
        .eq("phone", cleanPhone)
        .maybeSingle();

      if (custErr || !customer) {
        setResult({
          success: false,
          message: "No member found with this phone number. Please register at the front desk.",
        });
        setIsLoading(false);
        return;
      }

      // Parse gym metadata
      let meta: any = {};
      try {
        if (customer.notes?.startsWith("{")) {
          meta = JSON.parse(customer.notes);
        }
      } catch {
        meta = {};
      }

      const expiryDate = meta.expiry_date;
      if (expiryDate) {
        const exp = new Date(expiryDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        exp.setHours(0, 0, 0, 0);
        const daysLeft = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysLeft < 0) {
          setResult({
            success: false,
            message: `Membership expired ${Math.abs(daysLeft)} days ago. Please renew at the front desk.`,
            memberName: customer.name,
          });
          setIsLoading(false);
          return;
        }

        // Check if already checked in today
        const todayStr = new Date().toISOString().split("T")[0];
        const { data: todayVisits } = await supabase
          .from("visits")
          .select("id")
          .eq("customer_id", customer.id)
          .gte("date", todayStr)
          .lt("date", todayStr + "T23:59:59")
          .limit(1);

        if (todayVisits && todayVisits.length > 0) {
          setResult({
            success: true,
            message: "Already checked in today! Welcome back.",
            memberName: customer.name,
            daysLeft,
          });
          setIsLoading(false);
          return;
        }

        // Log check-in visit
        const { error: visitErr } = await supabase.from("visits").insert({
          business_id: businessId,
          customer_id: customer.id,
          customer_name: customer.name,
          customer_phone: customer.phone,
          amount: 0,
          is_anonymous: false,
          notes: "QR Check-in",
          items: ["gym_checkin"],
          date: new Date().toISOString(),
        });

        if (visitErr) {
          setResult({ success: false, message: "Failed to log check-in. Please try again." });
          setIsLoading(false);
          return;
        }

        setResult({
          success: true,
          message: daysLeft <= 7
            ? `Check-in successful! Membership expires in ${daysLeft} days — please renew soon.`
            : "Check-in successful! Have a great workout!",
          memberName: customer.name,
          daysLeft,
        });
      } else {
        // No expiry date — just log the check-in
        const { error: visitErr } = await supabase.from("visits").insert({
          business_id: businessId,
          customer_id: customer.id,
          customer_name: customer.name,
          customer_phone: customer.phone,
          amount: 0,
          is_anonymous: false,
          notes: "QR Check-in",
          items: ["gym_checkin"],
          date: new Date().toISOString(),
        });

        if (visitErr) {
          setResult({ success: false, message: "Failed to log check-in. Please try again." });
        } else {
          setResult({
            success: true,
            message: "Check-in successful! Have a great workout!",
            memberName: customer.name,
          });
        }
      }
    } catch (err) {
      setResult({ success: false, message: "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F9] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl brand-gradient text-white shadow-lg shadow-purple-500/20">
            <Dumbbell className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#111439]">
              {businessName || "Gym Check-in"}
            </h1>
            <p className="text-xs text-[#667085] mt-1 font-medium">
              Enter your phone number to log attendance
            </p>
          </div>
        </div>

        {/* Check-in Card */}
        <div className="brand-card p-6 shadow-xl">
          {/* Result Message */}
          {result && (
            <div
              className={`rounded-xl p-3 text-xs font-semibold flex items-center gap-2 mb-4 animate-fade-in ${
                result.success
                  ? "bg-[#16A34A]/10 border border-[#16A34A]/20 text-[#16A34A]"
                  : "bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444]"
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <div>
                {result.memberName && (
                  <span className="font-bold block">{result.memberName}</span>
                )}
                <span>{result.message}</span>
                {result.daysLeft !== undefined && result.daysLeft <= 7 && result.daysLeft >= 0 && (
                  <span className="block mt-1 text-[10px] opacity-80">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {result.daysLeft} days remaining
                  </span>
                )}
              </div>
            </div>
          )}

          {!result?.success && (
            <form onSubmit={handleCheckIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#111439] mb-1.5 uppercase tracking-wider">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                  <input
                    type="tel"
                    required
                    autoFocus
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your registered phone number"
                    className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] pl-10 pr-4 py-3 text-sm text-[#111439] placeholder:text-[#94A3B8] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl brand-gradient text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50 btn-interactive"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>Check In</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {result?.success && (
            <button
              onClick={() => {
                setResult(null);
                setPhone("");
              }}
              className="w-full py-3 rounded-xl border border-[#EAECF0] bg-[#F8F8F9] text-xs font-bold text-[#111439] hover:bg-[#F1F1F4] transition-colors cursor-pointer"
            >
              Check In Another Member
            </button>
          )}
        </div>

        <p className="text-center text-[10px] text-[#94A3B8] font-medium">
          Powered by Revia • Customer Retention Engine
        </p>
      </div>
    </div>
  );
}
