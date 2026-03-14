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
