-- Zero to Shipped: Database Schema
-- Run this in Supabase SQL Editor

-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  role_track text check (role_track in ('pm', 'pjm', 'ba', 'bi')),
  tool_preference text not null default 'claude-code' check (tool_preference in ('claude-code', 'cursor')),
  xp integer not null default 0,
  level text not null default 'Novice',
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_activity_date date,
  public_profile boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Module progress
create table public.module_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  module_number integer not null check (module_number between 1 and 16),
  status text not null default 'locked' check (status in ('locked', 'available', 'in_progress', 'completed')),
  started_at timestamptz,
  completed_at timestamptz,
  unique (user_id, module_number)
);

-- Checkpoint progress
create table public.checkpoint_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  module_number integer not null,
  checkpoint_index integer not null,
  completed boolean not null default false,
  completed_at timestamptz,
  unique (user_id, module_number, checkpoint_index)
);

-- Badges
create table public.badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_slug text not null,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_slug)
);

-- XP events log
create table public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null check (event_type in ('checkpoint', 'module_complete', 'tier_complete', 'capstone', 'streak_bonus', 'badge_earned')),
  xp_amount integer not null,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_module_progress_user on public.module_progress(user_id);
create index idx_checkpoint_progress_user on public.checkpoint_progress(user_id);
create index idx_badges_user on public.badges(user_id);
create index idx_xp_events_user on public.xp_events(user_id);
create index idx_xp_events_created on public.xp_events(created_at);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.module_progress enable row level security;
alter table public.checkpoint_progress enable row level security;
alter table public.badges enable row level security;
alter table public.xp_events enable row level security;

-- Profiles: users can read/update own, public profiles visible to all
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);
create policy "Public profiles are viewable" on public.profiles
  for select using (public_profile = true);

-- Module progress: users can CRUD own
create policy "Users can manage own module progress" on public.module_progress
  for all using (auth.uid() = user_id);

-- Checkpoint progress: users can CRUD own
create policy "Users can manage own checkpoint progress" on public.checkpoint_progress
  for all using (auth.uid() = user_id);

-- Badges: users can read own, insert own
create policy "Users can view own badges" on public.badges
  for select using (auth.uid() = user_id);
create policy "Users can earn badges" on public.badges
  for insert with check (auth.uid() = user_id);
create policy "Public badges are viewable" on public.badges
  for select using (
    exists (select 1 from public.profiles where id = badges.user_id and public_profile = true)
  );

-- XP events: users can read/insert own
create policy "Users can view own xp events" on public.xp_events
  for select using (auth.uid() = user_id);
create policy "Users can log xp events" on public.xp_events
  for insert with check (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  );
  -- Seed module progress: module 1 available, rest locked
  insert into public.module_progress (user_id, module_number, status)
  select new.id, generate_series(1, 16), 'locked';
  update public.module_progress
  set status = 'available'
  where user_id = new.id and module_number = 1;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Streak calculation RPC
-- Migration: Username column for public profiles
-- Run manually: ALTER TABLE profiles ADD COLUMN username text UNIQUE;
-- CREATE INDEX idx_profiles_username ON profiles(username);

-- Migration: Waitlist table for premium launch
-- Run manually:
-- CREATE TABLE public.waitlist (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   email text NOT NULL UNIQUE,
--   created_at timestamptz NOT NULL DEFAULT now()
-- );
-- ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Anyone can join waitlist" ON public.waitlist FOR INSERT WITH CHECK (true);

-- Migration: Subscription tier
-- Run manually: ALTER TABLE profiles ADD COLUMN subscription_tier text NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium'));

-- Streak calculation RPC
create or replace function public.update_streak(p_user_id uuid)
returns void as $$
declare
  v_last_date date;
  v_today date := current_date;
  v_streak integer;
  v_longest integer;
begin
  select last_activity_date, current_streak, longest_streak
  into v_last_date, v_streak, v_longest
  from public.profiles
  where id = p_user_id;

  if v_last_date = v_today then
    -- Already active today, no change
    return;
  elsif v_last_date = v_today - 1 then
    -- Consecutive day
    v_streak := v_streak + 1;
  else
    -- Streak broken (or first activity)
    v_streak := 1;
  end if;

  if v_streak > v_longest then
    v_longest := v_streak;
  end if;

  update public.profiles
  set current_streak = v_streak,
      longest_streak = v_longest,
      last_activity_date = v_today,
      updated_at = now()
  where id = p_user_id;
end;
$$ language plpgsql security definer;
