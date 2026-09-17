-- ==============================================================================
-- DATABASE RESET SCRIPT - Deletes ALL data from ALL tables
-- WARNING: This is IRREVERSIBLE. Back up any data you need first.
-- 
-- HOW TO USE:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Paste this entire script
-- 3. Click "Run"
--
-- AFTER RUNNING THIS SCRIPT:
-- You must also delete all auth users from the Supabase Dashboard:
-- Go to Authentication → Users → Select All → Delete
-- ==============================================================================

-- Disable triggers temporarily to avoid cascade issues during truncation
SET session_replication_role = 'replica';

-- Delete all data from tables (order matters due to foreign keys)
TRUNCATE TABLE public.whatsapp_logs CASCADE;
TRUNCATE TABLE public.whatsapp_templates CASCADE;
TRUNCATE TABLE public.visits CASCADE;
TRUNCATE TABLE public.customers CASCADE;
TRUNCATE TABLE public.users CASCADE;
TRUNCATE TABLE public.businesses CASCADE;

-- Also clear any platform settings or subscription payments if they exist as tables
-- (These are stored in localStorage but just in case)
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'platform_settings') THEN
    TRUNCATE TABLE public.platform_settings CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'subscription_payments') THEN
    TRUNCATE TABLE public.subscription_payments CASCADE;
  END IF;
END $$;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Verify all tables are empty
SELECT 'businesses' as tbl, count(*) as rows FROM public.businesses
UNION ALL
SELECT 'users', count(*) FROM public.users
UNION ALL
SELECT 'customers', count(*) FROM public.customers
UNION ALL
SELECT 'visits', count(*) FROM public.visits
UNION ALL
SELECT 'whatsapp_templates', count(*) FROM public.whatsapp_templates
UNION ALL
SELECT 'whatsapp_logs', count(*) FROM public.whatsapp_logs;
