-- Add Explorer (250 XP) and Architect (1500 XP) levels to the XP progression
-- Full progression: Novice(0) → Explorer(250) → Builder(500) → Shipper(1200) → Architect(1500) → Master(2000)

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

  -- Level thresholds: Novice(0), Explorer(250), Builder(500), Shipper(1200), Architect(1500), Master(2000)
  v_new_level := CASE
    WHEN v_new_xp >= 2000 THEN 'Master'
    WHEN v_new_xp >= 1500 THEN 'Architect'
    WHEN v_new_xp >= 1200 THEN 'Shipper'
    WHEN v_new_xp >= 500 THEN 'Builder'
    WHEN v_new_xp >= 250 THEN 'Explorer'
    ELSE 'Novice'
  END;

  UPDATE profiles SET xp = v_new_xp, level = v_new_level WHERE id = p_user_id;

  RETURN QUERY SELECT v_old_xp, v_new_xp, v_old_level, v_new_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill existing profiles to correct level based on new thresholds
UPDATE profiles SET level = CASE
  WHEN xp >= 2000 THEN 'Master'
  WHEN xp >= 1500 THEN 'Architect'
  WHEN xp >= 1200 THEN 'Shipper'
  WHEN xp >= 500 THEN 'Builder'
  WHEN xp >= 250 THEN 'Explorer'
  ELSE 'Novice'
END;
