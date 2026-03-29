-- Add GitHub username to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_username text;

-- Add capstone URL to module_progress for Module 16 builds
ALTER TABLE module_progress ADD COLUMN IF NOT EXISTS capstone_url text;
