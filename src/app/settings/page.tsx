// Importers/Callers: Next.js App Router route /settings, Header settings link, Sidebar settings navigation.
// Affected API: Workspace configuration, profile editing, staff permissions, data exports.
// Data Schemas: Business, StaffMember, Customer, User from src/lib/types.ts.
// User's Verbatim Instruction: "AFTER LOGIN THE LEFT SIDE BAR IS GOOD NOT FIT FOR MOBILE OK SEE THE WHOLE DOT CHANGECONCEPTOR CODE PLESE CHECH MOBILE FRENDLY AND THE COLORS WE CHOOSE NOW AND REQUIREMETS DOC IS DIFFERENT KEEP ANIMATIONS ONLY CHANGE COLORS TO MACTH PRODUCTION LEVEL WEBSITE"

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
    deleteStaffMember,
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
  const [newStaffPhone, setNewStaffPhone] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffRole, setNewStaffRole] = useState<"manager" | "staff">("staff");
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Plan limit quotas
  const isTrial = activeBusiness.subscription_status === "trialing";
  const plan = activeBusiness.subscription_plan || "starter";
  const staffLimit = isTrial || plan === "starter" ? 1 : plan === "growth" ? 3 : 999;
  const managerLimit = isTrial || plan === "starter" ? 1 : plan === "growth" ? 2 : 999;

  const currentStaffCount = staffMembers.filter((s) => s.role === "staff").length;
  const currentManagerCount = staffMembers.filter((s) => s.role === "manager").length;

  // Save Feedback Toast
  const [savedToast, setSavedToast] = useState(false);
  const [dataToast, setDataToast] = useState<string | null>(null);

  // Staff Access Gate: Staff members only have access to Visit Data Entry
  if (currentUser.role === "staff") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 animate-fade-in">
        <div className="max-w-md w-full brand-card p-8 text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6C4DFF]/10 border border-[#6C4DFF]/20 text-[#6C4DFF]">
            <Lock className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black text-[#111439] tracking-tight">Staff Access Restricted</h1>
            <p className="text-xs text-[#667085] leading-relaxed">
              Store configuration, staff permissions, and workspace settings are managed exclusively by Business Owners.
            </p>
          </div>

          <div className="rounded-xl bg-[#F8F8F9] p-4 text-left border border-[#EAECF0] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#111439]">
              <span>Current Role:</span>
              <span className="capitalize px-2.5 py-0.5 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6] text-[10px] font-bold">
                {currentUser.role}
              </span>
            </div>
            <p className="text-[11px] text-[#667085]">
              Logged in as <strong className="text-[#111439]">{currentUser.email || currentUser.full_name}</strong>
            </p>
          </div>

          <Link
            href="/add-visit"
            className="w-full flex items-center justify-center gap-2 rounded-xl brand-gradient py-3 text-xs font-bold text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 hover:opacity-95 transition-all btn-interactive"
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

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffPhone.trim()) {
      setDataToast("Please enter both staff name and registered mobile phone number.");
      setTimeout(() => setDataToast(null), 3000);
      return;
    }

    if (newStaffRole === "staff" && currentStaffCount >= staffLimit) {
      setDataToast(`Plan Limit: ${isTrial ? "Free Trial" : plan} allows max ${staffLimit} staff member(s). Please upgrade to add more.`);
      setTimeout(() => setDataToast(null), 4000);
      return;
    }

    if (newStaffRole === "manager" && currentManagerCount >= managerLimit) {
      setDataToast(`Plan Limit: ${isTrial ? "Free Trial" : plan} allows max ${managerLimit} manager(s). Please upgrade to add more.`);
      setTimeout(() => setDataToast(null), 4000);
      return;
    }

    setIsAddingStaff(true);
    try {
      await addStaffMember({
        name: newStaffName.trim(),
        email: newStaffEmail.trim().toLowerCase() || `${newStaffPhone.replace(/[^0-9]/g, "")}@staff.revia.app`,
        phone: newStaffPhone.trim(),
        role: newStaffRole,
        status: "active",
        business_id: activeBusiness.id,
      });

      setNewStaffName("");
      setNewStaffEmail("");
      setNewStaffPhone("");
      setShowInviteModal(false);
      setDataToast(`Staff member linked! They can now log in via Staff Login with phone ${newStaffPhone.trim()}`);
      setTimeout(() => setDataToast(null), 3500);
    } catch (err: any) {
      setDataToast(err.message || "Failed to add staff member.");
      setTimeout(() => setDataToast(null), 4000);
    } finally {
      setIsAddingStaff(false);
    }
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from your team?`)) {
      setDeletingId(id);
      try {
        await deleteStaffMember(id);
        setDataToast(`Removed ${name} from your team.`);
        setTimeout(() => setDataToast(null), 3500);
      } catch (err: any) {
        setDataToast(err.message || "Failed to remove staff member.");
        setTimeout(() => setDataToast(null), 4000);
      } finally {
        setDeletingId(null);
      }
    }
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
        return "bg-[#6C4DFF]/10 text-[#6C4DFF] border border-[#6C4DFF]/20";
      case "manager":
        return "bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20";
      default:
        return "bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20";
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Toast Feedback */}
      {savedToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-3 text-xs font-bold text-white shadow-lg shadow-[#16A34A]/25 animate-fade-in">
          <CheckCircle2 className="h-4 w-4" />
          <span>Settings saved successfully!</span>
        </div>
      )}
      {dataToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-[#111439] px-4 py-3 text-xs font-bold text-white shadow-xl shadow-[#111439]/25 animate-fade-in border border-[#111439]/20">
          <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
          <span>{dataToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[#111439] tracking-tight">Business Settings</h1>
            <span className="rounded-full bg-[#6C4DFF]/10 border border-[#6C4DFF]/20 px-2.5 py-0.5 text-xs font-bold text-[#6C4DFF] flex items-center gap-1">
              <Settings className="h-3.5 w-3.5" /> Workspace Config
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#667085] mt-1 font-medium">
            Manage your store profile, staff permissions, WhatsApp messaging defaults, and data backups.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1: Business Profile */}
        <div className="brand-card p-6 sm:p-8">
          <div className="flex items-center gap-3 border-b border-[#EAECF0] pb-4 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6C4DFF]/10 border border-[#6C4DFF]/20 text-[#6C4DFF]">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111439] tracking-tight">Store Profile</h2>
              <p className="text-xs text-[#667085] font-medium">
                General business information and operational category
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#111439] mb-1.5 uppercase tracking-wider">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2.5 text-xs font-medium text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111439] mb-1.5 uppercase tracking-wider">
                  Industry Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2.5 text-xs font-medium text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none transition-colors"
                >
                  <option value="restaurant">Restaurant &amp; Fine Dining</option>
                  <option value="cafe">Café &amp; Bakery</option>
                  <option value="salon_spa">Salon, Spa &amp; Beauty</option>
                  <option value="gym">Gym &amp; Fitness Studio</option>
                  <option value="retail">Retail Boutique &amp; Store</option>
                  <option value="clinic">Clinic &amp; Health Wellness</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111439] mb-1.5 uppercase tracking-wider">
                  Owner WhatsApp / Phone Number *
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98201 11111"
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2.5 text-xs font-medium text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111439] mb-1.5 uppercase tracking-wider">
                  Currency Symbol
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2.5 text-xs font-medium text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none transition-colors"
                >
                  <option value="INR">₹ (INR - Indian Rupee)</option>
                  <option value="USD">$ (USD - US Dollar)</option>
                  <option value="EUR">€ (EUR - Euro)</option>
                  <option value="GBP">£ (GBP - British Pound)</option>
                  <option value="AED">AED (UAE Dirham)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl brand-gradient px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-500/20 hover:opacity-95 transition-all btn-interactive cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: Staff & Roles */}
        <div className="brand-card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAECF0] pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6]">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#111439] tracking-tight">Staff &amp; Permissions</h2>
                <p className="text-xs text-[#667085] font-medium">
                  Add staff by phone number so they can log in via Staff Login to record visits.
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="rounded-md bg-[#6C4DFF]/10 border border-[#6C4DFF]/20 px-2 py-0.5 text-[11px] font-bold text-[#6C4DFF]">
                    Staff: {currentStaffCount}/{staffLimit === 999 ? "∞" : staffLimit} {isTrial ? "(Trial Limit: 1)" : ""}
                  </span>
                  <span className="rounded-md bg-[#3B82F6]/10 border border-[#3B82F6]/20 px-2 py-0.5 text-[11px] font-bold text-[#3B82F6]">
                    Managers: {currentManagerCount}/{managerLimit === 999 ? "∞" : managerLimit} {isTrial ? "(Trial Limit: 1)" : ""}
                  </span>
                  {isTrial && (
                    <Link href="/profile" className="text-[11px] text-[#6C4DFF] font-bold hover:underline ml-1">
                      Upgrade for more team slots →
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2 text-xs font-bold text-[#111439] hover:bg-[#F1F1F4] hover:border-[#D0D5DD] transition-colors btn-interactive cursor-pointer"
            >
              <Plus className="h-4 w-4 text-[#6C4DFF]" />
              <span>Add Staff Member</span>
            </button>
          </div>

          <div className="divide-y divide-[#EAECF0] rounded-xl border border-[#EAECF0] overflow-hidden bg-[#FFFFFF]">
            {/* Account Owner Row */}
            <div className="flex items-center justify-between p-3.5 bg-[#F8F8F9]">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#6C4DFF]/10 border border-[#6C4DFF]/20 text-[#6C4DFF] font-bold text-xs">
                  {activeBusiness.owner_name ? activeBusiness.owner_name.charAt(0) : "O"}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#111439]">{activeBusiness.owner_name} (Owner)</p>
                  <p className="text-[11px] text-[#667085] tabular-nums">{activeBusiness.phone || activeBusiness.owner_email}</p>
                </div>
              </div>
              <span className="rounded-full border border-[#6C4DFF]/20 bg-[#6C4DFF]/10 text-[#6C4DFF] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                Owner
              </span>
            </div>

            {/* Registered Staff Rows */}
            {staffMembers.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#667085] bg-[#FFFFFF]">
                No staff or managers added yet. Click &ldquo;Add Staff Member&rdquo; above to invite team members.
              </div>
            ) : (
              staffMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3.5 bg-[#FFFFFF] hover:bg-[#F8F8F9] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F8F8F9] text-[#111439] font-bold text-xs border border-[#EAECF0]">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#111439]">{member.name}</p>
                      <p className="text-[11px] text-[#667085] flex items-center gap-1 tabular-nums">
                        <Phone className="h-3 w-3 text-[#6C4DFF]" />
                        <span>{member.phone || member.email}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getRoleBadge(
                        member.role
                      )}`}
                    >
                      {member.role === "manager" ? "Manager" : "Staff (Entry)"}
                    </span>

                    <button
                      type="button"
                      disabled={deletingId === member.id}
                      onClick={() => handleDeleteStaff(member.id, member.name)}
                      className="p-1.5 text-[#667085] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      title={`Remove ${member.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Invite Modal */}
          {showInviteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111439]/60 backdrop-blur-xs p-4 animate-fade-in">
              <div className="w-full max-w-md rounded-2xl border border-[#EAECF0] bg-[#FFFFFF] p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#EAECF0] pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#111439]">Add New Team Member</h3>
                    <p className="text-[11px] text-[#667085]">
                      Free Trial: max 1 Staff &amp; 1 Manager
                    </p>
                  </div>
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="text-xs font-bold text-[#667085] hover:text-[#111439] cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddStaff} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#111439] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Patel"
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                      className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3 py-2 text-xs font-medium text-[#111439] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6C4DFF] focus:bg-[#FFFFFF] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111439] mb-1 flex items-center gap-1">
                      <Phone className="h-3 w-3 text-[#6C4DFF]" />
                      <span>Registered Mobile Phone Number *</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210 or 9876543210"
                      value={newStaffPhone}
                      onChange={(e) => setNewStaffPhone(e.target.value)}
                      className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3 py-2 text-xs font-medium text-[#111439] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6C4DFF] focus:bg-[#FFFFFF] transition-colors"
                    />
                    <p className="text-[10px] text-[#667085] mt-1">
                      The staff member will use this mobile number &amp; name to log in via &ldquo;Login as Staff&rdquo;.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111439] mb-1">
                      Optional Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="staff@business.com"
                      value={newStaffEmail}
                      onChange={(e) => setNewStaffEmail(e.target.value)}
                      className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3 py-2 text-xs font-medium text-[#111439] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6C4DFF] focus:bg-[#FFFFFF] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111439] mb-1">
                      Role Permission *
                    </label>
                    <select
                      value={newStaffRole}
                      onChange={(e) => setNewStaffRole(e.target.value as any)}
                      className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3 py-2 text-xs font-medium text-[#111439] focus:outline-none focus:border-[#6C4DFF] focus:bg-[#FFFFFF] transition-colors"
                    >
                      <option value="staff">Staff / Cashier (Visit Data Entry Only)</option>
                      <option value="manager">Manager (Visits + WhatsApp Messages)</option>
                    </select>
                  </div>

                  <div className="pt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowInviteModal(false)}
                      className="flex-1 rounded-xl border border-[#EAECF0] py-2 text-xs font-bold text-[#667085] hover:bg-[#F8F8F9] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isAddingStaff}
                      className="flex-1 rounded-xl brand-gradient py-2 text-xs font-bold text-white shadow-md shadow-purple-500/20 hover:opacity-90 disabled:opacity-50 btn-interactive cursor-pointer"
                    >
                      {isAddingStaff ? "Saving & Linking..." : "Save & Link Staff"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: WhatsApp Messaging Defaults */}
        <div className="brand-card p-6 sm:p-8">
          <div className="flex items-center gap-3 border-b border-[#EAECF0] pb-4 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366]">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111439] tracking-tight">WhatsApp Messaging Preferences</h2>
              <p className="text-xs text-[#667085] font-medium">
                Configure default win-back incentives and brand signatures
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#111439] mb-1.5 uppercase tracking-wider">
                Default Win-Back Comeback Discount (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="w-32 rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-3.5 py-2.5 text-xs font-bold text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none tabular-nums transition-colors"
                />
                <span className="text-xs text-[#667085] font-medium">
                  Applied automatically in win-back template generator ({discountPercent}% OFF)
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111439] mb-1.5 uppercase tracking-wider">
                Standard WhatsApp Message Footer / Signature
              </label>
              <textarea
                rows={3}
                value={messageSignature}
                onChange={(e) => setMessageSignature(e.target.value)}
                className="w-full rounded-xl border border-[#EAECF0] bg-[#F8F8F9] p-3.5 text-xs font-medium text-[#111439] focus:bg-[#FFFFFF] focus:border-[#6C4DFF] focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Data Management & Backups */}
        <div className="brand-card p-6 sm:p-8">
          <div className="flex items-center gap-3 border-b border-[#EAECF0] pb-4 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444]">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111439] tracking-tight">Data Management &amp; Portability</h2>
              <p className="text-xs text-[#667085] font-medium">
                Export complete customer records as JSON backup
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExportData}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#EAECF0] bg-[#F8F8F9] px-4 py-3 text-xs font-bold text-[#111439] hover:bg-[#F1F1F4] hover:border-[#D0D5DD] transition-colors btn-interactive cursor-pointer flex-1"
            >
              <Download className="h-4 w-4 text-[#6C4DFF]" />
              <span>Download Full JSON Backup</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}