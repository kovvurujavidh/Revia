import {
  Business,
  Customer,
  Visit,
  Opportunity,
  WhatsAppTemplate,
  WhatsAppLog,
  StaffMember,
  SubscriptionPlanId,
} from "./types";
import { getSupabase } from "./supabase/client";
import { calculateCustomerSegment, generateLiveOpportunities } from "./intelligence";
import { DEFAULT_WHATSAPP_TEMPLATES } from "./seedData";

interface StoreState {
  businesses: Business[];
  activeBusinessId: string;
  customers: Customer[];
  visits: Visit[];
  opportunities: Opportunity[];
  templates: WhatsAppTemplate[];
  whatsappLogs: WhatsAppLog[];
  staffMembers: StaffMember[];
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

  public async addStaffMember(staff: Omit<StaffMember, "id" | "created_at">): Promise<StaffMember> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("users")
      .insert({
        business_id: staff.business_id || this.state.activeBusinessId,
        email: staff.email,
        full_name: staff.name,
        phone: staff.phone,
        role: staff.role,
      })
      .select()
      .single();

    if (error) throw error;

    const newStaff: StaffMember = {
      id: data.id,
      business_id: data.business_id,
      name: data.full_name,
      email: data.email,
      phone: staff.phone,
      role: staff.role,
      status: "active",
      created_at: data.created_at,
    };

    this.state.staffMembers.push(newStaff);
    this.notify();
    return newStaff;
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
    status: "trialing" | "active" | "canceled" | "expired"
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

  public resetState() {
    this.state = createEmptyState();
    this.loaded = false;
    this.notify();
  }
}

export const store = AppStore.getInstance();
