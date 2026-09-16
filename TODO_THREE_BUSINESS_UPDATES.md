<!--
Importers/Callers: Project tracking and documentation file for development roadmap.
Affected API: None (Markdown documentation).
Data Schemas: 4 update areas from C:\AI\Revia\three_businesses_docx_extracted.txt (Pricing, PG Flow, Gym Flow + QR Attendance, Clothing Shop CRM).
User's Verbatim Instruction: "c:\AI\Revia_Final_All_Three_Business_Updates_Claude_Code_Prompt.docx now this make todo and complete updaate"
-->

# REVIA — THREE BUSINESSES & PRICING UPDATE IMPLEMENTATION TODO LIST
Source: `C:\AI\Revia\three_businesses_docx_extracted.txt`

## Importers/Callers
- Development tracking and audit trail for multi-business updates.

## Affected API
- No direct API changes; references `src/lib/types.ts`, `src/lib/seedData.ts`, `src/app/onboarding/page.tsx`, `src/app/dashboard/page.tsx`, `src/app/profile/page.tsx`, `src/app/admin/page.tsx`, and new business-specific components.

## Data Schemas
- SubscriptionPlan prices (+₹200).
- PG: Resident model, room/bed schema, billing cycles (Monthly, Half-Monthly, Yearly), dynamic days left.
- Gym: Member model, membership plans, QR Attendance check-in model.
- Clothing Shop: Customer CRM model, spending analytics, segments, new collection WhatsApp templates.

## User's Verbatim Instruction
"c:\AI\Revia_Final_All_Three_Business_Updates_Claude_Code_Prompt.docx now this make todo and complete updaate"

---

## 1. Global Subscription Price Increase (+₹200)
- [ ] Inspect actual subscription prices in `src/lib/seedData.ts`.
- [ ] Increase each plan by exactly ₹200 (Starter: 299 -> 499, Growth: 599 -> 799, Pro: 999 -> 1199).
- [ ] Update frontend displayed prices (e.g., `profile/page.tsx`, `admin/page.tsx`, `settings`, `store.ts`, `seedData.ts`).
- [ ] Ensure checkout/UPI payment amounts use the new prices (no double increases).

## 2. PG (Paying Guest) Business Flow
**Activates ONLY when `business_type = pg_hostel`**
- [ ] Update IndustryType in `types.ts` to include `pg_hostel`.
- [ ] Implement PG Owner Setup in Onboarding (`src/app/onboarding/page.tsx`).
- [ ] Create PG-specific interfaces/schemas in `types.ts` (PG Resident, Payment Cycles, Rooms/Beds if applicable).
- [ ] Build **PG Resident Management** (`/pg-residents` or adapted `/customers`): Add, View, Edit, Delete residents with Month/Half-Month/Year payment cycles.
- [ ] Implement **PG Payment Logic**: Dynamic next due date calculator and "Days Left".
- [ ] Create **PG Dashboard** (`/dashboard` condition): Total Residents, Occupied/Available Beds, Occupancy %, Payments Collected, Pending/Overdue.
- [ ] Support Room/Bed assignment model.
- [ ] Enforce Roles (Owner vs Manager restrictions).
- [ ] Enforce Security/RLS (Tenant isolation for PG records).

## 3. Gym Flow & QR Attendance
**Activates ONLY when `business_type = gym`**
- [ ] Enhance Gym Owner Setup in Onboarding.
- [ ] Create Gym-specific interfaces/schemas (Memberships, Attendance).
- [ ] Create **Gym Dashboard**: Members (Active, Expiring, Expired), Today's Check-ins, Revenue, Member Growth.
- [ ] Build **Gym Member Management**: Add, View, Edit members with memberships (Monthly, 3 Mo, 6 Mo, Yearly) and Expiry Date.
- [ ] Implement existing manual attendance tracking + **QR Attendance**.
- [ ] Create **Gym QR Code** UI for Counter/Dashboard.
- [ ] Implement **Mobile Check-in Page** (`/gym-checkin/[businessId]`): Mobile-friendly, phone number lookup, member verification.
- [ ] Implement **Check-in Validation Engine**: Check if active, not expired, duplicates prevention.
- [ ] Update dashboard in real time upon check-in.
- [ ] Enforce security (RLS, invalid QR rejection).

## 4. Clothing Shop CRM
**Activates ONLY when `business_type = clothing`**
- [ ] Update IndustryType to include `clothing`.
- [ ] Implement Clothing Setup in Onboarding.
- [ ] Create **Clothing Dashboard**: Total Customers, Revenue, Repeat stats, High Value / Inactive segments (NO e-commerce/POS elements).
- [ ] Build **Customer Spending Analytics**: Today/Week/Month/Year filtering, Top Customers Leaderboard.
- [ ] Implement Customer Profiles with purchase history logging.
- [ ] Integrate closely with old **WhatsApp Tab**: Push segments to WhatsApp tab (High Value, Inactive, New Stock Update).
- [ ] Add New Stock Arrival/Festival templates to `seedData.ts` and UI.
- [ ] Do NOT build POS, Product inventory, or Cart structures.

## 5. Security & Multi-Tenant Rules
- [ ] Verify Supabase authentication is not disrupted.
- [ ] Verify Gym features don't leak into PG or Clothing, and vice versa.
- [ ] Verify existing Salon, Hotel, Restaurant, Retail flows remain perfectly intact.
- [ ] Audit RLS policies for newly designed tables.

## 6. Build & Quality Verification
- [ ] Run `npm run lint`.
- [ ] Run `npm run build` and ensure exactly 0 TypeScript errors.
- [ ] Final UI/UX responsive check.
