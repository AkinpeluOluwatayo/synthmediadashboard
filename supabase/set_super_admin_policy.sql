-- ============================================================
-- SUPER ADMIN ROLE PROMOTION SECURITY MIGRATION
-- Account: akinpeluoluwatayo1235@gmail.com (Super Admin)
-- ============================================================

-- 1. Helper function to check if current user is Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
      AND role = 'admin' 
      AND LOWER(email) = 'akinpeluoluwatayo1235@gmail.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Grant Super Admin exclusive right to update profile roles
DO $$ BEGIN
  DROP POLICY IF EXISTS "Super Admin manage roles" ON public.profiles;
  CREATE POLICY "Super Admin manage roles" ON public.profiles 
    FOR UPDATE USING (public.is_super_admin() OR auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
