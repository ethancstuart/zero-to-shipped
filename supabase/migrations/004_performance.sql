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
