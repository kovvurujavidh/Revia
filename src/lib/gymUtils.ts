// Importers/Callers: GymDashboard.tsx, src/app/gym-checkin/[businessId]/page.tsx, src/app/customers/page.tsx, src/app/add-visit/page.tsx
// Affected API: Gym Member management, membership expiry engine, check-in validation, QR attendance tracking
// Data Schemas: Customer, Visit, GymMember, GymAttendanceRecord, GymMembershipPlan from src/lib/types.ts
// User's Verbatim Instruction: "c:\AI\Revia_Final_All_Three_Business_Updates_Claude_Code_Prompt.docx now this make todo and complete updaate"

import { Customer, Visit } from "./types";

export interface ParsedGymMember {
  id: string;
  name: string;
  phone: string;
  planName: string;
  planDurationMonths: number;
  amountPaid: number;
  startDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  daysLeft: number;
  status: "active" | "expiring_soon" | "expired" | "frozen";
  emergencyContact?: string;
  notes?: string;
  totalWorkouts: number;
  lastWorkoutDate?: string;
  lastCheckInTime?: string;
  rawCustomer: Customer;
}

/**
 * Calculates membership expiry date given a start date and duration in months.
 */
export function calculateGymExpiryDate(startDateStr: string, durationMonths: number = 1): string {
  const d = new Date(startDateStr);
  if (isNaN(d.getTime())) {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }

  const result = new Date(d);
  const currentMonth = result.getMonth();
  result.setMonth(currentMonth + durationMonths);

  // Handle month-end rollover e.g. Aug 31 -> Sep 30
  if (result.getMonth() !== (currentMonth + durationMonths) % 12) {
    result.setDate(0);
  }

  return result.toISOString().split("T")[0];
}

/**
 * Calculates days remaining until membership expires.
 */
export function calculateGymDaysLeft(expiryDateStr: string): number {
  if (!expiryDateStr) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDateStr);
  expiry.setHours(0, 0, 0, 0);

  const diffMs = expiry.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Categorizes gym membership status based on days left.
 */
export function getGymMembershipStatus(
  daysLeft: number,
  isFrozen: boolean = false
): "active" | "expiring_soon" | "expired" | "frozen" {
  if (isFrozen) return "frozen";
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 7) return "expiring_soon";
  return "active";
}

/**
 * Parses a Customer record into structured Gym Member data.
 */
export function parseGymMember(customer: Customer, visits: Visit[]): ParsedGymMember {
  let meta: any = {};
  try {
    if (customer.notes && customer.notes.startsWith("{")) {
      meta = JSON.parse(customer.notes);
    }
  } catch (e) {
    meta = {};
  }

  const planName =
    meta.plan_name ||
    (customer.favorite_items?.[0] ? customer.favorite_items[0] : "Monthly Membership");

  const planDurationMonths = Number(meta.plan_duration_months) || 1;
  const amountPaid = Number(meta.amount_paid) || Number(customer.avg_bill) || 1500;

  const startDate =
    meta.start_date ||
    (customer.first_visit_date
      ? customer.first_visit_date.split("T")[0]
      : new Date().toISOString().split("T")[0]);

  // Find attendance visits
  const memberVisits = visits.filter(
    (v) =>
      v.customer_id === customer.id ||
      (v.customer_phone && v.customer_phone === customer.phone)
  );

  const totalWorkouts = memberVisits.length;

  const latestVisit = memberVisits.sort(
    (a, b) => new Date(b.date || b.created_at).getTime() - new Date(a.date || a.created_at).getTime()
  )[0];

  const lastWorkoutDate = latestVisit ? (latestVisit.date || latestVisit.created_at).split("T")[0] : undefined;
  const lastCheckInTime = latestVisit
    ? new Date(latestVisit.date || latestVisit.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : undefined;

  let expiryDate = meta.expiry_date;
  if (!expiryDate) {
    expiryDate = calculateGymExpiryDate(startDate, planDurationMonths);
  }

  const daysLeft = calculateGymDaysLeft(expiryDate);
  const status = getGymMembershipStatus(daysLeft, meta.is_frozen);

  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    planName,
    planDurationMonths,
    amountPaid,
    startDate,
    expiryDate,
    daysLeft,
    status,
    emergencyContact: meta.emergency_contact,
    notes: meta.notes || (customer.notes?.startsWith("{") ? "" : customer.notes),
    totalWorkouts,
    lastWorkoutDate,
    lastCheckInTime,
    rawCustomer: customer,
  };
}

/**
 * Serializes Gym metadata into JSON string for Customer.notes.
 */
export function serializeGymMetadata(data: {
  plan_name: string;
  plan_duration_months: number;
  amount_paid: number;
  start_date: string;
  expiry_date: string;
  emergency_contact?: string;
  is_frozen?: boolean;
  notes?: string;
}): string {
  return JSON.stringify({
    plan_name: data.plan_name,
    plan_duration_months: data.plan_duration_months,
    amount_paid: data.amount_paid,
    start_date: data.start_date,
    expiry_date: data.expiry_date,
    emergency_contact: data.emergency_contact || "",
    is_frozen: data.is_frozen || false,
    notes: data.notes || "",
  });
}
