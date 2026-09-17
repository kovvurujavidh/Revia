// Importers/Callers: PGDashboard.tsx, PGResidentManager.tsx, src/app/customers/page.tsx, src/app/add-visit/page.tsx
// Affected API: PG Resident utilities, payment cycle due date calculation, days left engine, room & bed occupancy.
// Data Schemas: Customer, Visit, PGResident, PGPaymentCycle from src/lib/types.ts.
// User's Verbatim Instruction: "c:\AI\Revia_Final_All_Three_Business_Updates_Claude_Code_Prompt.docx now this make todo and complete updaate"

import { Customer, Visit, PGPaymentCycle, PGResident } from "./types";

export interface ParsedPGResident {
  id: string;
  name: string;
  phone: string;
  paymentPlan: PGPaymentCycle;
  rentAmount: number;
  joiningDate: string; // YYYY-MM-DD
  nextDueDate: string; // YYYY-MM-DD
  daysLeft: number;
  dueStatus: "due_today" | "due_soon" | "overdue" | "paid_active";
  roomNumber: string;
  bedNumber: string;
  status: "active" | "inactive" | "vacated";
  notes?: string;
  totalPaid: number;
  paymentCount: number;
  lastPaymentDate?: string;
  rawCustomer: Customer;
}

/**
 * Calculates next due date based on payment cycle from a start date.
 * - Monthly: +1 month (exact same date or end of month)
 * - Half-Monthly: +15 days
 * - Yearly: +1 year
 */
export function calculateNextDueDate(
  startDateStr: string,
  cycle: PGPaymentCycle = "monthly"
): string {
  const d = new Date(startDateStr);
  if (isNaN(d.getTime())) {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }

  const result = new Date(d);

  if (cycle === "half_monthly") {
    result.setDate(result.getDate() + 15);
  } else if (cycle === "yearly") {
    result.setFullYear(result.getFullYear() + 1);
  } else {
    // monthly default
    const currentMonth = result.getMonth();
    result.setMonth(currentMonth + 1);
    // Handle month-end roll-overs (e.g. Jan 31 -> Feb 28)
    if (result.getMonth() !== (currentMonth + 1) % 12) {
      result.setDate(0);
    }
  }

  return result.toISOString().split("T")[0];
}

/**
 * Calculates days left dynamically between today and the due date.
 */
export function calculateDaysLeft(dueDateStr: string): number {
  if (!dueDateStr) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);

  const diffMs = due.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Categorizes payment status based on days left.
 */
export function getPGDueStatus(
  daysLeft: number
): "due_today" | "due_soon" | "overdue" | "paid_active" {
  if (daysLeft < 0) return "overdue";
  if (daysLeft === 0) return "due_today";
  if (daysLeft <= 5) return "due_soon";
  return "paid_active";
}

/**
 * Parses a Customer record into structured PG Resident data.
 */
export function parsePGResident(customer: Customer, visits: Visit[]): ParsedPGResident {
  let meta: any = {};
  try {
    if (customer.notes && customer.notes.startsWith("{")) {
      meta = JSON.parse(customer.notes);
    }
  } catch (e) {
    meta = {};
  }

  const paymentPlan: PGPaymentCycle =
    meta.payment_plan ||
    (customer.tags?.includes("yearly")
      ? "yearly"
      : customer.tags?.includes("half_monthly")
      ? "half_monthly"
      : "monthly");

  const rentAmount = Number(meta.rent_amount) || Number(customer.avg_bill) || 5000;
  const roomNumber = meta.room_number || (customer.favorite_items?.[0] ? customer.favorite_items[0].replace("Room ", "") : "101");
  const bedNumber = meta.bed_number || (customer.favorite_items?.[1] ? customer.favorite_items[1].replace("Bed ", "") : "A");

  const joiningDate =
    meta.joining_date ||
    (customer.first_visit_date
      ? customer.first_visit_date.split("T")[0]
      : new Date().toISOString().split("T")[0]);

  // Find relevant rent payment visits
  const residentVisits = visits.filter(
    (v) =>
      v.customer_id === customer.id ||
      (v.customer_phone && v.customer_phone === customer.phone)
  );

  const totalPaid = residentVisits.reduce((acc, v) => acc + (v.amount || 0), 0);
  const paymentCount = residentVisits.length;

  const latestVisit = residentVisits.sort(
    (a, b) => new Date(b.date || b.created_at).getTime() - new Date(a.date || a.created_at).getTime()
  )[0];

  const lastPaymentDate = latestVisit ? (latestVisit.date || latestVisit.created_at).split("T")[0] : undefined;

  let nextDueDate = meta.next_due_date;
  if (!nextDueDate) {
    const baseDate = lastPaymentDate || joiningDate;
    nextDueDate = calculateNextDueDate(baseDate, paymentPlan);
  }

  const daysLeft = calculateDaysLeft(nextDueDate);
  const dueStatus = getPGDueStatus(daysLeft);

  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    paymentPlan,
    rentAmount,
    joiningDate,
    nextDueDate,
    daysLeft,
    dueStatus,
    roomNumber,
    bedNumber,
    status: (meta.status as any) || "active",
    notes: meta.notes || (customer.notes?.startsWith("{") ? "" : customer.notes),
    totalPaid,
    paymentCount,
    lastPaymentDate,
    rawCustomer: customer,
  };
}

/**
 * Serializes PG metadata back into JSON format for Customer.notes.
 */
export function serializePGMetadata(data: {
  payment_plan: PGPaymentCycle;
  rent_amount: number;
  room_number: string;
  bed_number: string;
  joining_date: string;
  next_due_date: string;
  status?: "active" | "inactive" | "vacated";
  notes?: string;
}): string {
  return JSON.stringify({
    payment_plan: data.payment_plan,
    rent_amount: data.rent_amount,
    room_number: data.room_number,
    bed_number: data.bed_number,
    joining_date: data.joining_date,
    next_due_date: data.next_due_date,
    status: data.status || "active",
    notes: data.notes || "",
  });
}
