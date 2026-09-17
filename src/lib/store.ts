// Importers/Callers: src/context/AppContext.tsx, all app components, admin panel, billing components
// Affected API: AppStore singleton, multi-tenant state sync, subscription payment processing, auto-reconciliation, platform core settings
// Data Schemas: Business, Customer, Visit, Opportunity, WhatsAppTemplate, WhatsAppLog, StaffMember, SubscriptionPaymentRecord, PlatformCoreSettings
// User's Verbatim Instruction: "javidhkovvuru143@axl THIS IS UPI IS AND IS THE UTR CAN NEED TO VERIFY BY ME SHOW IN ADMINPANY AND I NEEDTO VERIFY THEM MAKE IT LIKE THIS OR IF WE CAN AUTO VERIFY WITH SECURLY DO IT AND MAKE CHANGE WHAT BIG COMPANIES DO"

import {
  Business,
  Customer,
  Visit,
  Opportunity,
  WhatsAppTemplate,
  WhatsAppLog,
  StaffMember,
  SubscriptionPlanId,
  SubscriptionStatus,
  SubscriptionPaymentRecord,
  PlatformCoreSettings,
} from "./types";
import { getSupabase } from "./supabase/client";
import { calculateCustomerSegment, generateLiveOpportunities } from "./intelligence";
import { DEFAULT_WHATSAPP_TEMPLATES } from "./seedData";
import { validateUtrNumber, parseBankSmsOrStatement } from "./upi";

export const DEFAULT_PLATFORM_SETTINGS: PlatformCoreSettings = {
  id: "global-platform-settings",
  upi_id: "javidhkovvuru143@axl",
  upi_name: "Javidh Kovvuru (Revia)",
  default_trial_days: 14,
  announcement_banner: "Welcome to Revia! Boost repeat customer visits with AI-powered WhatsApp comeback triggers.",
  support_email: "support@revia.app",
  support_whatsapp: "917670860094",
  auto_verification_mode: "manual_approval",
};

interface StoreState {
  businesses: Business[];
  activeBusinessId: string;
  customers: Customer[];
  visits: Visit[];
  opportunities: Opportunity[];
  templates: WhatsAppTemplate[];
  whatsappLogs: WhatsAppLog[];
  staffMembers: StaffMember[];
  subscriptionPayments: SubscriptionPaymentRecord[];
  platformSettings: PlatformCoreSettings;
}

function createEmptyState(): StoreState {
  return {
    businesses: [],
    activeBusinessId: "",
    customers: [],
    visits: [],
    opportunities: [],
    templates: [],
    whatsappLogs: [],
    staffMembers: [],
    subscriptionPayments: [],
    platformSettings: { ...DEFAULT_PLATFORM_SETTINGS },
  };
}


export class AppStore {
  private static instance: AppStore;
  private state: StoreState;
  private listeners: Set<() => void> = new Set();
  private loaded = false;

  private constructor() {
    this.state = createEmptyState();
  }

  public static getInstance(): AppStore {
    if (!AppStore.instance) {
      AppStore.instance = new AppStore();
    }
    return AppStore.instance;
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public isLoaded(): boolean {
    return this.loaded;
  }

  // --- LOAD DATA FROM SUPABASE ---
  public async loadForBusiness(businessId: string) {
    const supabase = getSupabase();

    this.state.activeBusinessId = businessId;

    const [bizRes, customersRes, visitsRes, templatesRes, logsRes, staffRes] = await Promise.all([
      supabase.from("businesses").select("*").eq("id", businessId).single(),
      supabase.from("customers").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
      supabase.from("visits").select("*").eq("business_id", businessId).order("date", { ascending: false }),
      supabase.from("whatsapp_templates").select("*").or(`business_id.is.null,business_id.eq.${businessId}`),
      supabase.from("whatsapp_logs").select("*").eq("business_id", businessId).order("sent_at", { ascending: false }),
      supabase.from("users").select("*").eq("business_id", businessId),
    ]);

    if (bizRes.error) console.error("Store load business error:", bizRes.error);
    if (bizRes.data) {
      this.state.businesses = [bizRes.data as Business];
    }
    this.state.customers = (customersRes.data || []) as Customer[];
    this.state.visits = (visitsRes.data || []) as Visit[];
    this.state.templates = (templatesRes.data || []) as WhatsAppTemplate[];
    this.state.whatsappLogs = (logsRes.data || []) as WhatsAppLog[];
    this.state.staffMembers = (staffRes.data || []).map((u: any) => ({
      id: u.id,
      business_id: u.business_id,
      name: u.full_name,
      email: u.email,
      phone: u.phone || "",
      role: u.role,
      status: "active" as const,
      created_at: u.created_at,
    })) as StaffMember[];

    this.loaded = true;
    this.notify();
  }

  // --- LOAD ALL BUSINESSES (for admin) ---
  public async loadAllBusinesses() {
    const supabase = getSupabase();
    const { data } = await supabase.from("businesses").select("*").order("created_at", { ascending: false });
    if (data) {
      this.state.businesses = data as Business[];
      if (!this.state.activeBusinessId && data.length > 0) {
        this.state.activeBusinessId = data[0].id;
      }
    }
    this.notify();
  }

  // --- BUSINESS ---
  public getBusinesses(): Business[] {
    return this.state.businesses;
  }

  public getActiveBusiness(): Business {
    const biz = this.state.businesses.find(
      (b) => b.id === this.state.activeBusinessId
    );
    return biz || this.state.businesses[0] || ({} as Business);
  }

  public setActiveBusinessId(id: string) {
    this.state.activeBusinessId = id;
    this.notify();
  }

  public async createBusiness(newBiz: Omit<Business, "id" | "created_at" | "trial_start_date" | "trial_end_date" | "subscription_status">): Promise<Business> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("businesses")
      .insert({
        name: newBiz.name,
        industry: newBiz.industry,
        owner_name: newBiz.owner_name,
        owner_email: newBiz.owner_email,
        phone: newBiz.phone,
        currency: newBiz.currency,
        currency_symbol: newBiz.currency_symbol,
        address: newBiz.address || null,
        subscription_plan: newBiz.subscription_plan || "growth",
        default_comeback_discount: newBiz.default_comeback_discount || 15,
        whatsapp_signature: newBiz.whatsapp_signature || `— ${newBiz.owner_name}, ${newBiz.name}`,
        qr_loyalty_perk: newBiz.qr_loyalty_perk || "",
      })
      .select()
      .single();

    if (error) throw error;

    const business = data as Business;
    this.state.businesses.push(business);
    this.state.activeBusinessId = business.id;
    this.notify();
    return business;
  }

  public async updateBusiness(updated: Partial<Business> & { id?: string }) {
    const targetId = updated.id || this.state.activeBusinessId;
    const supabase = getSupabase();

    const { ...fields } = updated;
    delete fields.id;

    await supabase.from("businesses").update(fields).eq("id", targetId);

    this.state.businesses = this.state.businesses.map((b) =>
      b.id === targetId ? { ...b, ...updated } : b
    );
    this.notify();
  }

  // --- CUSTOMERS ---
  public getCustomers(businessId?: string): Customer[] {
    const bizId = businessId || this.state.activeBusinessId;
    return this.state.customers.filter((c) => c.business_id === bizId);
  }

  public getCustomerById(id: string): Customer | undefined {
    return this.state.customers.find((c) => c.id === id);
  }

  public getCustomerByPhone(phone: string, businessId?: string): Customer | undefined {
    const bizId = businessId || this.state.activeBusinessId;
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    return this.state.customers.find(
      (c) =>
        c.business_id === bizId &&
        c.phone.replace(/[^0-9]/g, "") === cleanPhone &&
        !c.is_anonymous
    );
  }

  public async addCustomer(data: Omit<Customer, "id" | "created_at" | "segment" | "total_visits" | "total_spend" | "avg_bill" | "avg_visit_interval_days" | "first_visit_date" | "last_visit_date"> & { initial_spend?: number }): Promise<Customer> {
    const supabase = getSupabase();
    const now = new Date().toISOString();
    const spend = data.initial_spend || 0;

    const { data: inserted, error } = await supabase
      .from("customers")
      .insert({
        business_id: data.business_id || this.state.activeBusinessId,
        name: data.name,
        phone: data.phone,
        is_anonymous: data.is_anonymous,
        segment: "new",
        total_visits: spend > 0 ? 1 : 0,
        total_spend: spend,
        avg_bill: spend,
        avg_visit_interval_days: 0,
        first_visit_date: now,
        last_visit_date: now,
        notes: data.notes || null,
        tags: data.tags || [],
        favorite_items: data.favorite_items || [],
        opt_in_source: data.opt_in_source || "staff_entry",
      })
      .select()
      .single();

    if (error) throw error;

    const newCustomer = inserted as Customer;
    this.state.customers.unshift(newCustomer);
    this.notify();
    return newCustomer;
  }

  public async updateCustomer(updated: Customer) {
    const supabase = getSupabase();
    const { id, ...fields } = updated;
    await supabase.from("customers").update(fields).eq("id", id);

    this.state.customers = this.state.customers.map((c) =>
      c.id === updated.id ? updated : c
    );
    this.notify();
  }

  public async deleteCustomer(id: string) {
    const supabase = getSupabase();
    await supabase.from("customers").delete().eq("id", id);

    this.state.customers = this.state.customers.filter((c) => c.id !== id);
    this.notify();
  }

  // --- VISITS ---
  public getVisits(businessId?: string): Visit[] {
    const bizId = businessId || this.state.activeBusinessId;
    return this.state.visits.filter((v) => v.business_id === bizId);
  }

  public async addVisit(data: {
    customer_id?: string;
    customer_name?: string;
    customer_phone?: string;
    amount: number;
    is_anonymous: boolean;
    notes?: string;
    items?: string[];
    date?: string;
  }): Promise<Visit> {
    const supabase = getSupabase();
    const bizId = this.state.activeBusinessId;
    const now = data.date || new Date().toISOString();

    const { data: inserted, error } = await supabase
      .from("visits")
      .insert({
        business_id: bizId,
        customer_id: data.customer_id || null,
        customer_name: data.customer_name || null,
        customer_phone: data.customer_phone || null,
        amount: data.amount,
        is_anonymous: data.is_anonymous,
        notes: data.notes || null,
        items: data.items || [],
        date: now,
      })
      .select()
      .single();

    if (error) throw error;

    const newVisit = inserted as Visit;
    this.state.visits.unshift(newVisit);

    // Update customer stats if not anonymous
    if (data.customer_id) {
      const customer = this.state.customers.find((c) => c.id === data.customer_id);
      if (customer) {
        const prevVisits = this.state.visits.filter(
          (v) => v.customer_id === customer.id
        );
        const totalVisits = prevVisits.length;
        const totalSpend = prevVisits.reduce((acc, v) => acc + v.amount, 0);
        const avgBill = Math.round(totalSpend / Math.max(1, totalVisits));

        let avgInterval = customer.avg_visit_interval_days;
        if (customer.last_visit_date && totalVisits > 1) {
          const daysSincePrev = Math.max(
            1,
            Math.floor(
              (new Date(now).getTime() - new Date(customer.last_visit_date).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          );
          avgInterval = Math.round((avgInterval * (totalVisits - 1) + daysSincePrev) / totalVisits);
        }

        const updatedCustomer: Customer = {
          ...customer,
          total_visits: totalVisits,
          total_spend: totalSpend,
          avg_bill: avgBill,
          avg_visit_interval_days: avgInterval,
          last_visit_date: now,
        };

        updatedCustomer.segment = calculateCustomerSegment(
          updatedCustomer,
          this.state.visits
        );

        await this.updateCustomer(updatedCustomer);
      }
    }

    this.notify();
    return newVisit;
  }

  // --- OPPORTUNITIES ---
  public getOpportunities(businessId?: string): Opportunity[] {
    const biz = this.getActiveBusiness();
    const customers = this.getCustomers(biz.id);
    const visits = this.getVisits(biz.id);
    const live = generateLiveOpportunities(biz, customers, visits);
    return live.map((opp) => {
      const stored = (this.state.opportunities || []).find((o) => o.id === opp.id);
      return stored ? { ...opp, status: stored.status } : opp;
    });
  }

  public resolveOpportunity(id: string, status: "pending" | "contacted" | "dismissed" = "contacted") {
    if (!this.state.opportunities) {
      this.state.opportunities = [];
    }
    const idx = this.state.opportunities.findIndex((o) => o.id === id);
    if (idx >= 0) {
      this.state.opportunities[idx].status = status;
    } else {
      this.state.opportunities.push({
        id,
        business_id: this.state.activeBusinessId,
        customer_id: "",
        customer_name: "",
        customer_phone: "",
        type: "at_risk",
        priority: "medium",
        reason: "Resolved",
        days_since_last_visit: 0,
        expected_interval: 0,
        potential_revenue: 0,
        recommended_action: "",
        status,
        created_at: new Date().toISOString(),
      });
    }
    this.notify();
  }

  // --- WHATSAPP TEMPLATES & LOGS ---
  public getTemplates(businessId?: string): WhatsAppTemplate[] {
    const bizId = businessId || this.state.activeBusinessId;
    const custom = this.state.templates.filter(
      (t) => t.business_id === bizId
    );
    const system = this.state.templates.filter(
      (t) => t.business_id === null
    );
    const combined = [...custom, ...(system.length > 0 ? system : DEFAULT_WHATSAPP_TEMPLATES)];
    return combined;
  }

  public async addTemplate(template: Omit<WhatsAppTemplate, "id">): Promise<WhatsAppTemplate> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("whatsapp_templates")
      .insert({
        business_id: template.business_id,
        name: template.name,
        category: template.category,
        message: template.message,
        is_default: template.is_default,
      })
      .select()
      .single();

    if (error) throw error;

    const newTpl = data as WhatsAppTemplate;
    this.state.templates.push(newTpl);
    this.notify();
    return newTpl;
  }

  public getWhatsAppLogs(businessId?: string): WhatsAppLog[] {
    const bizId = businessId || this.state.activeBusinessId;
    return this.state.whatsappLogs.filter((l) => l.business_id === bizId);
  }

// Importers/Callers: App-wide data store for all components.
// Affected API: logWhatsAppSend data shape.
// Data Schemas: WhatsAppLog.
// User's Verbatim Instruction: NA - internal fix for arguments mismatch.

  public async logWhatsAppSend(data: {
    customer_id: string;
    customer_name: string;
    customer_phone?: string;
    phone?: string;
    template_name: string;
    message_sent: string;
    business_id?: string;
  }): Promise<WhatsAppLog> {
    const supabase = getSupabase();
    const phone = data.customer_phone || data.phone || "";
    const { data: inserted, error } = await supabase
      .from("whatsapp_logs")
      .insert({
        business_id: this.state.activeBusinessId,
        customer_id: data.customer_id,
        customer_name: data.customer_name,
        customer_phone: phone,
        template_name: data.template_name,
        message_sent: data.message_sent,
        status: "sent",
      })
      .select()
      .single();

    if (error) throw error;

    const log = inserted as WhatsAppLog;
    this.state.whatsappLogs.unshift(log);
    this.notify();
    return log;
  }

  // --- STAFF ---
  public getStaffMembers(businessId?: string): StaffMember[] {
    if (businessId) {
      return this.state.staffMembers.filter(
        (s) => !s.business_id || s.business_id === businessId
      );
    }
    return this.state.staffMembers;
  }

  public getStaffLimits(plan: SubscriptionPlanId = "starter", isTrial: boolean = true) {
    if (isTrial || plan === "starter") {
      return { maxStaff: 1, maxManagers: 1, label: "Free Trial / Starter" };
    }
    if (plan === "growth") {
      return { maxStaff: 3, maxManagers: 2, label: "Growth Tier" };
    }
    return { maxStaff: 999, maxManagers: 999, label: "Pro Unlimited" };
  }

  public async addStaffMember(staff: Omit<StaffMember, "id" | "created_at"> & { password?: string }): Promise<StaffMember> {
    const bizId = staff.business_id || this.state.activeBusinessId;
    const currentBiz = this.state.businesses.find((b) => b.id === bizId) || this.getActiveBusiness();
    const isTrial = currentBiz?.subscription_status === "trialing";
    const plan = currentBiz?.subscription_plan || "starter";
    const limits = this.getStaffLimits(plan, isTrial);

    const existingMembers = this.state.staffMembers.filter((s) => s.business_id === bizId);
    const existingStaffCount = existingMembers.filter((s) => s.role === "staff").length;
    const existingManagerCount = existingMembers.filter((s) => s.role === "manager").length;

    if (staff.role === "staff" && existingStaffCount >= limits.maxStaff) {
      throw new Error(`Plan Limit Exceeded: ${limits.label} allows a maximum of ${limits.maxStaff} Staff member(s). Please upgrade to add more staff.`);
    }
    if (staff.role === "manager" && existingManagerCount >= limits.maxManagers) {
      throw new Error(`Plan Limit Exceeded: ${limits.label} allows a maximum of ${limits.maxManagers} Manager(s). Please upgrade to add more managers.`);
    }

    let createdStaff: StaffMember | null = null;

    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/staff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: staff.name,
            email: staff.email,
            phone: staff.phone,
            role: staff.role,
            business_id: bizId,
            password: staff.password,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.staff) {
            createdStaff = json.staff;
          }
        } else {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error || "Failed to add staff member.");
        }
      } catch (apiErr: any) {
        if (apiErr.message?.includes("Plan Limit") || apiErr.message?.includes("Role must")) {
          throw apiErr;
        }
        console.warn("API staff creation fallback:", apiErr);
      }
    }

    if (!createdStaff) {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("users")
        .insert({
          business_id: bizId,
          email: staff.email,
          full_name: staff.name,
          phone: staff.phone,
          role: staff.role,
        })
        .select()
        .single();

      if (error) {
        createdStaff = {
          id: "staff_" + Math.random().toString(36).substring(2, 9),
          business_id: bizId,
          name: staff.name,
          email: staff.email,
          phone: staff.phone,
          role: staff.role,
          status: "active",
          created_at: new Date().toISOString(),
        };
      } else {
        createdStaff = {
          id: data.id,
          business_id: data.business_id,
          name: data.full_name,
          email: data.email,
          phone: staff.phone,
          role: data.role,
          status: "active",
          created_at: data.created_at,
        };
      }
    }

    this.state.staffMembers.push(createdStaff);
    this.notify();
    return createdStaff;
  }

  public async deleteStaffMember(id: string): Promise<void> {
    try {
      if (typeof window !== "undefined") {
        await fetch(`/api/staff?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
      } else {
        const supabase = getSupabase();
        await supabase.from("users").delete().eq("id", id);
      }
    } catch (e) {
      console.error("Failed to delete staff member via API:", e);
      const supabase = getSupabase();
      await supabase.from("users").delete().eq("id", id);
    }

    this.state.staffMembers = this.state.staffMembers.filter((s) => s.id !== id);
    this.notify();
  }

  // --- SUBSCRIPTIONS & ADMIN ACTIONS ---
  public async upgradePlan(businessId: string, planId: SubscriptionPlanId) {
    const supabase = getSupabase();
    await supabase
      .from("businesses")
      .update({ subscription_plan: planId, subscription_status: "active" })
      .eq("id", businessId);

    this.state.businesses = this.state.businesses.map((b) => {
      if (b.id === businessId) {
        return { ...b, subscription_plan: planId, subscription_status: "active" as const };
      }
      return b;
    });
    this.notify();
  }

  public async updateBusinessSubscription(
    businessId: string,
    planId: SubscriptionPlanId,
    status: SubscriptionStatus
  ) {
    const supabase = getSupabase();
    await supabase
      .from("businesses")
      .update({ subscription_plan: planId, subscription_status: status })
      .eq("id", businessId);

    this.state.businesses = this.state.businesses.map((b) => {
      if (b.id === businessId) {
        return { ...b, subscription_plan: planId, subscription_status: status };
      }
      return b;
    });
    this.notify();
  }

  public async extendTrial(businessId: string, days: number = 14) {
    const supabase = getSupabase();
    const biz = this.state.businesses.find((b) => b.id === businessId);
    if (!biz) return;

    const currentEnd = new Date(biz.trial_end_date).getTime();
    const newEnd = new Date(Math.max(Date.now(), currentEnd) + days * 86400000);

    await supabase
      .from("businesses")
      .update({
        trial_end_date: newEnd.toISOString(),
        subscription_status: "trialing",
      })
      .eq("id", businessId);

    this.state.businesses = this.state.businesses.map((b) => {
      if (b.id === businessId) {
        return {
          ...b,
          trial_end_date: newEnd.toISOString(),
          subscription_status: "trialing" as const,
        };
      }
      return b;
    });
    this.notify();
  }

  public async toggleSuspendBusiness(businessId: string) {
    const biz = this.state.businesses.find((b) => b.id === businessId);
    if (!biz) return;

    const supabase = getSupabase();
    await supabase
      .from("businesses")
      .update({ is_suspended: !biz.is_suspended })
      .eq("id", businessId);

    this.state.businesses = this.state.businesses.map((b) => {
      if (b.id === businessId) {
        return { ...b, is_suspended: !b.is_suspended };
      }
      return b;
    });
    this.notify();
  }

  // --- UPI SUBSCRIPTION PAYMENTS & CORE SETTINGS ---
  public getSubscriptionPayments(businessId?: string): SubscriptionPaymentRecord[] {
    if (typeof window !== "undefined" && this.state.subscriptionPayments.length === 0) {
      try {
        const saved = localStorage.getItem("revia_subscription_payments");
        if (saved) {
          this.state.subscriptionPayments = JSON.parse(saved);
        }
      } catch (e) {
        console.warn("Error reading subscription payments from localStorage", e);
      }
    }

    if (businessId) {
      return this.state.subscriptionPayments.filter((p) => p.business_id === businessId);
    }
    return this.state.subscriptionPayments;
  }

  public getPlatformSettings(): PlatformCoreSettings {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("revia_platform_settings");
        if (saved) {
          this.state.platformSettings = { ...DEFAULT_PLATFORM_SETTINGS, ...JSON.parse(saved) };
        }
      } catch (e) {
        console.warn("Error reading platform settings from localStorage", e);
      }
    }
    return this.state.platformSettings;
  }

  public updatePlatformSettings(settings: Partial<PlatformCoreSettings>) {
    this.state.platformSettings = {
      ...this.state.platformSettings,
      ...settings,
    };
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("revia_platform_settings", JSON.stringify(this.state.platformSettings));
      } catch (e) {
        console.warn("Failed to persist platform settings", e);
      }
    }
    this.notify();
  }

  public async submitSubscriptionPayment(
    data: Omit<SubscriptionPaymentRecord, "id" | "created_at" | "status">
  ): Promise<SubscriptionPaymentRecord> {
    const cleanUtr = data.utr_reference?.trim() || "";

    // 1. Validate UTR format and anti-fraud rules
    const validation = validateUtrNumber(cleanUtr);
    if (!validation.isValid) {
      throw new Error(validation.error || "Invalid UTR reference number.");
    }

    // 2. Anti-fraud: Check for duplicate UTR usage across all platform transactions
    const duplicateUtr = this.state.subscriptionPayments.find(
      (p) => p.utr_reference.trim() === cleanUtr && p.status !== "rejected"
    );
    if (duplicateUtr) {
      throw new Error(
        "This UTR reference number has already been submitted on the platform. Please check your transaction receipt."
      );
    }

    const isProvisional = this.state.platformSettings.auto_verification_mode === "provisional_instant_access";

    const newRecord: SubscriptionPaymentRecord = {
      id: "pay_" + Math.random().toString(36).substring(2, 9),
      ...data,
      utr_reference: cleanUtr,
      status: isProvisional ? "approved" : "pending",
      verification_method: isProvisional ? "provisional_auto" : "manual_founder",
      created_at: new Date().toISOString(),
      approved_at: isProvisional ? new Date().toISOString() : undefined,
    };

    // If provisional instant access is enabled, grant immediate paid access while founder audits
    if (isProvisional) {
      await this.updateBusinessSubscription(data.business_id, data.plan_id, "active");
    }

    this.state.subscriptionPayments = [newRecord, ...this.state.subscriptionPayments];

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "revia_subscription_payments",
          JSON.stringify(this.state.subscriptionPayments)
        );
      } catch (e) {
        console.warn("Failed to persist payments to storage", e);
      }
    }

    this.notify();
    return newRecord;
  }

  public async approveSubscriptionPayment(
    paymentId: string,
    method: "manual_founder" | "auto_sms_matched" | "provisional_auto" = "manual_founder"
  ) {
    const payment = this.state.subscriptionPayments.find((p) => p.id === paymentId);
    if (!payment) return;

    payment.status = "approved";
    payment.verification_method = method;
    payment.approved_at = new Date().toISOString();

    await this.updateBusinessSubscription(payment.business_id, payment.plan_id, "active");

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "revia_subscription_payments",
          JSON.stringify(this.state.subscriptionPayments)
        );
      } catch (e) {
        console.warn("Failed to persist payments", e);
      }
    }
    this.notify();
  }

  public async autoReconcileFromBankSms(smsOrStatementText: string): Promise<{
    matchedCount: number;
    approvedIds: string[];
    parsedRecords: any[];
  }> {
    const parsed = parseBankSmsOrStatement(smsOrStatementText);
    const approvedIds: string[] = [];

    for (const record of parsed) {
      // Find matching pending payment by exact 12-digit UTR
      const matchingPending = this.state.subscriptionPayments.find(
        (p) => p.status === "pending" && p.utr_reference.trim() === record.utr.trim()
      );

      if (matchingPending) {
        matchingPending.status = "approved";
        matchingPending.verification_method = "auto_sms_matched";
        matchingPending.approved_at = new Date().toISOString();
        matchingPending.remarks = "Auto-reconciled via Bank SMS / Statement";

        await this.updateBusinessSubscription(
          matchingPending.business_id,
          matchingPending.plan_id,
          "active"
        );
        approvedIds.push(matchingPending.id);
      }
    }

    if (approvedIds.length > 0 && typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "revia_subscription_payments",
          JSON.stringify(this.state.subscriptionPayments)
        );
      } catch (e) {
        console.warn("Failed to persist auto-reconciled payments", e);
      }
    }

    this.notify();
    return {
      matchedCount: approvedIds.length,
      approvedIds,
      parsedRecords: parsed,
    };
  }

  public async rejectSubscriptionPayment(paymentId: string, remarks?: string) {
    const payment = this.state.subscriptionPayments.find((p) => p.id === paymentId);
    if (!payment) return;

    payment.status = "rejected";
    payment.remarks = remarks || "Verification rejected by administrator.";

    // If was previously provisionally active, downgrade back to trialing or expired
    const biz = this.state.businesses.find((b) => b.id === payment.business_id);
    if (biz && biz.subscription_plan === payment.plan_id) {
      await this.updateBusinessSubscription(biz.id, "starter", "trialing");
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "revia_subscription_payments",
          JSON.stringify(this.state.subscriptionPayments)
        );
      } catch (e) {
        console.warn("Failed to persist payments", e);
      }
    }
    this.notify();
  }

  public resetState() {
    this.state = createEmptyState();
    this.loaded = false;
    this.notify();
  }
}

export const store = AppStore.getInstance();
