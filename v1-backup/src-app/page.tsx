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
  BarChart3,
  Star,
  Brain,
  Send,
  Eye,
} from "lucide-react";

export default function LandingPage() {
  const [selectedIndustry, setSelectedIndustry] = useState<
    "restaurant" | "cafe" | "salon_spa" | "gym" | "retail" | "clinic"
  >("restaurant");

  const industryData = {
    restaurant: {
      label: "Restaurants",
      icon: UtensilsCrossed,
      tagline: "Turn weekend diners into weekly regulars",
      metric: "+32% Repeat Rate",
    },
    cafe: {
      label: "Cafés",
      icon: Coffee,
      tagline: "Never let morning regulars disappear",
      metric: "4.8x Weekly Frequency",
    },
    salon_spa: {
      label: "Salons & Spas",
      icon: Scissors,
      tagline: "Automate appointment re-engagement",
      metric: "₹45K+ Recovered Monthly",
    },
    gym: {
      label: "Gyms & Studios",
      icon: Dumbbell,
      tagline: "Stop membership drop-outs before they quit",
      metric: "74% Drop-out Prevention",
    },
    retail: {
      label: "Retail & Boutique",
      icon: ShoppingBag,
      tagline: "Bring shoppers back for new arrivals",
      metric: "3.2x Customer LTV",
    },
    clinic: {
      label: "Clinics & Wellness",
      icon: Stethoscope,
      tagline: "Gentle follow-up reminders for checkups",
      metric: "91% Follow-up Rate",
    },
  };

  const activeInd = industryData[selectedIndustry];

  const features = [
    {
      icon: Brain,
      title: "AI Retention Intelligence",
      description: "Daily smart alerts on at-risk customers, VIPs, and win-back opportunities.",
      color: "from-violet-500 to-purple-600",
    },
    {
      icon: MessageCircle,
      title: "1-Click WhatsApp Campaigns",
      description: "Send personalized return offers directly to customer phones.",
      color: "from-emerald-500 to-green-600",
    },
    {
      icon: Users,
      title: "Smart Customer Profiles",
      description: "Automatic visit tracking, spend analytics, and segment scoring.",
      color: "from-blue-500 to-cyan-600",
    },
    {
      icon: BarChart3,
      title: "Retention Analytics",
      description: "Revenue impact, churn predictions, and campaign ROI tracking.",
      color: "from-orange-500 to-amber-600",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Add Customers",
      description: "Enter phone numbers at checkout or import your existing list.",
      icon: Users,
    },
    {
      step: "02",
      title: "Track Visits",
      description: "Log visits and spending. AI learns each customer's rhythm.",
      icon: Eye,
    },
    {
      step: "03",
      title: "Send Offers",
      description: "One-tap WhatsApp messages bring them back with personalized deals.",
      icon: Send,
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] overflow-hidden">
      {/* Navigation */}
      <header className="fixed top-0 z-50 border-b border-[#27272a] bg-[#09090b]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient text-white shadow-lg shadow-purple-500/20">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-tight brand-gradient-text">Revia</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">How It Works</a>
            <a href="#industries" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Industries</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-semibold text-[#a1a1aa] hover:text-white transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/auth/login"
              className="flex items-center gap-2 rounded-xl brand-gradient px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:opacity-95 transition-all"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 grid-bg opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] radial-glow"></div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto stagger">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#3f3f46] bg-[#18181b] px-4 py-1.5 text-xs font-semibold text-[#a1a1aa] mb-8">
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span>AI-Powered Customer Retention</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6">
              Stop Losing Customers.{" "}
              <span className="brand-gradient-text">
                Start Keeping Them.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-[#a1a1aa] max-w-2xl mx-auto mb-10 leading-relaxed">
              Revia tracks every customer's visit rhythm and sends personalized WhatsApp offers 
              exactly when they're about to forget you.{" "}
              <span className="text-white font-semibold">Never lose a regular again.</span>
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/login"
                className="flex items-center gap-2 rounded-xl brand-gradient px-8 py-4 text-sm font-bold text-white shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:opacity-95 transition-all w-full sm:w-auto justify-center"
              >
                Start 14-Day Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="flex items-center gap-2 text-sm text-[#71717a]">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                No credit card required
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 mt-12 text-xs text-[#52525b]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                <span>SOC 2 Compliant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-500" />
                <span>4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-purple-400" />
                <span>2-min Setup</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              Everything You Need to{" "}
              <span className="brand-gradient-text">Keep Customers</span>
            </h2>
            <p className="text-[#a1a1aa] text-lg max-w-2xl mx-auto">
              From tracking visits to sending winning-back offers — all in one dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="group rounded-2xl border border-[#27272a] bg-[#18181b] p-8 transition-all duration-300 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/5"
                >
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} text-white mb-5`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-[#a1a1aa] text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-28 relative border-t border-[#27272a] overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] radial-glow"></div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              How <span className="brand-gradient-text">Revia</span> Works
            </h2>
            <p className="text-[#a1a1aa] text-lg max-w-2xl mx-auto">
              Three simple steps to start retaining more customers today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative text-center group">
                  {i < 2 && (
                    <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-purple-500/50 to-transparent"></div>
                  )}
                  <div className="relative inline-flex h-24 w-24 items-center justify-center rounded-2xl border border-[#27272a] bg-[#18181b] mb-6 group-hover:border-purple-500/30 transition-all duration-300">
                    <Icon className="h-10 w-10 text-purple-400" />
                    <span className="absolute -top-3 -right-3 flex h-7 w-7 items-center justify-center rounded-full brand-gradient text-[10px] font-black text-white">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-[#a1a1aa] text-sm leading-relaxed max-w-xs mx-auto">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Industry Showcase */}
      <section id="industries" className="py-20 md:py-28 border-t border-[#27272a]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              Built for <span className="brand-gradient-text">Your Industry</span>
            </h2>
          </div>

          {/* Industry tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {Object.entries(industryData).map(([key, ind]) => {
              const Icon = ind.icon;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedIndustry(key as any)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    selectedIndustry === key
                      ? "brand-gradient text-white shadow-lg shadow-purple-500/25"
                      : "border border-[#27272a] bg-[#18181b] text-[#a1a1aa] hover:border-purple-500/30 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{ind.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active industry preview */}
          <div className="rounded-2xl border border-[#27272a] bg-[#18181b] p-8 md:p-12 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400 mb-4">
                  {(() => { const Icon = activeInd.icon; return <Icon className="h-3.5 w-3.5" />; })()}
                  {activeInd.label}
                </div>
                <h3 className="text-2xl sm:text-3xl font-black mb-3">{activeInd.tagline}</h3>
                <p className="text-[#a1a1aa] mb-6">Revia monitors each customer's visit pattern and sends the perfect WhatsApp offer right before they forget you.</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black brand-gradient-text">{activeInd.metric}</span>
                </div>
              </div>
              <div className="rounded-xl border border-[#27272a] bg-[#09090b] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-600 text-white text-sm font-bold">
                    RD
                  </div>
                  <div>
                    <p className="text-sm font-bold">Rahul Deshmukh</p>
                    <p className="text-xs text-[#71717a]">Regular customer • Last visit 16 days ago</p>
                  </div>
                </div>
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 mb-3">
                  <p className="text-xs text-amber-400 font-semibold">⚠️ At Risk — Usually visits every 5 days</p>
                </div>
                <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-3">
                  <p className="text-xs text-purple-400 font-semibold">📱 Suggested: Send 15% Weekend Chef Special Offer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 border-t border-[#27272a]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl border border-[#27272a] bg-[#18181b] p-12 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 radial-glow"></div>
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
                Ready to Stop Losing Customers?
              </h2>
              <p className="text-[#a1a1aa] text-lg max-w-xl mx-auto mb-8">
                Join 2,500+ businesses using Revia to bring customers back. Start your free trial today.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 rounded-xl brand-gradient px-8 py-4 text-sm font-bold text-white shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:opacity-95 transition-all"
              >
                Start 14-Day Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#27272a] py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg brand-gradient text-white">
                <Zap className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-black">Revia</span>
            </div>
            <p className="text-xs text-[#52525b]">
              © {new Date().getFullYear()} Revia. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
