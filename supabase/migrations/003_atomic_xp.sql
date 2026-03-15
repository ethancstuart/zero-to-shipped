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
