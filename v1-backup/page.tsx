"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  MessageCircle,
  Users,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Building2,
  UtensilsCrossed,
  Coffee,
  Scissors,
  Dumbbell,
  ShoppingBag,
  Stethoscope,
  ChevronRight,
  Calculator,
  QrCode,
  Smartphone,
  BarChart3,
  Star,
} from "lucide-react";
import { SUBSCRIPTION_PLANS } from "@/lib/seedData";

export default function LandingPage() {
  const [selectedIndustry, setSelectedIndustry] = useState<
    "restaurant" | "cafe" | "salon_spa" | "gym" | "retail" | "clinic"
  >("restaurant");

  // ROI Calculator state
  const [dailyCustomers, setDailyCustomers] = useState(50);
  const [avgTicket, setAvgTicket] = useState(600);

  // Industry specific demo previews
  const industryData = {
    restaurant: {
      label: "Restaurants & Bistros",
      icon: UtensilsCrossed,
      tagline: "Turn weekend diners into regular weekly guests",
      exampleCustomer: "Rahul Deshmukh (Table 4 regular)",
      overdueReason: "Has not visited in 16 days (usually visits every 5 days)",
      actionOffer: "Send 15% Weekend Chef Special Comeback Offer",
      metric: "+32% Dinner Repeat Rate",
    },
    cafe: {
      label: "Cafés & Bakeries",
      icon: Coffee,
      tagline: "Never let your morning coffee regulars disappear",
      exampleCustomer: "Sneha Kapur (Remote worker)",
      overdueReason: "Missed her 3-day coffee rhythm. Last seen 10 days ago.",
      actionOffer: "Send Free Pastry Upgrade on Next Cold Brew",
      metric: "4.8x Higher Weekly Frequency",
    },
    salon_spa: {
      label: "Salons & Spas",
      icon: Scissors,
      tagline: "Automate appointment reminders & beauty re-engagement",
      exampleCustomer: "Pooja Sharma (Hair spa client)",
      overdueReason: "Service due: 35 days since last facial & haircut",
      actionOffer: "Send 'We Miss You' 20% Luxury Re-juvenation Perk",
      metric: "₹45,000+ Recovered Monthly",
    },
    gym: {
      label: "Gyms & Studios",
      icon: Dumbbell,
      tagline: "Stop gym membership drop-outs before they quit",
      exampleCustomer: "Arjun Rawat (Crossfit member)",
      overdueReason: "Zero workouts recorded in past 12 days",
      actionOffer: "Send Coach Motivation & Free Personal Training pass",
      metric: "74% Drop-out Prevention",
    },
    retail: {
      label: "Boutique Retail",
      icon: ShoppingBag,
      tagline: "Bring shoppers back for new arrivals & exclusive perks",
      exampleCustomer: "Ananya Iyer (Fashion VIP)",
      overdueReason: "Has not shopped new seasonal collection in 45 days",
      actionOffer: "Send VIP Early Access + ₹500 shopping voucher",
      metric: "3.2x Higher Customer LTV",
    },
    clinic: {
      label: "Clinics & Wellness",
      icon: Stethoscope,
      tagline: "Gentle follow-up reminders for routine health checkups",
      exampleCustomer: "Karthik Sundaram (Dental patient)",
      overdueReason: "6 months since last cleaning & dental routine checkup",
      actionOffer: "Send Friendly Wellness Checkup Booking Link",
      metric: "91% Patient Follow-up Rate",
    },
  };

  const activeInd = industryData[selectedIndustry];

  // Deterministic ROI calculation: Recovering 12% of lost customers with 2 extra visits/month
  const monthlyLostAtRisk = Math.round(dailyCustomers * 30 * 0.15);
  const recoveredCustomers = Math.round(monthlyLostAtRisk * 0.22);
  const extraRevenueRecovered = recoveredCustomers * avgTicket * 2;

  return (
    <div className="min-h-screen bg-[#F8F8F9] text-[#111439]">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-[#E8E8ED] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl brand-gradient text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-[#111439]">
                Revia
              </span>
              <p className="text-[10px] font-semibold text-[#667085] leading-none">
                Small Business Retention Engine
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#667085]">
            <a href="#features" className="hover:text-[#111439] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#111439] transition-colors">How It Works</a>
            <a href="#industries" className="hover:text-[#111439] transition-colors">Industries</a>
            <a href="#calculator" className="hover:text-[#111439] transition-colors">ROI Calculator</a>
            <a href="#pricing" className="hover:text-[#111439] transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-xs font-bold text-[#111439] hover:text-[#6C4DFF] transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/auth/login"
              className="flex items-center gap-1.5 rounded-xl brand-gradient px-4 py-2 text-xs font-bold text-white shadow-md hover:opacity-95 transition-opacity"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#6C4DFF]/20 bg-[#6C4DFF]/10 px-4 py-1.5 text-xs font-bold text-[#6C4DFF] mb-6 animate-fade-in">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Multi-Industry Retention & Return System</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#111439] leading-tight">
              Turn First-Time Visitors Into{" "}
              <span className="brand-gradient-text">Loyal Repeat Customers.</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-[#667085] leading-relaxed max-w-2xl mx-auto">
              One simple system for restaurants, cafes, hotels, salons, gyms, and local businesses to track visits in 5 seconds, find who is disappearing, and bring them back with 1-click WhatsApp.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/auth/login"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl brand-gradient px-8 py-4 text-sm font-bold text-white shadow-lg shadow-[#6C4DFF]/25 hover:opacity-95 transition-all transform active:scale-95"
              >
                <span>Start 14-Day Free Trial</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-[#E8E8ED] bg-white px-6 py-4 text-sm font-bold text-[#111439] hover:bg-gray-50 transition-colors shadow-2xs"
              >
                <Zap className="h-4 w-4 text-[#6C4DFF]" />
                <span>Explore Live Demo Dashboard</span>
              </Link>
            </div>

            <p className="mt-3 text-xs text-[#667085]">
              ✓ No credit card required &nbsp;•&nbsp; ✓ 14-day full feature access &nbsp;•&nbsp; ✓ Setup takes 2 minutes
            </p>
          </div>

          {/* Value Stats Pills */}
          <div className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-4xl mx-auto">
            <div className="brand-card p-4 text-center">
              <p className="text-2xl font-black text-[#111439]">+28%</p>
              <p className="text-xs font-semibold text-[#667085] mt-0.5">Average Repeat Visits</p>
            </div>
            <div className="brand-card p-4 text-center">
              <p className="text-2xl font-black text-[#6C4DFF]">5-10 Sec</p>
              <p className="text-xs font-semibold text-[#667085] mt-0.5">Fast Mobile Data Entry</p>
            </div>
            <div className="brand-card p-4 text-center">
              <p className="text-2xl font-black text-[#16A34A]">80%+</p>
              <p className="text-xs font-semibold text-[#667085] mt-0.5">At-Risk Recovery Rate</p>
            </div>
            <div className="brand-card p-4 text-center">
              <p className="text-2xl font-black text-[#3B82F6]">Zero</p>
              <p className="text-xs font-semibold text-[#667085] mt-0.5">POS Hardware Needed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Multi-Industry Selector */}
      <section id="industries" className="py-16 bg-white border-y border-[#E8E8ED]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6C4DFF]">
              Tailored For Every Small Business
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#111439] mt-2">
              Built for businesses where repeat customers drive profit
            </h2>
          </div>

          {/* Industry Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {(Object.keys(industryData) as (keyof typeof industryData)[]).map((key) => {
              const item = industryData[key];
              const isSelected = selectedIndustry === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedIndustry(key)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                    isSelected
                      ? "brand-gradient text-white shadow-md shadow-[#6C4DFF]/20 scale-105"
                      : "bg-[#F8F8F9] text-[#667085] hover:bg-gray-100 hover:text-[#111439] border border-[#E8E8ED]"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Industry Showcase Card */}
          <div className="mx-auto max-w-4xl rounded-2xl border border-[#E8E8ED] bg-[#F8F8F9] p-6 sm:p-8 shadow-md">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#E8E8ED] pb-6">
              <div>
                <span className="inline-block rounded-full bg-[#6C4DFF]/10 px-3 py-1 text-xs font-bold text-[#6C4DFF] mb-1">
                  {activeInd.metric}
                </span>
                <h3 className="text-xl font-bold text-[#111439]">{activeInd.tagline}</h3>
              </div>
              <Link
                href="/auth/login"
                className="flex items-center gap-1.5 rounded-xl brand-gradient px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95"
              >
                <span>Get Started</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Simulated Live Action Card */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl bg-white p-5 border border-[#E8E8ED] shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                    1. Intelligence Detection
                  </span>
                  <span className="rounded-full bg-[#EF4444]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#EF4444]">
                    Becoming Inactive
                  </span>
                </div>
                <p className="font-bold text-sm text-[#111439]">{activeInd.exampleCustomer}</p>
                <p className="text-xs text-[#667085] mt-1">{activeInd.overdueReason}</p>
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#F8F8F9] p-2.5 text-xs text-[#111439]">
                  <Clock className="h-4 w-4 text-[#F59E0B]" />
                  <span>Expected return cycle exceeded. Immediate follow-up recommended.</span>
                </div>
              </div>

              <div className="rounded-xl bg-white p-5 border border-[#E8E8ED] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                      2. 1-Click WhatsApp Action
                    </span>
                    <span className="rounded-full bg-[#16A34A]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#16A34A]">
                      Personalized
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#111439]">{activeInd.actionOffer}</p>
                  <p className="text-[11px] text-[#667085] mt-2 italic bg-[#F8F8F9] p-3 rounded-lg border border-[#E8E8ED]">
                    &ldquo;Hi {activeInd.exampleCustomer.split(" ")[0]}! We missed you at our store. Show this message for an exclusive comeback treat this week! 🎁&rdquo;
                  </p>
                </div>
                <Link
                  href="/whatsapp"
                  className="mt-4 flex items-center justify-center gap-2 w-full rounded-xl bg-[#25D366] py-2.5 text-xs font-bold text-white hover:bg-[#20bd5a] transition-colors shadow-xs"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Open & Send via WhatsApp</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10 Core Modules Overview */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6C4DFF]">
              Complete Retention Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#111439] mt-2">
              Everything you need to stop losing regular customers
            </h2>
            <p className="text-sm sm:text-base text-[#667085] mt-3">
              Designed from the ground up to be ultra-fast on mobile phones and intuitive for staff.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="brand-card p-6 brand-card-hover">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6C4DFF]/10 text-[#6C4DFF] mb-4">
                <Smartphone className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-[#111439]">5-Second Fast Visit Entry</h3>
              <p className="text-xs text-[#667085] mt-2 leading-relaxed">
                Staff search by WhatsApp number in seconds. Existing regulars are recognized automatically. Includes 1-tap anonymous mode for busy queues.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="brand-card p-6 brand-card-hover">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] mb-4">
                <QrCode className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-[#111439]">Counter QR Code Self-Opt-In</h3>
              <p className="text-xs text-[#667085] mt-2 leading-relaxed">
                Place a QR code on counters or dining tables. Customers scan and voluntarily enter their name and WhatsApp to claim a 10% loyalty reward.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="brand-card p-6 brand-card-hover">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#16A34A]/10 text-[#16A34A] mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-[#111439]">Daily AI Trend Report</h3>
              <p className="text-xs text-[#667085] mt-2 leading-relaxed">
                Deterministic calculations power an AI engine that explains yesterday vs today changes, trending customer behavior, and prioritized daily action steps.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="brand-card p-6 brand-card-hover">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F59E0B]/10 text-[#F59E0B] mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-[#111439]">5 Smart Customer Segments</h3>
              <p className="text-xs text-[#667085] mt-2 leading-relaxed">
                Automatically tags customers into New, Regular, VIP, Becoming Inactive, and Inactive based on their unique visit intervals.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="brand-card p-6 brand-card-hover">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#25D366]/10 text-[#25D366] mb-4">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-[#111439]">1-Click WhatsApp Dispatch</h3>
              <p className="text-xs text-[#667085] mt-2 leading-relaxed">
                Generate personalized thank-you, comeback, reminder, and VIP offers with smart tokens, and open WhatsApp Web or mobile in 1 click.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="brand-card p-6 brand-card-hover">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#111439]/10 text-[#111439] mb-4">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-[#111439]">Retention & ROI Measurement</h3>
              <p className="text-xs text-[#667085] mt-2 leading-relaxed">
                Track repeat rates, customer lifetime spend (LTV), visit frequency curves, and exact revenue recovered from win-back outreach.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive ROI Calculator */}
      <section id="calculator" className="py-20 bg-white border-y border-[#E8E8ED]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#16A34A]/10 px-3 py-1 text-xs font-bold text-[#16A34A]">
              <Calculator className="h-3.5 w-3.5" /> Interactive ROI Model
            </span>
            <h2 className="text-3xl font-black text-[#111439] mt-2">
              How much revenue are you losing to inactive regulars?
            </h2>
            <p className="text-xs sm:text-sm text-[#667085] mt-2">
              Adjust your daily volume and average bill size to calculate the revenue our system can bring back.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#F8F8F9] p-8 rounded-3xl border border-[#E8E8ED]">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-[#111439]">
                    Daily Customer Count:
                  </label>
                  <span className="text-sm font-black text-[#6C4DFF]">
                    {dailyCustomers} customers / day
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="300"
                  step="5"
                  value={dailyCustomers}
                  onChange={(e) => setDailyCustomers(Number(e.target.value))}
                  className="w-full accent-[#6C4DFF] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-[#111439]">
                    Average Bill / Order Spend:
                  </label>
                  <span className="text-sm font-black text-[#6C4DFF]">
                    ₹{avgTicket}
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="3000"
                  step="50"
                  value={avgTicket}
                  onChange={(e) => setAvgTicket(Number(e.target.value))}
                  className="w-full accent-[#6C4DFF] cursor-pointer"
                />
              </div>

              <div className="rounded-xl bg-white p-4 border border-[#E8E8ED] text-xs text-[#667085] space-y-1.5">
                <p>• Estimated at-risk customers / month: <strong className="text-[#111439]">{monthlyLostAtRisk}</strong></p>
                <p>• Expected recovered customers with 1-click winback: <strong className="text-[#16A34A]">{recoveredCustomers}</strong></p>
              </div>
            </div>

            {/* Output Highlight Box */}
            <div className="rounded-2xl brand-gradient p-8 text-white text-center shadow-xl shadow-[#6C4DFF]/20 flex flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-wider text-white/80">
                Estimated Extra Revenue Recovered
              </p>
              <p className="text-4xl sm:text-5xl font-black mt-2 tracking-tight">
                ₹{extraRevenueRecovered.toLocaleString()}
                <span className="text-sm font-normal text-white/80"> / month</span>
              </p>
              <p className="text-xs text-white/90 mt-4 leading-relaxed">
                By recovering just {recoveredCustomers} disappearing customers with an average spend of ₹{avgTicket}, you generate ₹{extraRevenueRecovered.toLocaleString()} extra monthly sales.
              </p>
              <div className="mt-6">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-white py-3 text-xs font-bold text-[#111439] hover:bg-gray-100 transition-colors shadow-md"
                >
                  <span>Start Free 14-Day Trial</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6C4DFF]">
              Simple, Transparent Pricing
            </span>
            <h2 className="text-3xl font-black text-[#111439] mt-2">
              Invest a fraction of one recovered customer
            </h2>
            <p className="text-xs sm:text-sm text-[#667085] mt-2">
              Start with a full 14-day free trial. No credit card required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-3xl p-8 transition-all ${
                  plan.is_popular
                    ? "bg-white border-2 border-[#6C4DFF] shadow-xl shadow-[#6C4DFF]/15 scale-105"
                    : "bg-white border border-[#E8E8ED] shadow-sm"
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full brand-gradient px-4 py-1 text-[11px] font-black text-white shadow-md">
                    {plan.badge}
                  </span>
                )}

                <div>
                  <h3 className="text-lg font-black text-[#111439]">{plan.name}</h3>
                  <p className="text-xs text-[#667085] mt-1">{plan.description}</p>

                  <div className="my-6">
                    <span className="text-4xl font-black text-[#111439]">
                      ₹{plan.price_monthly_inr}
                    </span>
                    <span className="text-xs text-[#667085]"> / month</span>
                  </div>

                  <ul className="space-y-3 border-t border-[#E8E8ED] pt-6 text-xs text-[#111439]">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#16A34A] shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-[#E8E8ED]">
                  <Link
                    href="/auth/login"
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all ${
                      plan.is_popular
                        ? "brand-gradient text-white shadow-md hover:opacity-95"
                        : "bg-[#F8F8F9] text-[#111439] hover:bg-gray-100 border border-[#E8E8ED]"
                    }`}
                  >
                    <span>Start 14-Day Free Trial</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E8E8ED] bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg brand-gradient text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-sm font-black text-[#111439]">Revia</span>
          </div>
          <p className="text-xs text-[#667085]">
            © {new Date().getFullYear()} Revia. All rights reserved. Made for small businesses.
          </p>
          <div className="flex items-center gap-4 text-xs font-semibold text-[#667085]">
            <Link href="/auth/login" className="hover:text-[#111439]">Login</Link>
            <Link href="/auth/login" className="hover:text-[#111439]">Register</Link>
            <Link href="/admin" className="hover:text-[#6C4DFF]">Super Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
