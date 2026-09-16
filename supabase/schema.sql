-- ============================================================
-- SYNTH MEDIA AGENCY CUSTOMER PORTAL COMPLETE DATABASE SCHEMA
-- ============================================================

-- 0. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Stores Customers & Admins linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  business_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SERVICES TABLE (Agency Pillars: CREATIVE, DIGITAL GROWTH, TECHNOLOGY)
CREATE TABLE IF NOT EXISTS public.services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('CREATIVE', 'DIGITAL GROWTH', 'TECHNOLOGY')),
  description TEXT NOT NULL,
  image_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  custom_consultation BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS custom_consultation BOOLEAN DEFAULT FALSE;

-- 3. PACKAGES TABLE (Basic, Standard, Premium packages with Paystack links)
CREATE TABLE IF NOT EXISTS public.packages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'NGN',
  features JSONB DEFAULT '[]'::jsonb,
  revisions INTEGER DEFAULT 1,
  delivery_days INTEGER DEFAULT 3,
  paystack_link TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.packages 
ADD COLUMN IF NOT EXISTS paystack_link TEXT;

-- 4. ORDERS TABLE (Customer service orders and status tracking)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE RESTRICT NOT NULL,
  package_id UUID REFERENCES public.packages(id) ON DELETE RESTRICT,
  project_title TEXT NOT NULL,
  project_description TEXT NOT NULL,
  instructions TEXT,
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'PENDING_PAYMENT' CHECK (status IN ('PENDING_PAYMENT', 'PAID', 'AWAITING_INFORMATION', 'IN_PRODUCTION', 'IN_REVIEW', 'COMPLETED', 'CANCELLED')),
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'NGN',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders 
ALTER COLUMN package_id DROP NOT NULL;

-- 5. ORDER FILES TABLE
CREATE TABLE IF NOT EXISTS public.order_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT,
  file_type TEXT,
  file_size BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  reference TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'successful', 'failed', 'refunded')),
  provider TEXT DEFAULT 'paystack',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. DELIVERABLES TABLE
CREATE TABLE IF NOT EXISTS public.deliverables (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  storage_provider TEXT DEFAULT 'supabase',
  external_file_id TEXT,
  released BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ADMIN NOTES TABLE
CREATE TABLE IF NOT EXISTS public.admin_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  admin_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ORDER FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS public.order_feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN
  CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins full access profiles" ON public.profiles FOR ALL USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active services" ON public.services FOR SELECT USING (active = TRUE OR public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins full access services" ON public.services FOR ALL USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active packages" ON public.packages FOR SELECT USING (active = TRUE OR public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins full access packages" ON public.packages FOR ALL USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Customers can view own orders" ON public.orders FOR SELECT USING (auth.uid() = customer_id OR public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Customers can create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins full access orders" ON public.orders FOR ALL USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Customers view own order files" ON public.order_files FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_files.order_id AND orders.customer_id = auth.uid()) OR public.is_admin()
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Customers insert own order files" ON public.order_files FOR INSERT WITH CHECK (auth.uid() = uploaded_by);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Customers view own payments" ON public.payments FOR SELECT USING (auth.uid() = customer_id OR public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins full access payments" ON public.payments FOR ALL USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Customers view released deliverables for own orders" ON public.deliverables FOR SELECT USING (
    (released = TRUE AND EXISTS (SELECT 1 FROM public.orders WHERE orders.id = deliverables.order_id AND orders.customer_id = auth.uid())) OR public.is_admin()
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins full access deliverables" ON public.deliverables FOR ALL USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.order_feedback ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Admins full access admin_notes" ON public.admin_notes FOR ALL USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Customers view own feedback" ON public.order_feedback FOR SELECT USING (auth.uid() = customer_id OR public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Customers manage own feedback" ON public.order_feedback FOR ALL USING (auth.uid() = customer_id OR public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- TRIGGER ON SIGNUP
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
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- POPULATE / REFRESH SERVICES SEED DATA (VALID HEX UUIDs)
-- ============================================================

DELETE FROM public.packages;
DELETE FROM public.services;

INSERT INTO public.services (id, name, slug, category, description, image_url, active, custom_consultation)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Graphic Design', 'graphic-design', 'CREATIVE', 'High-impact creative graphic design tailored for brands, campaigns, and events.', 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=600', true, false),
  ('22222222-2222-2222-2222-222222222222', 'Social Media Content', 'social-media-content', 'DIGITAL GROWTH', 'Comprehensive monthly social media graphics, video reels, captions, and management.', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=600', true, false),
  ('33333333-3333-3333-3333-333333333333', 'Brand Identity', 'brand-identity', 'CREATIVE', 'Complete corporate brand identity systems, logos, palettes, and stationery assets.', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=600', true, false),
  ('44444444-4444-4444-4444-444444444444', 'Video Content Creation', 'video-content-creation', 'CREATIVE', 'Standalone promotional video creation and short-form video production.', 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=600', true, false),
  ('55555555-5555-5555-5555-555555555555', 'Tech Support & Managed Infrastructure', 'tech-support-service', 'TECHNOLOGY', 'Custom technical infrastructure support, system monitoring, cloud setup & web maintenance.', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600', true, true),
  ('66666666-6666-6666-6666-666666666666', 'Full Enterprise Agency Partnership', 'enterprise-partnership', 'DIGITAL GROWTH', 'Dedicated multi-channel retainer team for full-scale growth, technology, and branding.', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600', true, true);

-- ============================================================
-- POPULATE / REFRESH PACKAGES SEED DATA WITH PAYSTACK LINKS
-- ============================================================

INSERT INTO public.packages (service_id, name, description, price, currency, features, revisions, delivery_days, paystack_link)
VALUES
  -- Graphic Design
  ('11111111-1111-1111-1111-111111111111', 'BASIC Graphic Design', 'Single flyer design with fast delivery.', 10000, 'NGN', '["1 Flyer", "1 Design Concept", "1 Revision Iteration", "JPG/PNG Delivery"]'::jsonb, 1, 2, 'https://paystack.shop/pay/au2angjyre'),
  ('11111111-1111-1111-1111-111111111111', 'STANDARD Graphic Design', 'Two flyer designs with PDF and priority delivery.', 20000, 'NGN', '["2 Flyers", "2 Design Concepts", "2 Revision Iterations", "JPG/PNG + PDF Formats", "Priority Delivery"]'::jsonb, 2, 2, 'https://paystack.shop/pay/g5tcfugcn3'),
  ('11111111-1111-1111-1111-111111111111', 'PREMIUM Graphic Design', 'Four flyers with multiple concepts and social media optimization.', 35000, 'NGN', '["4 Flyers", "2 Design Concepts per flyer", "Up to 3 Revisions", "JPG/PNG + PDF Formats", "Social-Media Optimized Versions"]'::jsonb, 3, 3, 'https://paystack.shop/pay/szh231e95j'),

  -- Social Media Content
  ('22222222-2222-2222-2222-222222222222', 'STARTER Monthly Content', '8 custom graphics, captions and basic planning.', 30000, 'NGN', '["8 Custom Graphics", "4 Engaging Captions", "Basic Content Planning"]'::jsonb, 2, 30, 'https://paystack.shop/pay/1pfypkmakp'),
  ('22222222-2222-2222-2222-222222222222', 'GROWTH Monthly Content', '12 graphics, 4 short video reels, captions & calendar.', 60000, 'NGN', '["12 Custom Graphics", "4 Short Videos / Reels", "Professional Captions", "Strategic Content Calendar"]'::jsonb, 3, 30, 'https://paystack.shop/pay/u2p-6h00ht'),
  ('22222222-2222-2222-2222-222222222222', 'PRO Monthly Content & Management', '20 graphics, 8 reels, full calendar & page management.', 100000, 'NGN', '["20 Custom Graphics", "8 Video Reels", "Professional Captions", "Content Calendar", "Full Page Management"]'::jsonb, 5, 30, 'https://paystack.shop/pay/retrttq0-4'),

  -- Brand Identity
  ('33333333-3333-3333-3333-333333333333', 'Branding Starter', 'Essential brand logo and stationery pack.', 60000, 'NGN', '["Primary Logo Design", "Business Card Design", "Corporate Letterhead", "Social Media Profile Image", "2 Revision Iterations"]'::jsonb, 2, 5, 'https://paystack.shop/pay/ry6afkacpn'),
  ('33333333-3333-3333-3333-333333333333', 'COMPLETE BRAND Package', 'Full identity system, guidelines, typography & social templates.', 120000, 'NGN', '["Primary & Secondary Logo", "Brand Colour Palette", "Typography System", "Business Card & Letterhead", "Social Media Templates", "Brand Guidelines Manual"]'::jsonb, 4, 10, 'https://paystack.shop/pay/wi9lyt0aeb'),

  -- Video Content Alone
  ('44444444-4444-4444-4444-444444444444', 'Single Video Content', 'Standalone short video or promotional reel creation.', 15000, 'NGN', '["1 Promotional Video / Reel", "High Definition Export", "Motion Graphics & Captions"]'::jsonb, 2, 3, 'https://paystack.shop/pay/ba1cdf7e8o');

-- ============================================================
-- SET ADMIN USER ROLE
-- ============================================================
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'akinpeluoluwatayo1235@gmail.com';
