// Importers/Callers: App-wide data types across models, services, components, pages.
// Affected API: Data Schemas (IndustryType, Business, User, Customer, Visit, StaffMember, PGResident, GymMember, GymAttendanceRecord, ClothingCustomer, SubscriptionPaymentRecord, PlatformCoreSettings).
// Data Schemas: All core data models.
// User's Verbatim Instruction: "c:\AI\Revia_Final_All_Three_Business_Updates_Claude_Code_Prompt.docx now this make todo and complete updaate"

export type IndustryType =
  | "restaurant"
  | "cafe"
  | "hotel"
  | "retail"
  | "gym"
  | "salon_spa"
  | "clinic"
  | "pg_hostel"
  | "clothing"
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

export interface SubscriptionPaymentRecord {
  id: string;
  business_id: string;
  business_name?: string;
  owner_email?: string;
  owner_phone?: string;
  plan_id: SubscriptionPlanId;
  billing_cycle: "monthly" | "yearly";
  amount_inr: number;
  utr_reference: string;
  status: "pending" | "approved" | "rejected";
  verification_method?: "manual_founder" | "auto_sms_matched" | "provisional_auto";
  created_at: string;
  approved_at?: string;
  remarks?: string;
}

export interface PlatformCoreSettings {
  id: string;
  upi_id: string;
  upi_name: string;
  default_trial_days: number;
  announcement_banner: string | null;
  support_email: string;
  support_whatsapp: string;
  auto_verification_mode?: "manual_approval" | "provisional_instant_access";
}

// ==========================================
// PG (PAYING GUEST) SPECIFIC TYPES
// ==========================================
export type PGPaymentCycle = "monthly" | "half_monthly" | "yearly";

export interface PGResident {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  payment_plan: PGPaymentCycle;
  rent_amount: number;
  joining_date: string; // ISO / YYYY-MM-DD
  next_due_date: string; // ISO / YYYY-MM-DD
  room_number?: string;
  bed_number?: string;
  status: "active" | "inactive" | "vacated";
  notes?: string;
  created_at: string;
}

export interface PGPaymentRecord {
  id: string;
  business_id: string;
  resident_id: string;
  resident_name: string;
  amount: number;
  payment_date: string;
  payment_period?: string;
  payment_method?: string;
  reference_no?: string;
  recorded_by?: string;
  created_at: string;
}

export interface PGBed {
  id: string;
  bed_number: string;
  resident_id?: string;
  resident_name?: string;
  status: "occupied" | "vacant";
}

export interface PGRoom {
  id: string;
  business_id: string;
  room_number: string;
  floor?: string;
  total_beds: number;
  occupied_beds: number;
  beds?: PGBed[];
}

// ==========================================
// GYM SPECIFIC TYPES & QR ATTENDANCE
// ==========================================
export interface GymMembershipPlan {
  id: string;
  business_id: string;
  name: string;
  duration_months: number; // 1, 3, 6, 12
  price: number;
  description?: string;
}

export interface GymMember {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  membership_plan_id?: string;
  membership_name: string;
  amount_paid: number;
  start_date: string; // YYYY-MM-DD
  expiry_date: string; // YYYY-MM-DD
  status: "active" | "expired" | "frozen" | "pending";
  emergency_contact?: string;
  notes?: string;
  created_at: string;
}

export interface GymAttendanceRecord {
  id: string;
  business_id: string;
  member_id: string;
  member_name: string;
  member_phone: string;
  check_in_time: string; // ISO timestamp or HH:mm
  date: string; // YYYY-MM-DD
  source: "qr" | "manual";
  status: "present" | "late";
  created_at: string;
}

// ==========================================
// CLOTHING SHOP CRM TYPES
// ==========================================
export type ClothingCustomerSegment = "high_value" | "regular" | "low_value" | "inactive";

export interface ClothingPurchaseRecord {
  id: string;
  business_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  amount: number;
  bill_reference?: string;
  date: string;
  items_summary?: string;
  notes?: string;
  created_at: string;
}

