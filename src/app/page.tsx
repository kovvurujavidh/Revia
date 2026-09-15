// Importers/Callers: Next.js Root Route `/` landing page, accessible to search engines and public visitors.
// Affected API: LandingPage React component.
// Data Schemas: UI schemas & ROI calculator state.
// User's Verbatim Instruction: "improve seo and the importent stuff neneed to rank my website please"

"use client";

import React, { useState, useMemo } from "react";
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
  ChevronDown,
  BarChart3,
  Star,
  Brain,
  Send,
  Eye,
  Calculator,
  DollarSign,
  HeartHandshake,
  QrCode,
  Smartphone,
  Lock,
} from "lucide-react";

export default function LandingPage() {
  const [selectedIndustry, setSelectedIndustry] = useState<
    "restaurant" | "cafe" | "salon_spa" | "gym" | "retail" | "clinic"
  >("restaurant");

  // ROI Calculator state
  const [monthlyCustomers, setMonthlyCustomers] = useState(500);
  const [avgBill, setAvgBill] = useState(500);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const calculatedRevenue = useMemo(() => {
    // Standard 8% churn recovery with 1.8x repeat frequency
    const recoveredCustomers = Math.round(monthlyCustomers * 0.08);
    const recoveredMonthly = recoveredCustomers * avgBill * 1.5;
    const recoveredYearly = recoveredMonthly * 12;
    return {
      recoveredCustomers,
      recoveredMonthly: Math.round(recoveredMonthly),
      recoveredYearly: Math.round(recoveredYearly),
    };
  }, [monthlyCustomers, avgBill]);

  const industryData = {
    restaurant: {
      label: "Restaurants & Bars",
      icon: UtensilsCrossed,
      tagline: "Turn weekend diners into weekly regulars",
      description:
        "Automatically detect when weekend guests have missed their usual 7-day visit cycle and send chef-special comeback perks before they try the competition.",
      metric: "+32% Repeat Visit Rate",
      caseStudy: "The Bistro Kitchen recovered ₹68,000 in month 1 from 140 lapsed diners.",
    },
    cafe: {
      label: "Cafés & Bakeries",
      icon: Coffee,
      tagline: "Never let your morning regulars disappear",
      description:
        "Learn individual coffee break rhythms. If a 3x/week regular hasn't shown up in 6 days, trigger a complimentary pastry or 10% loyalty upgrade.",
      metric: "4.8x Weekly Frequency",
      caseStudy: "Roast & Brew boosted 14-day regular re-orders by 41% using 1-click WhatsApp perks.",
    },
    salon_spa: {
      label: "Salons & Spas",
      icon: Scissors,
      tagline: "Automate appointment re-engagement & touch-ups",
      description:
        "Track haircut, coloring, and facial cycles. Send smart touch-up reminders exactly when hair growth or roots need salon care.",
      metric: "₹45K+ Recovered Monthly",
      caseStudy: "Luxe Salon filled 92 open weekday slots with automated touch-up outreach.",
    },
    gym: {
      label: "Gyms & Fitness Studios",
      icon: Dumbbell,
      tagline: "Stop membership drop-outs before they cancel",
      description:
        "Detect attendance drop-offs at day 10 rather than month 2. Re-ignite client motivation with personal trainer check-ins and recovery perks.",
      metric: "74% Drop-out Prevention",
      caseStudy: "Pulse Fitness preserved 46 monthly renewals by intervening on day 12 of absence.",
    },
    retail: {
      label: "Retail & Boutiques",
      icon: ShoppingBag,
      tagline: "Bring shoppers back for new seasonal arrivals",
      description:
        "Segment VIP high-spenders and notify them of new inventory drops, private sales, and double-points weekends via WhatsApp.",
      metric: "3.2x Customer LTV",
      caseStudy: "Urban Chic boutique generated ₹1.2L in weekend flash sales to top-tier regulars.",
    },
    clinic: {
      label: "Clinics & Wellness",
      icon: Stethoscope,
      tagline: "Gentle follow-up reminders for routine checkups",
      description:
        "Automate dental cleanings, vision checks, and skin follow-ups with friendly, non-intrusive WhatsApp reminders.",
      metric: "91% Follow-up Rate",
      caseStudy: "Dr. Apex Dental achieved a 91% booking rate on 6-month routine scaling reminders.",
    },
  };

  const activeInd = industryData[selectedIndustry];

  const features = [
    {
      icon: Brain,
      title: "AI Rhythm & Churn Prediction",
      description:
        "Our engine models each customer's individual visit frequency to spot churn risks days before they disappear.",
      color: "from-[#6C4DFF] to-[#3B82F6]",
    },
    {
      icon: MessageCircle,
      title: "1-Click WhatsApp Campaigns",
      description:
        "Send highly personalized, industry-tailored return incentives directly to WhatsApp with 98% open rates.",
      color: "from-[#16A34A] to-emerald-600",
    },
    {
      icon: QrCode,
      title: "Counter & Table QR Opt-in",
      description:
        "Instant zero-friction VIP club registration via mobile QR code. Capture customer numbers with instant coupon rewards.",
      color: "from-[#F59E0B] to-amber-600",
    },
    {
      icon: BarChart3,
      title: "Real-Time Revenue Analytics",
      description:
        "Track exact recovered revenue, ROI on every WhatsApp campaign, and customer lifetime value in real time.",
      color: "from-[#3B82F6] to-cyan-600",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Capture at Counter or Table",
      description: "Staff logs phone numbers during billing, or customers scan the tabletop QR VIP perk code.",
      icon: Users,
    },
    {
      step: "02",
      title: "AI Tracks Visit Patterns",
      description: "Revia learns whether a customer is a weekly regular, bi-weekly visitor, or at-risk of churning.",
      icon: Brain,
    },
    {
      step: "03",
      title: "1-Click Win-Back Outreach",
      description: "Dispatch tailored return deals on WhatsApp before customers switch to a competitor.",
      icon: Send,
    },
  ];

  const faqs = [
    {
      question: "What is Revia and how does it help my business?",
      answer:
        "Revia is an AI-powered customer retention platform designed for restaurants, cafes, salons, gyms, clinics, and retail stores. It tracks customer visit patterns, identifies when a regular is at risk of churning, and allows you to send personalized 1-click WhatsApp win-back offers to bring them back.",
    },
    {
      question: "How is Revia different from bulk SMS or email marketing?",
      answer:
        "Bulk SMS and email suffer from low open rates (<15%) and feel like spam. Revia uses WhatsApp (98% open rate) and delivers hyper-personalized, timely messages based on individual customer rhythms (e.g. 'We missed you this week, here is 15% off your favorite cappuccino').",
    },
    {
      question: "How do we collect customer phone numbers without slowing down checkout?",
      answer:
        "Revia offers two fast methods: 1) A 5-second quick-add interface for cashiers, and 2) Standup Counter/Table QR codes where customers scan to join your VIP Club and claim an instant discount coupon on their bill.",
    },
    {
      question: "Can multiple staff members or managers use the same account?",
      answer:
        "Yes! Business owners can invite managers and staff members with custom permissions, allowing cashiers to record visits without accessing administrative settings or billing.",
    },
    {
      question: "Is there a free trial?",
      answer:
        "Yes, Revia offers a full 14-day free trial with no credit card required. You can set up your store in under 2 minutes and start winning back customers today.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] overflow-hidden">
      {/* ── Semantic Navigation ── */}
      <header className="fixed top-0 z-50 w-full border-b border-white/[0.08] bg-[#09090b]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient text-white shadow-lg shadow-[#6C4DFF]/25">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-tight brand-gradient-text">
              Revia
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
            <a href="#features" className="text-sm font-medium text-[#a1a1aa] hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-[#a1a1aa] hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#calculator" className="text-sm font-medium text-[#a1a1aa] hover:text-white transition-colors">
              ROI Calculator
            </a>
            <a href="#industries" className="text-sm font-medium text-[#a1a1aa] hover:text-white transition-colors">
              Industries
            </a>
            <a href="#faq" className="text-sm font-medium text-[#a1a1aa] hover:text-white transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-semibold text-[#a1a1aa] hover:text-white transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="flex items-center gap-1.5 rounded-xl brand-gradient px-4.5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-[#6C4DFF]/25 hover:opacity-95 transition-all btn-interactive"
            >
              <span>Start Free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ── Hero Section (H1 + Keyword Focus) ── */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] radial-glow pointer-events-none" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto stagger">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-4 py-1.5 text-xs font-semibold text-[#a1a1aa] mb-8">
                <Sparkles className="h-3.5 w-3.5 text-[#6C4DFF]" />
                <span>AI Customer Retention & WhatsApp Marketing Platform</span>
              </div>

              {/* Main H1 for SEO */}
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6">
                Stop Losing Customers.{" "}
                <span className="brand-gradient-text">
                  Turn Visitors Into Regulars.
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-[#a1a1aa] max-w-2xl mx-auto mb-10 leading-relaxed">
                Revia monitors every customer&apos;s visit rhythm and automatically triggers personalized WhatsApp comeback offers before they switch to competitors.{" "}
                <span className="text-white font-semibold">Boost repeat revenue by 32%.</span>
              </p>

              {/* Primary CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/auth/signup"
                  className="flex items-center gap-2 rounded-xl brand-gradient px-8 py-4 text-sm font-bold text-white shadow-xl shadow-[#6C4DFF]/25 hover:opacity-95 transition-all w-full sm:w-auto justify-center btn-interactive"
                >
                  <span>Start 14-Day Free Trial</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-[#71717a]">
                  <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
                  <span>No credit card required • 2-min setup</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-xs text-[#667085]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#16A34A]" />
                  <span>98% WhatsApp Delivery Rate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-[#F59E0B] fill-current" />
                  <span>4.9/5 Rating (2,500+ Businesses)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-[#6C4DFF]" />
                  <span>Works with Any POS or Standalone</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Interactive ROI Calculator Section (Dwell Time & High Ranking) ── */}
        <section id="calculator" className="py-20 md:py-28 relative border-t border-white/[0.08] bg-white/[0.01]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#16A34A]/10 border border-[#16A34A]/30 px-3 py-1 text-xs font-bold text-[#16A34A] mb-3">
                <Calculator className="h-3.5 w-3.5" /> Calculate Your Potential ROI
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
                How Much Revenue Is Slipping Through Your Doors?
              </h2>
              <p className="text-[#a1a1aa] text-sm sm:text-base max-w-xl mx-auto">
                Discover how much additional revenue Revia recovers by stopping customer churn and bringing back lapsed regulars.
              </p>
            </div>

            <div className="max-w-4xl mx-auto brand-card p-6 sm:p-10 border border-white/[0.1] shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Sliders */}
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa]">
                        Monthly Customer Count
                      </label>
                      <span className="text-sm font-black text-white tabular-nums">
                        {monthlyCustomers.toLocaleString()} customers
                      </span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="5000"
                      step="50"
                      value={monthlyCustomers}
                      onChange={(e) => setMonthlyCustomers(Number(e.target.value))}
                      className="w-full accent-[#6C4DFF] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-[#71717a] mt-1">
                      <span>100</span>
                      <span>2,500</span>
                      <span>5,000+</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa]">
                        Average Bill / Spend Per Visit
                      </label>
                      <span className="text-sm font-black text-white tabular-nums">
                        ₹{avgBill.toLocaleString()}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="5000"
                      step="50"
                      value={avgBill}
                      onChange={(e) => setAvgBill(Number(e.target.value))}
                      className="w-full accent-[#6C4DFF] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-[#71717a] mt-1">
                      <span>₹100</span>
                      <span>₹2,500</span>
                      <span>₹5,000</span>
                    </div>
                  </div>
                </div>

                {/* Calculation Output Card */}
                <div className="rounded-2xl border border-[#6C4DFF]/30 bg-[#6C4DFF]/10 p-6 text-center space-y-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa]">
                      Estimated Monthly Recovered Revenue
                    </p>
                    <p className="text-4xl sm:text-5xl font-black text-white brand-gradient-text my-2 tabular-nums">
                      ₹{calculatedRevenue.recoveredMonthly.toLocaleString()}
                    </p>
                    <p className="text-xs text-[#a1a1aa]">
                      From <strong className="text-white">~{calculatedRevenue.recoveredCustomers}</strong> recovered at-risk regulars/mo
                    </p>
                  </div>

                  <div className="border-t border-white/[0.08] pt-4">
                    <p className="text-xs text-[#667085]">
                      Annual Revenue Boost:{" "}
                      <strong className="text-[#16A34A] text-sm tabular-nums">
                        +₹{calculatedRevenue.recoveredYearly.toLocaleString()} / year
                      </strong>
                    </p>
                  </div>

                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center justify-center gap-2 w-full rounded-xl brand-gradient py-3 text-xs font-bold text-white shadow-lg shadow-[#6C4DFF]/25 hover:opacity-95 transition-all btn-interactive"
                  >
                    <span>Start Free & Claim This Revenue</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features Section (Keyword-Rich Cards) ── */}
        <section id="features" className="py-20 md:py-28 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
                Everything You Need to{" "}
                <span className="brand-gradient-text">Retain High-Value Customers</span>
              </h2>
              <p className="text-[#a1a1aa] text-base sm:text-lg max-w-2xl mx-auto">
                Stop wasting budget on acquiring one-off visitors. Turn your existing traffic into loyal, high-frequency patrons.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <article
                    key={i}
                    className="brand-card p-8 transition-all duration-300 brand-card-hover"
                  >
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} text-white mb-5`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-[#a1a1aa] text-sm leading-relaxed">{feature.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── How It Works (Visual 3-Step Flow) ── */}
        <section id="how-it-works" className="py-20 md:py-28 relative border-t border-white/[0.08] overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] radial-glow pointer-events-none" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
                How <span className="brand-gradient-text">Revia</span> Works in 3 Simple Steps
              </h2>
              <p className="text-[#a1a1aa] text-base sm:text-lg max-w-2xl mx-auto">
                Zero complicated setup. Works seamlessly alongside any billing setup or cashier workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="relative text-center group">
                    {i < 2 && (
                      <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-[#6C4DFF]/50 to-transparent" />
                    )}
                    <div className="relative inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] mb-6 group-hover:border-[#6C4DFF]/50 transition-all duration-300">
                      <Icon className="h-8 w-8 text-[#6C4DFF]" />
                      <span className="absolute -top-2.5 -right-2.5 flex h-6 w-6 items-center justify-center rounded-full brand-gradient text-[10px] font-black text-white shadow-md">
                        {step.step}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-[#a1a1aa] text-xs sm:text-sm leading-relaxed max-w-xs mx-auto">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Industry Showcase Deep Dive ── */}
        <section id="industries" className="py-20 md:py-28 border-t border-white/[0.08]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
                Engineered for <span className="brand-gradient-text">Your Specific Business Type</span>
              </h2>
              <p className="text-[#a1a1aa] text-sm sm:text-base max-w-2xl mx-auto">
                Every industry has unique visit rhythms. Revia provides dedicated presets and logic tailored to your exact business.
              </p>
            </div>

            {/* Industry Selector Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {Object.entries(industryData).map(([key, ind]) => {
                const Icon = ind.icon;
                const isSelected = selectedIndustry === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedIndustry(key as any)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 btn-interactive ${
                      isSelected
                        ? "brand-gradient text-white shadow-lg shadow-[#6C4DFF]/25"
                        : "border border-white/[0.08] bg-white/[0.02] text-[#a1a1aa] hover:border-[#6C4DFF]/30 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{ind.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Industry Panel */}
            <div className="brand-card p-8 md:p-12 animate-fade-in border border-white/[0.1]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#6C4DFF]/30 bg-[#6C4DFF]/10 px-3 py-1 text-xs font-semibold text-[#a855f7] mb-4">
                    {(() => {
                      const Icon = activeInd.icon;
                      return <Icon className="h-3.5 w-3.5" />;
                    })()}
                    {activeInd.label}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">
                    {activeInd.tagline}
                  </h3>
                  <p className="text-[#a1a1aa] text-sm leading-relaxed mb-6">
                    {activeInd.description}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <span className="text-2xl sm:text-3xl font-black brand-gradient-text tabular-nums">
                      {activeInd.metric}
                    </span>
                    <span className="text-xs text-[#667085] italic">
                      {activeInd.caseStudy}
                    </span>
                  </div>
                </div>

                {/* Interactive Simulated Alert Box */}
                <div className="rounded-2xl border border-white/[0.08] bg-[#0b141a] p-6 space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-white/[0.06]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#6C4DFF] to-[#3B82F6] text-white text-sm font-bold">
                      RD
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Rahul Deshmukh</p>
                      <p className="text-[11px] text-[#71717a]">Regular customer • Last visit 16 days ago</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 p-3">
                    <p className="text-xs text-[#F59E0B] font-semibold flex items-center gap-1.5">
                      ⚠️ At-Risk Alert: Usually visits every 5 days
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#25D366]/30 bg-[#005c4b] p-3 text-white">
                    <p className="text-xs font-medium leading-relaxed">
                      📱 1-Click WhatsApp: &ldquo;Hi Rahul! We noticed you haven&apos;t visited in a while. Enjoy 15% OFF your next order this weekend!&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ Section (Google PAA / Rich Snippets) ── */}
        <section id="faq" className="py-20 md:py-28 border-t border-white/[0.08] bg-white/[0.01]">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
                Frequently Asked <span className="brand-gradient-text">Questions</span>
              </h2>
              <p className="text-[#a1a1aa] text-sm sm:text-base">
                Everything you need to know about getting started with Revia.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="brand-card border border-white/[0.08] overflow-hidden transition-all duration-200"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-bold text-white focus:outline-none"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-[#a1a1aa] transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-[#6C4DFF]" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-xs sm:text-sm text-[#a1a1aa] leading-relaxed border-t border-white/[0.04] pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Bottom Call To Action ── */}
        <section className="py-20 md:py-28 border-t border-white/[0.08]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl border border-white/[0.1] bg-white/[0.02] p-12 md:p-16 text-center overflow-hidden shadow-2xl">
              <div className="absolute inset-0 radial-glow pointer-events-none" />
              <div className="relative max-w-2xl mx-auto space-y-6">
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                  Ready to Stop Losing Your Best Customers?
                </h2>
                <p className="text-[#a1a1aa] text-base sm:text-lg">
                  Join 2,500+ restaurants, cafes, salons, and local stores using Revia. Set up in 2 minutes.
                </p>
                <div className="pt-2">
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center gap-2 rounded-xl brand-gradient px-8 py-4 text-sm font-bold text-white shadow-xl shadow-[#6C4DFF]/25 hover:opacity-95 transition-all btn-interactive"
                  >
                    <span>Start Your 14-Day Free Trial</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Semantic Footer ── */}
      <footer className="border-t border-white/[0.08] py-10 bg-[#09090b]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg brand-gradient text-white">
                <Zap className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-black text-white">Revia</span>
              <span className="text-xs text-[#71717a] ml-2">
                • AI Customer Retention Engine
              </span>
            </div>

            <div className="flex items-center gap-6 text-xs text-[#a1a1aa]">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#calculator" className="hover:text-white transition-colors">ROI Calculator</a>
              <a href="#industries" className="hover:text-white transition-colors">Industries</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
              <Link href="/auth/login" className="hover:text-white transition-colors">Sign In</Link>
            </div>

            <p className="text-xs text-[#667085]">
              © {new Date().getFullYear()} Revia. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
