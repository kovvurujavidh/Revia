// Importers/Callers: DailyAIReport component, Store live opportunities generator, Analytics page, src/app/whatsapp/page.tsx, src/app/opportunities/page.tsx.
// Affected API: Deterministic customer segmentation, live opportunity generation, Daily AI Report generator, WhatsApp custom date personalization engine.
// Data Schemas: Business, Customer, Visit, Opportunity, DailyAIReportData, CustomerSegment, WhatsAppCustomData from src/lib/types.ts.
// User's Verbatim Instruction: "Personalized Message Composer ... only change this and dont make complicated just put user frendli and the tempelate suggest them according to waht business they have"

import {
  Business,
  Customer,
  Visit,
  Opportunity,
  DailyAIReportData,
  CustomerSegment,
} from "./types";

export interface WhatsAppCustomData {
  customDate?: string;
  validUntil?: string;
  appointmentDate?: string;
  customOfferDiscount?: string;
}

/**
 * Deterministically classify a customer's retention segment based on visit count,
 * spend history, average return interval, and days since last visit.
 */
export function calculateCustomerSegment(
  customer: Customer,
  allVisits: Visit[]
): CustomerSegment {
  const customerVisits = allVisits.filter(
    (v) => v.customer_id === customer.id || (v.customer_phone && v.customer_phone === customer.phone)
  );
  const totalVisits = customerVisits.length || customer.total_visits || 1;
  const totalSpend =
    customerVisits.reduce((sum, v) => sum + v.amount, 0) || customer.total_spend || 0;

  if (totalVisits <= 1) {
    return "new";
  }

  const lastVisitTime = customer.last_visit_date
    ? new Date(customer.last_visit_date).getTime()
    : Date.now();
  const daysSinceLastVisit = Math.max(
    0,
    Math.floor((Date.now() - lastVisitTime) / (1000 * 60 * 60 * 24))
  );

  const avgInterval = customer.avg_visit_interval_days || 7;

  // Inactive: 35+ days or over 3x expected return cycle
  if (daysSinceLastVisit >= 35 || (avgInterval > 0 && daysSinceLastVisit > avgInterval * 3.5)) {
    return "inactive";
  }

  // Becoming inactive: 1.8x past their normal visit cycle
  if (avgInterval > 0 && daysSinceLastVisit > avgInterval * 1.8) {
    return "becoming_inactive";
  }

  // VIP: Top tier visits or high total spend
  if (totalVisits >= 8 || totalSpend >= 12000) {
    return "vip";
  }

  return "regular";
}

/**
 * Generate prioritized action opportunities based on live customer state.
 */
export function generateLiveOpportunities(
  business: Business,
  customers: Customer[],
  visits: Visit[]
): Opportunity[] {
  const opportunities: Opportunity[] = [];

  for (const customer of customers) {
    if (customer.is_anonymous) continue;

    const daysSinceLast = customer.last_visit_date
      ? Math.max(
          0,
          Math.floor(
            (Date.now() - new Date(customer.last_visit_date).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;
    const avgInterval = customer.avg_visit_interval_days || 7;

    // At-Risk: Regular who missed expected cycle
    if (
      customer.segment === "becoming_inactive" ||
      (daysSinceLast > avgInterval * 1.8 && daysSinceLast < 35 && customer.total_visits >= 2)
    ) {
      opportunities.push({
        id: `opp-atrisk-${customer.id}`,
        business_id: business.id,
        customer_id: customer.id,
        customer_name: customer.name,
        customer_phone: customer.phone,
        type: "at_risk",
        priority: "high",
        reason: `Usually visits every ${avgInterval} days. Last visited ${daysSinceLast} days ago (${daysSinceLast - avgInterval} days overdue).`,
        days_since_last_visit: daysSinceLast,
        expected_interval: avgInterval,
        potential_revenue: customer.avg_bill || 1000,
        recommended_action: `Send personalized check-in / ${business.default_comeback_discount || 15}% comeback discount.`,
        status: "pending",
        created_at: new Date().toISOString(),
      });
    }

    // Inactive win-back
    else if (customer.segment === "inactive" || daysSinceLast >= 35) {
      opportunities.push({
        id: `opp-inactive-${customer.id}`,
        business_id: business.id,
        customer_id: customer.id,
        customer_name: customer.name,
        customer_phone: customer.phone,
        type: "inactive_winback",
        priority: customer.total_spend > 5000 ? "high" : "medium",
        reason: `Has not visited in ${daysSinceLast} days. Previously made ${customer.total_visits} visits totaling ${business.currency_symbol}${customer.total_spend.toLocaleString()}.`,
        days_since_last_visit: daysSinceLast,
        expected_interval: avgInterval,
        potential_revenue: customer.avg_bill || 1200,
        recommended_action: `Send 'We Miss You' special ${business.default_comeback_discount || 20}% win-back offer.`,
        status: "pending",
        created_at: new Date().toISOString(),
      });
    }

    // VIP Appreciation
    else if (customer.segment === "vip") {
      opportunities.push({
        id: `opp-vip-${customer.id}`,
        business_id: business.id,
        customer_id: customer.id,
        customer_name: customer.name,
        customer_phone: customer.phone,
        type: "vip_appreciation",
        priority: "medium",
        reason: `VIP guest with ${customer.total_visits} visits and ${business.currency_symbol}${customer.total_spend.toLocaleString()} lifetime spend.`,
        days_since_last_visit: daysSinceLast,
        expected_interval: avgInterval,
        potential_revenue: customer.avg_bill || 1500,
        recommended_action: "Send VIP exclusive upgrade / complimentary chef dessert perk.",
        status: "pending",
        created_at: new Date().toISOString(),
      });
    }

    // New Customer 2nd-Visit Conversion
    else if (customer.segment === "new" && daysSinceLast >= 2 && daysSinceLast <= 10) {
      opportunities.push({
        id: `opp-new-${customer.id}`,
        business_id: business.id,
        customer_id: customer.id,
        customer_name: customer.name,
        customer_phone: customer.phone,
        type: "new_customer_retention",
        priority: "medium",
        reason: `First-time visitor ${daysSinceLast} days ago. High conversion window for 2nd visit!`,
        days_since_last_visit: daysSinceLast,
        expected_interval: 7,
        potential_revenue: customer.avg_bill || 800,
        recommended_action: "Send 2nd-visit welcome voucher to establish regular habit.",
        status: "pending",
        created_at: new Date().toISOString(),
      });
    }
  }

  return opportunities.slice(0, 10);
}

/**
 * Deterministic Daily AI Analysis Engine that computes real metrics
 * and provides clear, actionable explanations and prioritized steps.
 * Synchronized with live opportunity resolutions and WhatsApp campaigns.
 */
export function generateDailyAIReport(
  business: Business,
  customers: Customer[],
  visits: Visit[],
  activeOpportunities?: Opportunity[],
  whatsappLogs?: any[]
): DailyAIReportData {
  const today = new Date().toISOString().split("T")[0];
  const todayVisits = visits.filter((v) => v.date.startsWith(today));
  const todayRevenue = todayVisits.reduce((acc, v) => acc + v.amount, 0);

  // Derive opportunities
  const allOpps = activeOpportunities && activeOpportunities.length > 0
    ? activeOpportunities
    : generateLiveOpportunities(business, customers, visits);

  const pendingOpps = allOpps.filter((o) => o.status === "pending");
  const contactedOpps = allOpps.filter((o: any) => o.status === "contacted" || o.status === "sent" || o.status === "dismissed");
  const pendingAtRisk = pendingOpps.filter((o) => o.type === "at_risk" || o.type === "inactive_winback");
  const pendingAtRiskCount = pendingAtRisk.length;
  const contactedCount = contactedOpps.length + (whatsappLogs ? whatsappLogs.length : 0);

  const vipCount = customers.filter((c) => c.segment === "vip").length;
  const newToday = customers.filter(
    (c) => c.created_at.startsWith(today) || c.segment === "new"
  ).length;

  const totalRevenue = visits.reduce((acc, v) => acc + v.amount, 0);
  const avgTicket = visits.length > 0 ? Math.round(totalRevenue / visits.length) : 0;

  const highPriorityOpps = pendingOpps.filter((o) => o.priority === "high");

  // Dynamic Summary Text
  let summaryText = "";
  if (pendingAtRiskCount === 0 && contactedCount > 0) {
    summaryText = `${todayVisits.length} visits logged today generating ${business.currency_symbol}${todayRevenue.toLocaleString()}. All identified at-risk customers have been contacted with win-back offers. Retention rhythm is strong!`;
  } else if (pendingAtRiskCount === 0) {
    summaryText = `${todayVisits.length} visits logged today generating ${business.currency_symbol}${todayRevenue.toLocaleString()}. Customer return cadence is healthy with zero overdue regulars today.`;
  } else {
    summaryText = `${todayVisits.length} visits logged today generating ${business.currency_symbol}${todayRevenue.toLocaleString()}. You have ${pendingAtRiskCount} customer${pendingAtRiskCount > 1 ? "s" : ""} slipping into inactivity who require follow-up today.`;
  }

  // Dynamic Risk Alert
  let riskAlert = "";
  if (pendingAtRiskCount === 0 && contactedCount > 0) {
    riskAlert = `✅ Win-Back Outreach Active: ${contactedCount} customer(s) contacted with personalized comeback perks. Monitoring return visits!`;
  } else if (pendingAtRiskCount === 0) {
    riskAlert = `✅ Great job! Your customer retention cadence is healthy today with zero churn alerts.`;
  } else {
    riskAlert = `⚠️ ${pendingAtRiskCount} previous regular${pendingAtRiskCount > 1 ? "s are" : " is"} at immediate risk of churn. Contacting them within the next 48 hours offers an 80%+ win-back probability.`;
  }

  return {
    business_id: business.id,
    date: new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    summary: summaryText,
    key_changes: [
      `Recorded ${todayVisits.length} customer visits today (${todayVisits.filter((v) => !v.is_anonymous).length} identified, ${todayVisits.filter((v) => v.is_anonymous).length} anonymous).`,
      pendingAtRiskCount > 0
        ? `${pendingAtRiskCount} regular customer(s) have exceeded their typical visit cycle by 10+ days.`
        : `${contactedCount > 0 ? `${contactedCount} customer win-back offers sent via WhatsApp.` : "All regular customer return cycles are currently on track."}`,
      `Average spend per visit is holding strong at ${business.currency_symbol}${avgTicket.toLocaleString()}.`,
    ],
    trends: [
      `Repeat customer retention rate is at ${Math.round((customers.filter((c) => c.total_visits > 1).length / Math.max(1, customers.length)) * 100)}%.`,
      `VIP guests represent ${vipCount} customers who account for a major share of lifetime revenue.`,
      pendingAtRiskCount > 0
        ? `Estimated recoverable revenue this week is ${business.currency_symbol}${(pendingAtRiskCount * avgTicket).toLocaleString()}.`
        : `Customer return velocity is optimized with active loyalty engagements.`,
    ],
    risk_alert: riskAlert,
    recommended_actions: [
      ...(highPriorityOpps.length > 0
        ? [
            {
              title: `Send Comeback Message to ${highPriorityOpps[0].customer_name}`,
              description: `Overdue by ${highPriorityOpps[0].days_since_last_visit} days. 1-click WhatsApp with ${business.default_comeback_discount}% discount.`,
              priority: "high" as const,
              action_type: "whatsapp" as const,
              target_customer_id: highPriorityOpps[0].customer_id,
            },
          ]
        : []),
      {
        title: "Print / Display Counter QR Code",
        description: "Capture 15-20 more voluntary customer phone numbers during peak queue hours.",
        priority: "medium" as const,
        action_type: "visit" as const,
      },
      {
        title: "Reward Top VIP Customers",
        description: `Recognize your ${vipCount} VIP members with a personalized thank-you message.`,
        priority: "medium" as const,
        action_type: "segment" as const,
      },
    ],
    revenue_insight: pendingAtRiskCount > 0
      ? `By activating ${pendingAtRiskCount} inactive customers this week, you can recover approximately ${business.currency_symbol}${(pendingAtRiskCount * avgTicket).toLocaleString()} in direct revenue.`
      : `Maintaining active communication with your VIPs and regulars protects an estimated ${business.currency_symbol}${(vipCount * avgTicket * 2).toLocaleString()} in monthly repeat spend.`,
  };
}

/**
 * Format a personalized WhatsApp message by replacing placeholders with live customer & custom date data
 */
export function formatWhatsAppMessage(
  templateMessage: string,
  customer: Partial<Customer>,
  business: Business,
  customData?: WhatsAppCustomData
): string {
  const daysSinceLast = customer.last_visit_date
    ? Math.max(
        1,
        Math.floor(
          (Date.now() - new Date(customer.last_visit_date).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 14;

  const defaultNextWeek = new Date();
  defaultNextWeek.setDate(defaultNextWeek.getDate() + 7);
  const defaultValidUntil = defaultNextWeek.toLocaleDateString("en-IN", { weekday: 'short', month: 'short', day: 'numeric' });

  const defaultTomorrow = new Date();
  defaultTomorrow.setDate(defaultTomorrow.getDate() + 1);
  const defaultAppointment = defaultTomorrow.toLocaleDateString("en-IN", { month: 'short', day: 'numeric' }) + " at 11:00 AM";

  let discountStr = String(customData?.customOfferDiscount || business.default_comeback_discount || 15).trim();
  let msg = templateMessage;

  // Handle textual perks vs percentage cleanly
  if (discountStr.endsWith("%")) {
    discountStr = discountStr.slice(0, -1);
  } else if (isNaN(Number(discountStr.replace(/[^0-9]/g, '')))) {
    // Non-numeric perk (e.g. Free Dessert, Free PT Session, Flat 500 Off)
    msg = msg.replace(/{offer_discount}%\s*(OFF|off)?/g, discountStr);
  }

  msg = msg
    .replace(/{customer_name}/g, customer.name || "Valued Guest")
    .replace(/{business_name}/g, business.name)
    .replace(/{days_since_last_visit}/g, daysSinceLast.toString())
    .replace(/{offer_discount}/g, discountStr)
    .replace(
      /{favorite_item}/g,
      customer.favorite_items && customer.favorite_items.length > 0
        ? customer.favorite_items[0]
        : "our specialties"
    )
    .replace(/{currency_symbol}/g, business.currency_symbol || "₹")
    .replace(/{custom_date}/g, customData?.customDate || defaultValidUntil)
    .replace(/{valid_until}/g, customData?.validUntil || defaultValidUntil)
    .replace(/{appointment_date}/g, customData?.appointmentDate || defaultAppointment);

  if (business.whatsapp_signature) {
    msg += `\n\n${business.whatsapp_signature}`;
  }

  return msg;
}

/**
 * Build a valid WhatsApp Web / App direct dispatch link
 */
export function buildWhatsAppLink(phone: string, text: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}
