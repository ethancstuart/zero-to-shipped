-- =============================================================================
-- Zero to Ship — Combined Database Migrations (001 through 006)
--
-- This file combines all 6 individual migration scripts into a single
-- paste-ready SQL script for initializing or resetting the database schema.
-- Run this in the Supabase SQL Editor to apply all migrations at once.
--
-- Migrations included:
--   001_monetization.sql        — Waitlist table, subscription tier, Stripe customer ID
--   002_referral_and_nurture.sql — Referral codes, nurture tracking, handle_new_user()
--   003_atomic_xp.sql           — Atomic XP increment function, XP event index, public profiles RLS
--   004_performance.sql         — Event type constraint fix, idempotency tables, query indexes
--   005_ship_readiness.sql      — Email opt-out and welcome email flags
--   006_github_username.sql     — GitHub username on profiles, capstone URL on module_progress
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 001_monetization.sql
-- -----------------------------------------------------------------------------

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


-- -----------------------------------------------------------------------------
-- 002_referral_and_nurture.sql
-- -----------------------------------------------------------------------------

-- Referral columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES profiles(id);

-- Generate referral codes for existing users
UPDATE profiles SET referral_code = substr(md5(id::text || now()::text), 1, 8)
WHERE referral_code IS NULL;

-- Nurture tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nurture_emails_sent integer[] NOT NULL DEFAULT '{}';

-- Update handle_new_user() to include referral_code generation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, referral_code)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Learner'),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    substr(md5(new.id::text || now()::text), 1, 8)
  );
  -- Seed module progress
  INSERT INTO module_progress (user_id, module_number, status)
  SELECT new.id, m.number, CASE WHEN m.number = 1 THEN 'available' ELSE 'locked' END
  FROM unnest(ARRAY[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]) AS m(number);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- -----------------------------------------------------------------------------
-- 003_atomic_xp.sql
-- -----------------------------------------------------------------------------

-- Atomic XP increment to prevent race conditions on concurrent checkpoint completions
CREATE OR REPLACE FUNCTION increment_xp(p_user_id uuid, p_amount int)
RETURNS TABLE(old_xp int, new_xp int, old_level text, new_level text) AS $$
DECLARE
  v_old_xp int;
  v_new_xp int;
  v_old_level text;
  v_new_level text;
BEGIN
  SELECT xp, level INTO v_old_xp, v_old_level
  FROM profiles WHERE id = p_user_id FOR UPDATE;

  v_new_xp := v_old_xp + p_amount;

  -- Level thresholds: Novice(0), Builder(500), Shipper(1200), Master(2000)
  v_new_level := CASE
    WHEN v_new_xp >= 2000 THEN 'Master'
    WHEN v_new_xp >= 1200 THEN 'Shipper'
    WHEN v_new_xp >= 500 THEN 'Builder'
    ELSE 'Novice'
  END;

  UPDATE profiles SET xp = v_new_xp, level = v_new_level WHERE id = p_user_id;

  RETURN QUERY SELECT v_old_xp, v_new_xp, v_old_level, v_new_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Index for streak bonus queries that filter on metadata->>'milestone'
CREATE INDEX IF NOT EXISTS idx_xp_events_metadata
ON xp_events USING GIN (metadata);

-- RLS policy for public profile viewing (used by public profile page)
CREATE POLICY "Public profiles are viewable"
ON profiles FOR SELECT
USING (public_profile = true);


-- -----------------------------------------------------------------------------
-- 004_performance.sql
-- -----------------------------------------------------------------------------

-- Phase 0: Fix xp_events CHECK constraint to include referral event types
ALTER TABLE xp_events DROP CONSTRAINT IF EXISTS xp_events_event_type_check;
ALTER TABLE xp_events ADD CONSTRAINT xp_events_event_type_check
  CHECK (event_type IN ('checkpoint', 'module_complete', 'tier_complete', 'capstone', 'streak_bonus', 'badge_earned', 'referral_bonus', 'referral_reward'));

-- Phase 1A: Stripe webhook idempotency
CREATE TABLE IF NOT EXISTS processed_events (
  id text PRIMARY KEY,
  event_type text,
  processed_at timestamptz DEFAULT now()
);

-- Phase 1B: Cron job deduplication locks
CREATE TABLE IF NOT EXISTS cron_locks (
  lock_name text PRIMARY KEY,
  acquired_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- Phase 2A: Database indexes for query optimization

-- Leaderboard: public profiles ordered by XP
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_leaderboard
  ON profiles (public_profile, xp DESC) WHERE public_profile = true;

-- Leaderboard rank: count users with higher XP
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_xp
  ON profiles (xp);

-- Engine: checkpoint queries by module
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_checkpoint_progress_module
  ON checkpoint_progress (user_id, module_number);

-- Engine: idempotency checks by event type
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_xp_events_user_type
  ON xp_events (user_id, event_type);


-- -----------------------------------------------------------------------------
-- 005_ship_readiness.sql
-- -----------------------------------------------------------------------------

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_opt_out boolean NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS welcome_email_sent boolean NOT NULL DEFAULT false;


-- -----------------------------------------------------------------------------
-- 006_github_username.sql
-- -----------------------------------------------------------------------------

-- Add GitHub username to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_username text;

-- Add capstone URL to module_progress for Module 16 builds
ALTER TABLE module_progress ADD COLUMN IF NOT EXISTS capstone_url text;
