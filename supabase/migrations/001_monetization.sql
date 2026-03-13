-- Phase 0C: Database migrations for monetization
-- Run this in Supabase SQL Editor before deploying

-- 1. Waitlist table (idempotent)
CREATE TABLE IF NOT EXISTS public.waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Anyone can join waitlist" ON public.waitlist FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Add subscription_tier to profiles
DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN subscription_tier text NOT NULL DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'premium'));
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- 3. Add Stripe customer ID to profiles
DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN stripe_customer_id text;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
