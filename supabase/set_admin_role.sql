-- ============================================================
-- MIGRATION: Set Admin Role for Specific Account
-- Account: akinpeluoluwatayo1235@gmail.com
-- ============================================================

-- 1. Update existing profile if account already exists in profiles
UPDATE public.profiles
SET role = 'admin', updated_at = NOW()
WHERE LOWER(email) = 'akinpeluoluwatayo1235@gmail.com';

-- 2. Update trigger to automatically assign 'admin' role if account is created in the future
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, business_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Valued Customer'),
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'business_name',
    CASE 
      WHEN LOWER(new.email) = 'akinpeluoluwatayo1235@gmail.com' THEN 'admin'
      ELSE 'customer'
    END
  )
  ON CONFLICT (id) DO UPDATE
  SET role = CASE 
    WHEN LOWER(EXCLUDED.email) = 'akinpeluoluwatayo1235@gmail.com' THEN 'admin'
    ELSE public.profiles.role
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
