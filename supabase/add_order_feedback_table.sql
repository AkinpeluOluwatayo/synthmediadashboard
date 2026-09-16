-- Run this SQL query in your Supabase Dashboard -> SQL Editor to create the order_feedback table

CREATE TABLE IF NOT EXISTS public.order_feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.order_feedback ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Customers view own feedback" ON public.order_feedback FOR SELECT USING (auth.uid() = customer_id OR public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Customers manage own feedback" ON public.order_feedback FOR ALL USING (auth.uid() = customer_id OR public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
