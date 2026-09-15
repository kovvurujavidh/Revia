// Importers/Callers: Next.js App Router route /settings, Header settings link, Sidebar settings navigation.
// Affected API: Workspace configuration, profile editing, staff permissions, data exports.
// Data Schemas: Business, StaffMember, Customer, User from src/lib/types.ts.
// User's Verbatim Instruction: "WHEN THE OWNER ADD ANY STAFF WITH SPECIFIC MOBILE NUMBER IN HOME PAGE ADD BUTTON STAFF BY USING THE SAME NUMBER CONNECT THE OWNER AND STAFF TOGETHER THIS IS MORE RELIABLE IDEA"

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import {
  Settings,
  Building2,
  Users,
  MessageCircle,
  Database,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Shield,
  Download,
  Lock,
  ArrowRight,
  Phone,
} from "lucide-react";

export default function SettingsPage() {
  const {
    activeBusiness,
    customers,
    visits,
    currentUser,
    staffMembers,
    addStaffMember,
    updateBusiness,
  } = useApp();

  // Business Profile Form State
  const [businessName, setBusinessName] = useState(activeBusiness.name);
  const [category, setCategory] = useState(activeBusiness.industry);
  const [phone, setPhone] = useState(activeBusiness.phone || "");
  const [currency, setCurrency] = useState(activeBusiness.currency || "INR");

  // WhatsApp Messaging Defaults State
  const [discountPercent, setDiscountPercent] = useState(
    activeBusiness.default_comeback_discount?.toString() || "15"
  );
  const [messageSignature, setMessageSignature] = useState(
    activeBusiness.whatsapp_signature || `Warm regards,\nTeam ${activeBusiness.name}`
  );

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffRole, setNewStaffRole] = useState<"manager" | "staff">("staff");

  // Save Feedback Toast
  const [savedToast, setSavedToast] = useState(false);
  const [dataToast, setDataToast] = useState<string | null>(null);

  // Staff Access Gate: Staff members only have access to Visit Data Entry
  if (currentUser.role === "staff") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 animate-fade-in">
        <div className="max-w-md w-full brand-card p-8 text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-purple-500/10 text-purple-400">
            <Lock className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black text-white">Staff Access Restricted</h1>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Store configuration, staff permissions, and workspace settings are managed exclusively by Business Owners.
            </p>
          </div>

          <div className="rounded-2xl bg-white/[0.03] p-4 text-left border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span>Current Role:</span>
              <span className="capitalize px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                {currentUser.role}
              </span>
            </div>
            <p className="text-[11px] text-[#a1a1aa]">
              Logged in as <strong>{currentUser.email || currentUser.full_name}</strong>
            </p>
          </div>

          <Link
            href="/add-visit"
            className="w-full flex items-center justify-center gap-2 rounded-xl brand-gradient text-white btn-interactive py-2.5 text-xs font-bold text-white shadow-none hover:opacity-95 transition-opacity"
          >
            <span>Go to Add Visit Entry</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusiness({
      name: businessName,
      industry: category as any,
      phone,
      currency,
      default_comeback_discount: parseInt(discountPercent, 10) || 15,
      whatsapp_signature: messageSignature,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim()) return;

    addStaffMember({
      name: newStaffName.trim(),
      email: newStaffEmail.trim().toLowerCase(),
      phone: "",
      role: newStaffRole,
      status: "active",
      business_id: activeBusiness.id,
    });

    setNewStaffName("");
    setNewStaffEmail("");
    setShowInviteModal(false);
    setDataToast(`Staff member added! They can sign up with ${newStaffEmail.trim()} and log in.`);
    setTimeout(() => setDataToast(null), 3500);
  };

  const handleExportData = () => {
    const data = {
      business: activeBusiness,
      customers,
      visits,
      staff: staffMembers,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeBusiness.name.replace(/\s+/g, "_")}_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDataToast("Full JSON data backup downloaded!");
    setTimeout(() => setDataToast(null), 3000);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "manager":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Toast Feedback */}
      {savedToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-xs font-bold text-white shadow-lg animate-fade-in">
          <CheckCircle2 className="h-4 w-4" />
          <span>Settings saved successfully!</span>
        </div>
      )}
      {dataToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-3 text-xs font-bold text-white shadow-lg animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{dataToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">Business Settings</h1>
            <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-bold text-purple-400 flex items-center gap-1">
              <Settings className="h-3.5 w-3.5" /> Workspace Config
            </span>
          </div>
          <p className="text-xs text-[#a1a1aa] mt-1">
            Manage your store profile, staff permissions, WhatsApp messaging defaults, and data backups.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1: Business Profile */}
        <div className="brand-card p-6 sm:p-8">
          <div className="flex items-center gap-3 border-b border-white/[0.08] pb-4 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Store Profile</h2>
              <p className="text-xs text-[#a1a1aa]">
                General business information and operational category
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-xs font-medium text-white focus:bg-white/[0.03] focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Industry Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-xs font-medium text-white focus:bg-white/[0.03] focus:border-purple-500 focus:outline-none"
                >
                  <option className="bg-[#18181b] text-white" value="restaurant">Restaurant &amp; Fine Dining</option>
                  <option className="bg-[#18181b] text-white" value="cafe">Café &amp; Bakery</option>
                  <option className="bg-[#18181b] text-white" value="salon_spa">Salon, Spa &amp; Beauty</option>
                  <option className="bg-[#18181b] text-white" value="gym">Gym &amp; Fitness Studio</option>
                  <option className="bg-[#18181b] text-white" value="retail">Retail Boutique &amp; Store</option>
                  <option className="bg-[#18181b] text-white" value="clinic">Clinic &amp; Health Wellness</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Owner WhatsApp / Phone Number *
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98201 11111"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-xs font-medium text-white focus:bg-white/[0.03] focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Currency Symbol
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-xs font-medium text-white focus:bg-white/[0.03] focus:border-purple-500 focus:outline-none"
                >
                  <option className="bg-[#18181b] text-white" value="INR">₹ (INR - Indian Rupee)</option>
                  <option className="bg-[#18181b] text-white" value="USD">$ (USD - US Dollar)</option>
                  <option className="bg-[#18181b] text-white" value="EUR">€ (EUR - Euro)</option>
                  <option className="bg-[#18181b] text-white" value="GBP">£ (GBP - British Pound)</option>
                  <option className="bg-[#18181b] text-white" value="AED">AED (UAE Dirham)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl brand-gradient text-white btn-interactive px-5 py-2.5 text-xs font-bold text-white shadow-none hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: Staff & Roles */}
        <div className="brand-card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Staff &amp; Permissions</h2>
                <p className="text-xs text-[#a1a1aa]">
                  Add staff by phone number so they can log in via OTP to record customer visits
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-xs font-bold text-white hover:bg-gray-50 transition-colors shadow-none cursor-pointer"
            >
              <Plus className="h-4 w-4 text-purple-400" />
              <span>Add Staff Member</span>
            </button>
          </div>

          <div className="divide-y divide-[#E8E8ED] rounded-xl border border-white/[0.08] overflow-hidden">
            {/* Account Owner Row */}
            <div className="flex items-center justify-between p-3.5 bg-white/[0.03]">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 font-bold text-xs">
                  {activeBusiness.owner_name ? activeBusiness.owner_name.charAt(0) : "O"}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{activeBusiness.owner_name} (Owner)</p>
                  <p className="text-[11px] text-[#a1a1aa]">{activeBusiness.phone || activeBusiness.owner_email}</p>
                </div>
              </div>
              <span className="rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-400 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                Owner
              </span>
            </div>

            {/* Registered Staff Rows */}
            {staffMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3.5 bg-white/[0.03] hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.03] text-white font-bold text-xs border border-white/[0.08]">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{member.name}</p>
                    <p className="text-[11px] text-[#a1a1aa] flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{member.phone}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getRoleBadge(
                      member.role
                    )}`}
                  >
                    {member.role === "manager" ? "Manager" : "Staff (Entry)"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Invite Modal */}
          {showInviteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
              <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <h3 className="text-sm font-bold text-white">Add New Staff Member</h3>
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="text-xs font-bold text-[#a1a1aa] hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddStaff} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Patel"
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Email Address (For Login) *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="staff@business.com"
                      value={newStaffEmail}
                      onChange={(e) => setNewStaffEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-purple-500"
                    />
                    <p className="text-[10px] text-[#a1a1aa] mt-1">
                      Staff signs up with this email and a password, then logs in.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Role Permission *
                    </label>
                    <select
                      value={newStaffRole}
                      onChange={(e) => setNewStaffRole(e.target.value as any)}
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-purple-500"
                    >
                      <option className="bg-[#18181b] text-white" value="staff">Staff / Cashier (Visit Data Entry Only)</option>
                      <option className="bg-[#18181b] text-white" value="manager">Manager (Visits + WhatsApp Messages)</option>
                    </select>
                  </div>

                  <div className="pt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowInviteModal(false)}
                      className="flex-1 rounded-xl border border-white/[0.08] py-2 text-xs font-bold text-[#a1a1aa] hover:bg-white/[0.03] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-xl brand-gradient text-white btn-interactive py-2 text-xs font-bold text-white shadow-xs hover:opacity-90 cursor-pointer"
                    >
                      Save &amp; Link Staff
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: WhatsApp Messaging Defaults */}
        <div className="brand-card p-6 sm:p-8">
          <div className="flex items-center gap-3 border-b border-white/[0.08] pb-4 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#25D366]/10 text-[#25D366]">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">WhatsApp Messaging Preferences</h2>
              <p className="text-xs text-[#a1a1aa]">
                Configure default win-back incentives and brand signatures
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white mb-1.5">
                Default Win-Back Comeback Discount (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="w-32 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-xs font-bold text-white focus:bg-white/[0.03] focus:border-purple-500 focus:outline-none"
                />
                <span className="text-xs text-[#a1a1aa]">
                  Applied automatically in win-back template generator ({discountPercent}% OFF)
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white mb-1.5">
                Standard WhatsApp Message Footer / Signature
              </label>
              <textarea
                rows={3}
                value={messageSignature}
                onChange={(e) => setMessageSignature(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5 text-xs font-medium text-white focus:bg-white/[0.03] focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Data Management & Backups */}
        <div className="brand-card p-6 sm:p-8">
          <div className="flex items-center gap-3 border-b border-white/[0.08] pb-4 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Data Management &amp; Portability</h2>
              <p className="text-xs text-[#a1a1aa]">
                Export complete customer records as JSON backup
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExportData}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-xs font-bold text-white hover:bg-gray-50 transition-colors shadow-none cursor-pointer flex-1"
            >
              <Download className="h-4 w-4 text-purple-400" />
              <span>Download Full JSON Backup</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}