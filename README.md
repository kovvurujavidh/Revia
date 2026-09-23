<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=wave&color=0:09090b,50:7c3aed,100:06b6d4&height=220&section=header&text=REVIA&fontSize=48&fontColor=ffffff&fontAlignY=38&animation=fadeIn&desc=Customer%20Return%20Platform%20for%20Local%20Businesses&descAlignY=60&descAlign=62" alt="Revia header" />

  <h1>Revia</h1>
  <p><strong>Turn one-time visitors into returning customers.</strong></p>
  <p>A multi-tenant customer-return platform for local businesses — salons, gyms, PGs, clothing stores, restaurants and more.</p>

  <p>
    <a href="#features"><img src="https://img.shields.io/badge/Features-14b8a6?style=for-the-badge" alt="Features" /></a>
    <a href="#tech-stack"><img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" /></a>
    <a href="#tech-stack"><img src="https://img.shields.io/badge/Supabase-3fcf8e?style=for-the-badge&logo=supabase&logoColor=black" alt="Supabase" /></a>
    <a href="#getting-started"><img src="https://img.shields.io/badge/Get_Started-7c3aed?style=for-the-badge" alt="Get Started" /></a>
  </p>
</div>

<br/>

## Why Revia

Local businesses lose revenue quietly: a customer visits once, never comes
back, and nobody notices. Revia makes that visible.

It tracks every visit, segments customers automatically, and tells the owner
*who to contact today* — with the message already written.

| Without Revia | With Revia |
|---|---|
| Customer history in a notebook or memory | Searchable customer directory with visit + spend history |
| No idea who stopped coming | Automatic segments: `New`, `Regular`, `VIP`, `Becoming Inactive`, `Inactive` |
| Blanket discount blasts | Per-business WhatsApp win-back templates with dynamic discount tokens |
| Gut-feeling decisions | Revenue, retention and opportunity analytics per industry |

<br/>

## Features

### Customer intelligence
- **Automatic segmentation** — customers are classified from visit recency and frequency into five actionable segments.
- **Visit tracking** — amount, items, notes and date, with anonymous-visit support.
- **Opportunities** — a live list of customers worth contacting *right now*, generated from visit patterns.
- **Daily report** — a plain-language daily summary of what changed.

### Multi-industry dashboards
The same core data, presented for the business you actually run:

| Dashboard | Built for |
|---|---|
| `SalonDashboard` | Salons & spas |
| `GymDashboard` | Gyms & fitness studios |
| `PGDashboard` | PGs & hostels |
| `ClothingDashboard` | Clothing & retail |
| `MetricsGrid` + `RecentVisits` | Restaurants, cafés, hotels, clinics, general |

### Marketing that goes out the door
- **WhatsApp templates** with `{offer_discount}` token replacement, scoped to the active business.
- **QR loyalty check-in** (`qrcode.react`) so customers self-register at the counter.
- **UPI helpers** for payment references.

### Access control that matches reality
| Role | Can do |
|---|---|
| `owner` / `manager` | Everything — analytics, reports, settings, opportunities |
| `staff` | Data entry only: `/add-visit` and counter QR |
| `superadmin` | Platform-level admin panel |

Analytics, reports, opportunities and settings are gated so staff never see
numbers they shouldn't.

### Platform level
- Subscription plans (`starter` / `growth` / `pro`) with trial states and suspension.
- Cross-tenant industry breakdown, MRR/ARR and churn-risk KPIs in the admin panel.
- Per-industry onboarding and a public `join/[businessId]` entry point.

<br/>

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 15** (App Router) · **React 19** · **TypeScript 5** |
| Styling | **Tailwind CSS 4** — dark theme (`#09090b` base), gradient accents, glassmorphism |
| Database | **Supabase** (PostgreSQL) with **Row Level Security** |
| Auth | `@supabase/ssr` — email, staff login, admin login, password reset |
| Icons / UI | `lucide-react`, `clsx`, `tailwind-merge` |
| Utilities | `date-fns`, `qrcode.react` |

<br/>

## Data Model

Multi-tenant by design — every row is scoped to a `business_id`, and RLS
enforces it at the database layer rather than trusting the client.

```
businesses ──< users
     │
     ├──< customers ──< visits
     ├──< whatsapp_templates
     ├──< whatsapp_logs
     ├──< subscription_payments
     └──< gym_members / pg_residents / clothing_customers
```

**Supported industries:** `restaurant` · `cafe` · `hotel` · `retail` · `gym` ·
`salon_spa` · `clinic` · `pg_hostel` · `clothing` · `other`

Full DDL lives in [`supabase/schema.sql`](supabase/schema.sql).

<br/>

## Getting Started

### Prerequisites
- Node.js 18+ (20+ recommended)
- A [Supabase](https://supabase.com) project

### 1. Install

```bash
git clone https://github.com/kovvurujavidh/Revia.git
cd Revia
npm install
```

### 2. Configure environment

Copy the example and fill in your Supabase keys
(**Dashboard → Project Settings → API**):

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

> ⚠️ `.env.local` is git-ignored. Never commit real keys.

### 3. Create the database

Open the Supabase **SQL Editor** and run, in order:

1. `supabase/schema.sql` — tables, extensions and RLS policies
2. Any `supabase/fix-*.sql` patches relevant to your project state

This step is required — the app will not work against an empty database.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Action |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

<br/>

## Project Structure

```
Revia/
├── supabase/
│   ├── schema.sql            Core schema + RLS policies
│   └── fix-*.sql             Targeted patches
├── src/
│   ├── app/
│   │   ├── dashboard/        Industry-aware home
│   │   ├── analytics/        Retention & revenue analytics
│   │   ├── reports/          Reporting
│   │   ├── opportunities/    Customers worth contacting today
│   │   ├── customers/        Customer directory
│   │   ├── add-visit/        Visit entry + counter QR
│   │   ├── whatsapp/         Template composer & dispatch
│   │   ├── settings/         Business settings
│   │   ├── onboarding/       New-business setup
│   │   ├── auth/             Login / signup / reset / staff & admin login
│   │   ├── admin/            Platform admin (superadmin only)
│   │   ├── join/[businessId]/      Public join link
│   │   ├── gym-checkin/[businessId]/  Member check-in
│   │   └── api/              Auth, onboarding, staff, admin routes
│   ├── components/
│   │   ├── dashboard/        Per-industry dashboard components
│   │   ├── analytics/        Salon analytics
│   │   ├── add-visit/        CounterQRCode
│   │   └── layout/           Header, sidebar, mobile nav
│   ├── context/AppContext.tsx
│   └── lib/
│       ├── types.ts          All domain types
│       ├── store.ts          Data access layer
│       ├── intelligence.ts   Segmentation, opportunities, daily report
│       ├── gymUtils.ts / pgUtils.ts / upi.ts
│       └── supabase/client.ts
└── .env.example
```

<br/>

## Architecture Notes

**Segmentation is deterministic, not magic.** `lib/intelligence.ts` derives
segments, opportunities and the daily report from visit recency/frequency rules
— so results are explainable to a business owner, not a black box.

**Industry is a first-class concept.** Adding a business type means adding a
`IndustryType` union member and a dashboard component; the data layer stays
unchanged.

**Roles are enforced server-side.** API routes under `src/app/api/` verify role
before acting, and RLS provides a second layer underneath.

<br/>

## Limitations

Stated openly:
- Analytics and opportunity generation run on data already in Supabase — there is no background job scheduler yet.
- WhatsApp dispatch produces message previews and logs; live sending requires wiring a WhatsApp Business provider API.
- Subscription plans and trials are modelled and enforced in-app; payment collection is not integrated.

<br/>

## Author

**Kovvuru Javidh** — Data / MIS Analyst

- GitHub: [@kovvurujavidh](https://github.com/kovvurujavidh)
- LinkedIn: [kovvurujavidh](https://www.linkedin.com/in/kovvurujavidh/)
- Portfolio: [localbizz.dpdns.org](https://localbizz.dpdns.org/)

<br/>

<div align="sub">
  <sub>Built to help local businesses earn the second visit.</sub>
</div>
