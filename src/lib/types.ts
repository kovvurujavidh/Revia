// Importers/Callers: App-wide data types across models, services, components, pages.
// Affected API: Data Schemas (IndustryType, Business, User, Customer, Visit, StaffMember, WhatsAppTemplate, etc.).
// Data Schemas: All core data models.
// User's Verbatim Instruction: "WHEN THE OWNER ADD ANY STAFF WITH SPECIFIC MOBILE NUMBER IN HOME PAGE ADD BUTTON STAFF BY USING THE SAME NUMBER CONNECT THE OWNER AND STAFF TOGETHER"

export type IndustryType =
  | "restaurant"
  | "cafe"
  | "hotel"
  | "retail"
  | "gym"
  | "salon_spa"
  | "clinic"
  | "other";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "expired";

export type SubscriptionPlanId = "starter" | "growth" | "pro";

export type UserRole = "owner" | "manager" | "staff" | "superadmin";

export type CustomerSegment =
  | "new"
  | "regular"
  | "vip"
  | "becoming_inactive"
  | "inactive";

export interface Business {
  id: string;
  name: string;
  industry: IndustryType;
  owner_name: string;
  owner_email: string;
  phone: string;
  currency: string;
  currency_symbol: string;
  address?: string;
  created_at: string;
  trial_start_date: string;
  trial_end_date: string;
  subscription_status: SubscriptionStatus;
  subscription_plan: SubscriptionPlanId;
  default_comeback_discount: number; // e.g. 15%
  whatsapp_signature: string;
  is_suspended?: boolean;
  qr_loyalty_perk?: string; // e.g. "Get 10% OFF on your next visit"
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  business_id: string;
  avatar_url?: string;
  created_at: string;
}

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  phone: string; // WhatsApp formatted e.g. +91 98765 43210
  is_anonymous: boolean;
  segment: CustomerSegment;
  total_visits: number;
  total_spend: number;
  avg_bill: number;
  avg_visit_interval_days: number;
  first_visit_date: string;
  last_visit_date: string;
  notes?: string;
  tags?: string[];
  favorite_items?: string[];
  opt_in_source?: "counter_qr" | "staff_entry" | "online";
  created_at: string;
}

export interface Visit {
  id: string;
  business_id: string;
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  amount: number;
  is_anonymous: boolean;
  notes?: string;
  items?: string[];
  date: string; // ISO date string
  created_at: string;
}

export interface Opportunity {
  id: string;
  business_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  type: "at_risk" | "inactive_winback" | "vip_appreciation" | "new_customer_retention";
  priority: "high" | "medium" | "low";
  reason: string;
  days_since_last_visit: number;
  expected_interval: number;
  potential_revenue: number;
  recommended_action: string;
  status: "pending" | "contacted" | "dismissed";
  created_at: string;
}

export interface WhatsAppTemplate {
  id: string;
  business_id: string | null; // null for system templates
  name: string;
  category: "thank_you" | "comeback" | "vip_offer" | "reminder" | "festival";
  industry?: string | null; // industry-specific templates: "restaurant", "salon_spa", "gym", etc.
  message: string;
  is_default: boolean;
}

export interface WhatsAppLog {
  id: string;
  business_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  template_name: string;
  message_sent: string;
  status: "sent" | "opened" | "returned";
  sent_at: string;
  return_recorded_at?: string;
  return_revenue?: number;
}

export interface DailyAIReportData {
  business_id: string;
  date: string;
  summary: string;
  key_changes: string[];
  trends: string[];
  risk_alert: string;
  recommended_actions: {
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    action_type: "whatsapp" | "visit" | "segment";
    target_customer_id?: string;
  }[];
  revenue_insight: string;
}

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  price_monthly_inr: number;
  description: string;
  features: string[];
  max_customers: number;
  badge?: string;
  is_popular?: boolean;
}

export interface StaffMember {
  id: string;
  business_id?: string;
  name: string;
  email: string;
  phone: string;
  role: "manager" | "staff";
  status: "active" | "invited";
  created_at: string;
}
