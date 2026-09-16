-- Importers/Callers: Supabase SQL Editor / Database Migration
-- Affected API: public.businesses (industry check constraint)
-- Data Schemas: Business from src/lib/types.ts
-- User's Verbatim Instruction: "new row for relation \"businesses\" violates check constraint \"businesses_industry_check\" problem occure in Set Up Your Business Step 3 of 3"

-- Drop the old constraint that only allowed original industries
ALTER TABLE public.businesses DROP CONSTRAINT IF EXISTS businesses_industry_check;

-- Add updated constraint including pg_hostel and clothing
ALTER TABLE public.businesses ADD CONSTRAINT businesses_industry_check
CHECK (industry in ('restaurant', 'cafe', 'hotel', 'retail', 'gym', 'salon_spa', 'clinic', 'pg_hostel', 'clothing', 'other'));
