-- Allow business creation during onboarding
DROP POLICY IF EXISTS "Owners can create their business" ON public.businesses;
CREATE POLICY "Owners can create their business"
  ON public.businesses FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow user profile creation during onboarding
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (id = auth.uid());
