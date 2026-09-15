-- ==============================================================================
-- Small Business Customer Return SaaS - Multi-Tenant Supabase RLS Schema
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Businesses (Workspaces)
create table if not exists public.businesses (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  industry text not null check (industry in ('restaurant', 'cafe', 'hotel', 'retail', 'gym', 'salon_spa', 'clinic', 'other')),
  owner_name text not null,
  owner_email text not null,
  phone text not null,
  currency text not null default 'INR',
  currency_symbol text not null default '₹',
  address text,
  trial_start_date timestamptz not null default now(),
  trial_end_date timestamptz not null default (now() + interval '14 days'),
  subscription_status text not null default 'trialing' check (subscription_status in ('trialing', 'active', 'past_due', 'canceled', 'expired')),
  subscription_plan text not null default 'growth' check (subscription_plan in ('starter', 'growth', 'pro')),
  default_comeback_discount integer not null default 15,
  whatsapp_signature text not null default '',
  qr_loyalty_perk text default 'Get 10% OFF on your next visit!',
  is_suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Users (Auth Profile & Role mapping)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null default 'owner' check (role in ('owner', 'manager', 'staff', 'superadmin')),
  avatar_url text,
  created_at timestamptz not null default now()
);

-- 3. Customers
create table if not exists public.customers (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  phone text not null,
  is_anonymous boolean not null default false,
  segment text not null default 'new' check (segment in ('new', 'regular', 'vip', 'becoming_inactive', 'inactive')),
  total_visits integer not null default 1,
  total_spend numeric(12, 2) not null default 0.00,
  avg_bill numeric(12, 2) not null default 0.00,
  avg_visit_interval_days integer not null default 0,
  first_visit_date timestamptz not null default now(),
  last_visit_date timestamptz not null default now(),
  notes text,
  tags text[] default array[]::text[],
  favorite_items text[] default array[]::text[],
  opt_in_source text default 'staff_entry' check (opt_in_source in ('counter_qr', 'staff_entry', 'online')),
  created_at timestamptz not null default now()
);

-- Index for instant phone number lookup
create index if not exists idx_customers_phone on public.customers(business_id, phone);
create index if not exists idx_customers_segment on public.customers(business_id, segment);

-- 4. Visits
create table if not exists public.visits (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  customer_name text,
  customer_phone text,
  amount numeric(12, 2) not null default 0.00,
  is_anonymous boolean not null default false,
  notes text,
  items text[] default array[]::text[],
  date timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_visits_date on public.visits(business_id, date);

-- 5. WhatsApp Templates
create table if not exists public.whatsapp_templates (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.businesses(id) on delete cascade, -- null = global default template
  name text not null,
  category text not null check (category in ('thank_you', 'comeback', 'vip_offer', 'reminder', 'festival')),
  message text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- 6. WhatsApp Logs & Campaign Return Tracking
create table if not exists public.whatsapp_logs (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  customer_name text not null,
  customer_phone text not null,
  template_name text not null,
  message_sent text not null,
  status text not null default 'sent' check (status in ('sent', 'opened', 'returned')),
  sent_at timestamptz not null default now(),
  return_recorded_at timestamptz,
  return_revenue numeric(12, 2) default 0.00
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES - STRICT MULTI-TENANT ISOLATION
-- ==============================================================================

alter table public.businesses enable row level security;
alter table public.users enable row level security;
alter table public.customers enable row level security;
alter table public.visits enable row level security;
alter table public.whatsapp_templates enable row level security;
alter table public.whatsapp_logs enable row level security;

-- Helper function to fetch current authenticated user's business_id
create or replace function public.current_user_business_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select business_id from public.users where id = auth.uid() limit 1;
$$;

-- Businesses Policies
drop policy if exists "Users can view their own business" on public.businesses;
create policy "Users can view their own business"
  on public.businesses for select
  using (id = public.current_user_business_id());

drop policy if exists "Owners can update their own business" on public.businesses;
create policy "Owners can update their own business"
  on public.businesses for update
  using (id = public.current_user_business_id());

drop policy if exists "Owners can create their business" on public.businesses;
create policy "Owners can create their business"
  on public.businesses for insert
  with check (auth.uid() is not null);

-- Users Policies
drop policy if exists "Users can view team members in their business" on public.users;
create policy "Users can view team members in their business"
  on public.users for select
  using (business_id = public.current_user_business_id());

drop policy if exists "Users can insert their own profile" on public.users;
create policy "Users can insert their own profile"
  on public.users for insert
  with check (id = auth.uid());

-- Customers Policy
drop policy if exists "Users can view and manage customers in their business" on public.customers;
create policy "Users can view and manage customers in their business"
  on public.customers for all
  using (business_id = public.current_user_business_id());

-- Visits Policy
drop policy if exists "Users can view and manage visits in their business" on public.visits;
create policy "Users can view and manage visits in their business"
  on public.visits for all
  using (business_id = public.current_user_business_id());

-- WhatsApp Templates Policy
drop policy if exists "Users can view global and business templates" on public.whatsapp_templates;
create policy "Users can view global and business templates"
  on public.whatsapp_templates for select
  using (business_id is null or business_id = public.current_user_business_id());

drop policy if exists "Users can manage custom templates for their business" on public.whatsapp_templates;
create policy "Users can manage custom templates for their business"
  on public.whatsapp_templates for all
  using (business_id = public.current_user_business_id());

-- WhatsApp Logs Policy
drop policy if exists "Users can view and log WhatsApp messages in their business" on public.whatsapp_logs;
create policy "Users can view and log WhatsApp messages in their business"
  on public.whatsapp_logs for all
  using (business_id = public.current_user_business_id());
