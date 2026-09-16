<!--
Importers/Callers: Project documentation & task tracking file.
Affected API: None (Markdown documentation).
Data Schemas: 18 sections from C:\AI\Revia_Salon_Final_Update_Claude_Code_Prompt.docx.
User's Verbatim Instruction: "c:\AI\Revia_Salon_Final_Update_Claude_Code_Prompt.docx  make todo list and update this one after another"
-->

# REVIA — SALON UPDATE IMPLEMENTATION & VERIFICATION TODO LIST
Source: `C:\AI\Revia_Salon_Final_Update_Claude_Code_Prompt.docx`

---

## 1. Critical Multi-Business Rule
- [x] Activate Salon update ONLY when `business_type = salon` (`activeBusiness.industry === "salon_spa"`).
- [x] Preserve all other business types (Gym, PG, Clothing Shop, Restaurant, Hotel, Clinic, Retail) completely intact.
- [x] Retain single unified multi-tenant SaaS architecture (Revia is ONE SaaS, not a separate website).
- [x] Preserve existing Supabase auth, RLS, tenant isolation, and subscription system.

## 2. Salon Product Direction
- [x] Keep workflow intentionally simple: Client arrives → service given → payment recorded → customer stored → insights shown.
- [x] Focus strictly on customer retention, daily activity, dashboard visibility, analytics, and owner-controlled WhatsApp.
- [x] No complex appointment booking, staff scheduling, or inventory overhead.

## 3. Salon Navigation
- [x] Streamline navigation for Salon tenants:
  - [x] **Dashboard** (`/dashboard`)
  - [x] **Customers** (`/customers`)
  - [x] **Add Visit** (`/add-visit`)
  - [x] **Analytics** (`/analytics`)
  - [x] **WhatsApp** (`/whatsapp`)
  - [x] **Settings** (`/settings`) & Subscription (`/profile`)
- [x] Adapt desktop sidebar (`AppSidebar.tsx`) and mobile navigation (`MobileNav.tsx`) for Salon mode.

## 4. Salon Dashboard — Approved Visual Direction
- [x] Implemented `SalonDashboard.tsx` with light SaaS styling (light/white-lilac background, white rounded cards, subtle purple/pink accents, clean typography):
  - [x] **Total Customers** (total client base count)
  - [x] **New Customers Today** (first-time visitors today)
  - [x] **Regular / Returning Customers** (repeat client loyalty count & percentage)
  - [x] **Customers Today** (walk-ins served today)
  - [x] **Today's Revenue** (calculated from real visit records)
  - [x] **This Week Revenue** (last 7 days total)
  - [x] **This Month Revenue** (month-to-date total)
  - [x] **Inactive Customers Alert** (clients overdue for a salon visit)
  - [x] **Customer Growth / 7-Day Visit Activity Chart** (interactive bar chart with daily count & revenue)
  - [x] **New vs Returning Customers Ratio** (visual breakdown with retention tips)
  - [x] **Recent Customers Feed** (live stream of recent salon services with timestamps)
  - [x] **Top Customers Leaderboard** (VIP client tier by spend)
  - [x] **Key Retention Insights** (computed dynamically from tenant data)
  - [x] **Quick Action Shortcuts** (Add Customer Visit, Send WhatsApp, View All Clients)
- [x] Zero hardcoded production numbers — 100% powered by real tenant data.

## 5. Fast Customer Entry & Tracking (/add-visit)
- [x] Optimized 5-10 second fast entry for Salon owners and staff:
  - [x] Client Mobile Number input with smart search.
  - [x] Auto-detection of **New** vs **Returning** client.
  - [x] Reuse existing customer profile if phone exists in current tenant (no duplicate creation).
  - [x] One-tap service selection chips (Haircut, Beard Trim, Hair Color, Facial, Hair Spa, Head Massage, Manicure, Pedicure, etc.).
  - [x] Service bill amount input with quick preset chips (₹200, ₹400, ₹800, ₹1500, ₹2500, ₹5000).
  - [x] Optional client notes & stylist preferences.
  - [x] Instant feedback banner with 1-click WhatsApp thank-you link.

## 6. Salon Customer Directory (/customers)
- [x] Customer Table & Cards with Salon-specific columns:
  - [x] Client Name & Phone.
  - [x] Service Taken badge.
  - [x] Client Type (New / Regular / Inactive / VIP).
  - [x] Total Visits count.
  - [x] Last Visit date (relative & formatted).
  - [x] Total Lifetime Spend.
- [x] Fast Search by Name or Phone.
- [x] Filter chips: *All*, *Regular*, *New*, *Inactive*.
- [x] Direct Action: Click any client to open lightweight profile modal.

## 7. Customer Profile Modal (/customers)
- [x] Lightweight modal showing:
  - [x] Client Name, Phone, and Segment badge.
  - [x] Total Visits, Total Spend, First Visit Date, Last Visit Date.
  - [x] Complete Visit History list with service items, dates, and amounts.
  - [x] 1-Click WhatsApp direct messaging button.

## 8. Salon Analytics Engine (/analytics)
- [x] Dedicated `SalonAnalytics.tsx` view with real tenant computation:
  - [x] Time range filter: *Last 7 Days*, *Last 30 Days*, *All Time*.
  - [x] Total Revenue, Today's Revenue, This Week, and This Month totals.
  - [x] Average Ticket Size (average spend per visit).
  - [x] Repeat Customer Loyalty Rate (percentage and count).
  - [x] Daily Revenue & Visit Velocity progression chart.
  - [x] Popular Salon Services breakdown (counts and revenue contribution).
  - [x] Client Base Composition (New vs Regular).
  - [x] Inactive Client Churn Win-Back list with 1-click reactivation WhatsApp links.
  - [x] Top VIP Spenders Leaderboard.

## 9 & 10. WhatsApp Outreach Hub Preservation & Salon Integration (/whatsapp)
- [x] Preserved the existing WhatsApp Hub design, structure, message composer, and live chat simulator.
- [x] Connected Salon customer data directly into customer targeting and selection.
- [x] Available customer segments: *All Customers*, *VIP Members*, *Regulars*, *Inactive Win-Back*, *New First-Timers*.
- [x] Smart Token support: `{customer_name}`, `{business_name}`, `{offer_discount}`, `{days_since_last_visit}`, `{favorite_item}`, `{currency_symbol}`, `{custom_date}`, `{valid_until}`, `{appointment_date}`.
- [x] Date & Offer Customizer for promotional campaigns.
- [x] 100% owner-controlled manual dispatch — zero unwanted automatic broadcast bots.
- [x] Dispatched message audit trail logged in Outreach History.

## 11. Quick Customer Workflow Verification
- [x] End-to-end verified: Owner/Staff enters visit → database updates → customer classified → dashboard, analytics, and customer directory update instantly.

## 12. Security, RBAC & Multi-Tenant Data Isolation
- [x] Multi-tenant isolation verified by `business_id`.
- [x] Role-Based Access Control:
  - [x] **Owner**: Full workspace access, analytics, team member add/delete, subscription settings.
  - [x] **Manager**: Visit entry and customer communication.
  - [x] **Staff**: Fast visit entry only.
- [x] Secure API handler at `/api/staff` for adding and deleting staff/managers using Supabase admin credentials.

## 13. UX & Mobile-First Requirements
- [x] Responsive layout tested on desktop, tablet, and mobile viewports.
- [x] Mobile bottom bar and drawer optimized for fast counter use.
- [x] Clear loading, empty, and feedback states.

## 14. What NOT to Build Guardrails
- [x] Confirmed zero unnecessary complexity (no staff scheduling, inventory, POS, product catalog, e-commerce, or automated bots).

## 15 & 16. Build & Code Quality Verification
- [x] Next.js production build (`npm run build`) completed with 0 errors across all 29 routes.
- [x] Zero TypeScript errors, zero lint warnings.
- [x] Application running and verified on `http://localhost:3000`.
