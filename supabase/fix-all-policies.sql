-- Drop ALL existing policies on these tables
DROP POLICY IF EXISTS "Users can view their own business" ON public.businesses;
DROP POLICY IF EXISTS "Owners can update their own business" ON public.businesses;
DROP POLICY IF EXISTS "Owners can create their business" ON public.businesses;
DROP POLICY IF EXISTS "Users can view team members in their business" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view and manage customers in their business" ON public.customers;
DROP POLICY IF EXISTS "Users can view and manage visits in their business" ON public.visits;
DROP POLICY IF EXISTS "Users can view global and business templates" ON public.whatsapp_templates;
DROP POLICY IF EXISTS "Users can manage custom templates for their business" ON public.whatsapp_templates;
DROP POLICY IF EXISTS "Users can view and log WhatsApp messages in their business" ON public.whatsapp_logs;

-- Recreate helper function
CREATE OR REPLACE FUNCTION public.current_user_business_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT business_id FROM public.users WHERE id = auth.uid() LIMIT 1;
$$;

-- Businesses: full access
CREATE POLICY "business_select" ON public.businesses FOR SELECT USING (id = public.current_user_business_id());
CREATE POLICY "business_insert" ON public.businesses FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "business_update" ON public.businesses FOR UPDATE USING (id = public.current_user_business_id());

-- Users: own profile
CREATE POLICY "users_select" ON public.users FOR SELECT USING (business_id = public.current_user_business_id());
CREATE POLICY "users_insert" ON public.users FOR INSERT WITH CHECK (id = auth.uid());

-- Customers: full access within business
CREATE POLICY "customers_all" ON public.customers FOR ALL USING (business_id = public.current_user_business_id());

-- Visits: full access within business
CREATE POLICY "visits_all" ON public.visits FOR ALL USING (business_id = public.current_user_business_id());

-- Templates: global + business
CREATE POLICY "templates_select" ON public.whatsapp_templates FOR SELECT USING (business_id IS NULL OR business_id = public.current_user_business_id());
CREATE POLICY "templates_all" ON public.whatsapp_templates FOR ALL USING (business_id = public.current_user_business_id());

-- WhatsApp logs: full access within business
CREATE POLICY "logs_all" ON public.whatsapp_logs FOR ALL USING (business_id = public.current_user_business_id());
