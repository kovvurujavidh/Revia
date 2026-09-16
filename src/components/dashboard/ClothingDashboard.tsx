// Importers/Callers: src/app/dashboard/page.tsx
// Affected API: ClothingDashboard React component for clothing & fashion retail boutique tenants (Spending analytics, top customers leaderboard, customer segments, WhatsApp collection broadcast)
// Data Schemas: Business, Customer, Visit, Opportunity from src/lib/types.ts
// User's Verbatim Instruction: "c:\AI\Revia_Final_All_Three_Business_Updates_Claude_Code_Prompt.docx now this make todo and complete updaate"

"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import {
  ShoppingBag,
  Users,
  TrendingUp,
  Crown,
  Sparkles,
  MessageCircle,
  PlusCircle,
  Search,
  ArrowRight,
  Send,
  Calendar,
  DollarSign,
  Tag,
  Clock,
  X,
  Flame,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { buildWhatsAppLink } from "@/lib/intelligence";

export function ClothingDashboard() {
  const { activeBusiness, customers, visits, addCustomer, addVisit, logWhatsAppSend } = useApp();

  const [timeRange, setTimeRange] = useState<"today" | "week" | "month" | "year">("month");
  const [selectedSegment, setSelectedSegment] = useState<"all" | "high_value" | "regular" | "low_value" | "inactive">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isLogPurchaseModalOpen, setIsLogPurchaseModalOpen] = useState(false);
  const [selectedCustomerForPurchase, setSelectedCustomerForPurchase] = useState<any | null>(null);

  // Quick Purchase Form State
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [purchaseItems, setPurchaseItems] = useState("");
  const [purchaseBillRef, setPurchaseBillRef] = useState("");
  const [isSubmittingPurchase, setIsSubmittingPurchase] = useState(false);

  // Quick Customer Form State
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustPref, setNewCustPref] = useState("Ethnic Wear, Sarees");
  const [newCustNotes, setNewCustNotes] = useState("");

  const currencySymbol = activeBusiness?.currency_symbol || "₹";

  // Calculate Dates
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // Filter Visits based on TimeRange
  const filteredVisitsByRange = useMemo(() => {
    return visits.filter((v) => {
      const vDate = new Date(v.date || v.created_at);
      if (timeRange === "today") {
        return (v.date || v.created_at).split("T")[0] === todayStr;
      }
      if (timeRange === "week") {
        return vDate >= startOfWeek;
      }
      if (timeRange === "month") {
        return vDate >= startOfMonth;
      }
      if (timeRange === "year") {
        return vDate >= startOfYear;
      }
      return true;
    });
  }, [visits, timeRange, todayStr]);

  // Spending analytics
  const totalRevenue = filteredVisitsByRange.reduce((acc, v) => acc + (v.amount || 0), 0);
  const totalOrders = filteredVisitsByRange.length;
  const avgBasketValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Segmenting Customers
  const enrichedCustomers = useMemo(() => {
    return customers.map((c) => {
      const cVisits = visits.filter(
        (v) => v.customer_id === c.id || (v.customer_phone && v.customer_phone === c.phone)
      );

      const totalSpent = cVisits.reduce((acc, v) => acc + (v.amount || 0), 0) || c.total_spend || 0;
      const orderCount = cVisits.length || c.total_visits || 1;
      const avgBill = orderCount > 0 ? Math.round(totalSpent / orderCount) : c.avg_bill || 0;

      const lastVisitDate = c.last_visit_date ? new Date(c.last_visit_date) : new Date(c.created_at);
      const daysSinceLastVisit = Math.round((now.getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24));

      let segmentType: "high_value" | "regular" | "low_value" | "inactive" = "regular";
      if (daysSinceLastVisit > 45) {
        segmentType = "inactive";
      } else if (totalSpent >= 10000 || avgBill >= 3500) {
        segmentType = "high_value";
      } else if (orderCount >= 3) {
        segmentType = "regular";
      } else {
        segmentType = "low_value";
      }

      return {
        ...c,
        totalSpent,
        orderCount,
        avgBill,
        daysSinceLastVisit,
        segmentType,
      };
    });
  }, [customers, visits, now]);

  // Counts
  const highValueCount = enrichedCustomers.filter((c) => c.segmentType === "high_value").length;
  const regularCount = enrichedCustomers.filter((c) => c.segmentType === "regular").length;
  const lowValueCount = enrichedCustomers.filter((c) => c.segmentType === "low_value").length;
  const inactiveCount = enrichedCustomers.filter((c) => c.segmentType === "inactive").length;

  // Top Customers Leaderboard
  const topCustomers = useMemo(() => {
    return [...enrichedCustomers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);
  }, [enrichedCustomers]);

  // Filtered customer list
  const filteredCustomerList = useMemo(() => {
    return enrichedCustomers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        (c.favorite_items && c.favorite_items.join(" ").toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;
      if (selectedSegment === "all") return true;
      return c.segmentType === selectedSegment;
    });
  }, [enrichedCustomers, searchTerm, selectedSegment]);

  const handleAddCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) return;

    await addCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      business_id: activeBusiness.id,
      is_anonymous: false,
      segment: "new",
      total_visits: 0,
      total_spend: 0,
      avg_bill: 0,
      avg_visit_interval_days: 30,
      first_visit_date: new Date().toISOString(),
      last_visit_date: new Date().toISOString(),
      tags: ["clothing_shopper"],
      favorite_items: newCustPref.split(",").map((s) => s.trim()).filter(Boolean),
      notes: newCustNotes.trim(),
    });

    setIsAddCustomerModalOpen(false);
    setNewCustName("");
    setNewCustPhone("");
    setNewCustNotes("");
  };

  const handleLogPurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerForPurchase || !purchaseAmount) return;

    setIsSubmittingPurchase(true);
    const amountNum = Number(purchaseAmount) || 0;
    const itemList = purchaseItems.split(",").map((s) => s.trim()).filter(Boolean);

    await addVisit({
      customer_id: selectedCustomerForPurchase.id,
      customer_name: selectedCustomerForPurchase.name,
      customer_phone: selectedCustomerForPurchase.phone,
      amount: amountNum,
      is_anonymous: false,
      items: itemList.length > 0 ? itemList : ["Boutique Collection Purchase"],
      notes: purchaseBillRef ? `Bill Ref: ${purchaseBillRef}` : undefined,
      date: new Date().toISOString(),
    });

    const { updateCustomer } = await import("@/lib/store").then((m) => ({ updateCustomer: m.AppStore.getInstance().updateCustomer.bind(m.AppStore.getInstance()) }));
    await updateCustomer({
      ...selectedCustomerForPurchase,
      total_visits: (selectedCustomerForPurchase.total_visits || 0) + 1,
      total_spend: (selectedCustomerForPurchase.total_spend || 0) + amountNum,
      last_visit_date: new Date().toISOString(),
      favorite_items: Array.from(new Set([...(selectedCustomerForPurchase.favorite_items || []), ...itemList])),
    });

    setIsSubmittingPurchase(false);
    setIsLogPurchaseModalOpen(false);
    setSelectedCustomerForPurchase(null);
    setPurchaseAmount("");
    setPurchaseItems("");
    setPurchaseBillRef("");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#111439] to-[#3B185F] text-white p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold text-[10px] tracking-wide uppercase border border-pink-500/30 flex items-center gap-1">
              <ShoppingBag className="h-3 w-3" /> Clothing &amp; Fashion Boutique CRM
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">{activeBusiness.name}</h1>
          <p className="text-xs text-slate-300">
            Customer spending analytics, VIP shopper leaderboards, and 1-click collection broadcasts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAddCustomerModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6C4DFF] hover:bg-[#5835FF] text-white text-xs font-bold shadow-lg shadow-purple-500/20 transition-all cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Shopper</span>
          </button>
          <Link
            href="/marketing"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-lg shadow-pink-500/20 transition-all"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Collection Broadcast</span>
          </Link>
        </div>
      </div>

      {/* Spending Analytics & Time Range Selector */}
      <div className="rounded-3xl border border-[#EAECF0] bg-[#FFFFFF] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAECF0] pb-4">
          <div>
            <h2 className="text-base font-bold text-[#111439]">Boutique Sales &amp; Basket Value</h2>
            <p className="text-xs text-[#667085]">Track shopper purchases across customized time periods.</p>
          </div>

          <div className="flex items-center gap-1 bg-[#F8F8F9] p-1 rounded-xl border border-[#EAECF0]">
            {(["today", "week", "month", "year"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  timeRange === range
                    ? "bg-[#6C4DFF] text-white shadow-xs"
                    : "text-[#667085] hover:text-[#111439]"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Analytics KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-[#F8F8F9] p-4 border border-[#EAECF0]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">
              Sales Revenue ({timeRange})
            </span>
            <p className="text-2xl font-black text-[#111439] mt-1">
              {currencySymbol}{totalRevenue.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">From {totalOrders} shopping visits</p>
          </div>

          <div className="rounded-2xl bg-[#F8F8F9] p-4 border border-[#EAECF0]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">Total Bills Logged</span>
            <p className="text-2xl font-black text-[#111439] mt-1">{totalOrders}</p>
            <p className="text-[11px] text-[#667085] mt-0.5">Completed checkout transactions</p>
          </div>

          <div className="rounded-2xl bg-[#F8F8F9] p-4 border border-[#EAECF0]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">Average Basket Size</span>
            <p className="text-2xl font-black text-[#6C4DFF] mt-1">
              {currencySymbol}{avgBasketValue.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-[#667085] mt-0.5">Average spend per shopping visit</p>
          </div>
        </div>
      </div>

      {/* Top Shoppers Leaderboard & Customer Segments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top VIP Shoppers Leaderboard */}
        <div className="lg:col-span-1 rounded-3xl border border-[#EAECF0] bg-[#FFFFFF] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAECF0] pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Crown className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-[#111439]">Top Shoppers Leaderboard</h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085]">VIP Roster</span>
          </div>

          <div className="space-y-3">
            {topCustomers.map((cust, idx) => (
              <div
                key={cust.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F8F9] hover:bg-purple-50/50 border border-[#EAECF0] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                      idx === 0
                        ? "bg-amber-400 text-amber-950 shadow-xs"
                        : idx === 1
                        ? "bg-slate-300 text-slate-800"
                        : idx === 2
                        ? "bg-amber-700 text-white"
                        : "bg-[#EAECF0] text-[#667085]"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-[#111439]">{cust.name}</h4>
                    <p className="text-[10px] text-[#667085]">{cust.orderCount} visits · avg {currencySymbol}{cust.avgBill}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-black text-[#111439]">
                    {currencySymbol}{cust.totalSpent.toLocaleString("en-IN")}
                  </p>
                  <span className="inline-block px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                    VIP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Directory & Segment Hub */}
        <div className="lg:col-span-2 rounded-3xl border border-[#EAECF0] bg-[#FFFFFF] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAECF0] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#111439]">Shopper Segments &amp; 1-Click WhatsApp</h3>
              <p className="text-[11px] text-[#667085]">Send collection previews, festival discounts, and win-back offers.</p>
            </div>

            {/* Segment Tabs */}
            <div className="flex flex-wrap items-center gap-1 bg-[#F8F8F9] p-1 rounded-xl border border-[#EAECF0]">
              <button
                onClick={() => setSelectedSegment("all")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedSegment === "all" ? "bg-[#FFFFFF] text-[#111439] shadow-xs" : "text-[#667085]"
                }`}
              >
                All ({enrichedCustomers.length})
              </button>
              <button
                onClick={() => setSelectedSegment("high_value")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedSegment === "high_value" ? "bg-amber-500 text-white shadow-xs" : "text-amber-600 hover:bg-amber-50"
                }`}
              >
                High Value ({highValueCount})
              </button>
              <button
                onClick={() => setSelectedSegment("regular")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedSegment === "regular" ? "bg-purple-500 text-white shadow-xs" : "text-purple-600 hover:bg-purple-50"
                }`}
              >
                Regular ({regularCount})
              </button>
              <button
                onClick={() => setSelectedSegment("inactive")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedSegment === "inactive" ? "bg-rose-500 text-white shadow-xs" : "text-rose-600 hover:bg-rose-50"
                }`}
              >
                Inactive ({inactiveCount})
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search shoppers by name, phone, or style preference..."
              className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] pl-10 pr-4 py-2 text-xs text-[#111439] placeholder:text-[#94A3B8] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none transition-colors"
            />
          </div>

          {/* Shopper List */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {filteredCustomerList.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#667085]">
                No shoppers found in this segment.
              </div>
            ) : (
              filteredCustomerList.map((customer) => {
                const isInactive = customer.segmentType === "inactive";
                const isHighValue = customer.segmentType === "high_value";

                let whatsappMsg = `Hi ${customer.name}! ✨ Exciting news from ${activeBusiness.name}: Our brand new festive & seasonal clothing collections have just arrived! Visit us this week to explore the latest designs.`;
                if (isInactive) {
                  whatsappMsg = `Hi ${customer.name}! 👗 We miss seeing you at ${activeBusiness.name}! As a valued shopper, enjoy an exclusive 15% OFF on our new arrivals when you visit us this week!`;
                } else if (isHighValue) {
                  whatsappMsg = `Hi ${customer.name}! 🌟 As one of our most valued VIP shoppers, you're invited for an exclusive early preview of our newly launched designer collections at ${activeBusiness.name}. We look forward to welcoming you!`;
                }

                const whatsappLink = buildWhatsAppLink(customer.phone, whatsappMsg);

                return (
                  <div
                    key={customer.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#F8F8F9] hover:bg-white hover:border-[#6C4DFF]/30 border border-[#EAECF0] transition-all shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-[#111439]">{customer.name}</h4>
                        {isHighValue && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                            High Value
                          </span>
                        )}
                        {isInactive && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[9px] font-bold">
                            Inactive ({customer.daysSinceLastVisit}d)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#667085] mt-0.5">
                        {customer.phone} · Total Spent: <span className="font-bold text-[#111439]">{currencySymbol}{customer.totalSpent.toLocaleString("en-IN")}</span> ({customer.orderCount} purchases)
                      </p>
                      {customer.favorite_items && customer.favorite_items.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {customer.favorite_items.map((item, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded-md bg-white border border-[#EAECF0] text-[9px] font-medium text-[#667085]">
                              {item}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => {
                          setSelectedCustomerForPurchase(customer);
                          setIsLogPurchaseModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-purple-50 text-[#6C4DFF] border border-[#6C4DFF]/30 font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        + Log Bill
                      </button>

                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          logWhatsAppSend({
                            customer_id: customer.id,
                            customer_name: customer.name,
                            customer_phone: customer.phone,
                            template_name: isInactive ? "Clothing Inactive Win-back" : isHighValue ? "Clothing VIP Preview" : "Clothing New Arrivals",
                            message_sent: whatsappMsg,
                          });
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-emerald-600 text-white font-bold text-[11px] shadow-xs transition-colors"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>Send Offer</span>
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Log Purchase Modal */}
      {isLogPurchaseModalOpen && selectedCustomerForPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111439]/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[#EAECF0] bg-[#FFFFFF] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAECF0] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#111439]">Log Boutique Purchase</h3>
                <p className="text-[11px] text-[#667085]">{selectedCustomerForPurchase.name} ({selectedCustomerForPurchase.phone})</p>
              </div>
              <button
                onClick={() => setIsLogPurchaseModalOpen(false)}
                className="rounded-full p-1.5 text-[#667085] hover:bg-[#F1F1F4]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleLogPurchaseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5">
                  Bill / Purchase Amount ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  required
                  autoFocus
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  placeholder="e.g. 3500"
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2.5 text-xs font-bold text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5">
                  Purchased Items / Categories
                </label>
                <input
                  type="text"
                  value={purchaseItems}
                  onChange={(e) => setPurchaseItems(e.target.value)}
                  placeholder="e.g. Silk Kurti, Denim Jacket, Scarf"
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2.5 text-xs text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5">
                  Bill Reference / Receipt No. (Optional)
                </label>
                <input
                  type="text"
                  value={purchaseBillRef}
                  onChange={(e) => setPurchaseBillRef(e.target.value)}
                  placeholder="e.g. INV-2026-089"
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2.5 text-xs text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLogPurchaseModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#EAECF0] bg-[#F8F8F9] text-xs font-bold text-[#667085]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPurchase}
                  className="flex-1 py-2.5 rounded-xl brand-gradient text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingPurchase ? "Saving..." : "Save Purchase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Shopper Modal */}
      {isAddCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111439]/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[#EAECF0] bg-[#FFFFFF] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAECF0] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#111439]">Add Shopper Profile</h3>
                <p className="text-[11px] text-[#667085]">Capture shopper preferences for targeted collection alerts</p>
              </div>
              <button
                onClick={() => setIsAddCustomerModalOpen(false)}
                className="rounded-full p-1.5 text-[#667085] hover:bg-[#F1F1F4]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Ananya Sen"
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2 text-xs text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5">
                  Mobile Number (WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2 text-xs text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5">
                  Style Preferences / Category Tags
                </label>
                <input
                  type="text"
                  value={newCustPref}
                  onChange={(e) => setNewCustPref(e.target.value)}
                  placeholder="e.g. Ethnic, Sarees, Western, Party Wear"
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2 text-xs text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111439] uppercase tracking-wider mb-1.5">
                  Shopper Notes (Size, Preferred Fit)
                </label>
                <input
                  type="text"
                  value={newCustNotes}
                  onChange={(e) => setNewCustNotes(e.target.value)}
                  placeholder="e.g. Size M, prefers cotton fabrics"
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2 text-xs text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#EAECF0] bg-[#F8F8F9] text-xs font-bold text-[#667085]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl brand-gradient text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Shopper
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
