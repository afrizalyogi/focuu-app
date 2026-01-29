-- ============================================
-- FOCUU DATABASE SCHEMA - COMPLETE
-- Run this in Supabase SQL Editor (Cloud > Run SQL)
-- ============================================

-- ============================================
-- STEP 1: CREATE ENUMS
-- ============================================

-- Create app_role enum for admin access (skip if exists)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- STEP 2: CREATE CORE TABLES
-- ============================================

-- 2a. User roles table (separate from profiles for security)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2b. Profiles table (if not exists - may already exist from auth setup)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  is_pro BOOLEAN DEFAULT false,
  trial_started_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'trial', 'pro', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add trial columns if they don't exist
DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free';
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

-- 2c. Sessions table for work session tracking
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL,
  timer_mode TEXT CHECK (timer_mode IN ('stopwatch', 'pomodoro')),
  energy_level TEXT CHECK (energy_level IN ('low', 'okay', 'high')),
  pressure_mode TEXT CHECK (pressure_mode IN ('push', 'steady', 'support')),
  completed BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- 2d. User analytics/behavior tracking table
CREATE TABLE IF NOT EXISTS public.user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  session_id TEXT,
  page TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- 2e. Onboarding preferences table
CREATE TABLE IF NOT EXISTS public.onboarding_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  energy_level TEXT CHECK (energy_level IN ('low', 'okay', 'high')),
  pressure_preference TEXT CHECK (pressure_preference IN ('push', 'steady', 'support')),
  initial_intent TEXT,
  completed_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.onboarding_preferences ENABLE ROW LEVEL SECURITY;

-- 2f. User preferences table (for music, background, etc)
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  music_url TEXT,
  background_url TEXT,
  background_type TEXT CHECK (background_type IN ('image', 'video', 'none')),
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'book')),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 2g. Daily streaks tracking
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_session_date DATE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- 2h. User settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  auto_start BOOLEAN DEFAULT false,
  work_hours_enabled BOOLEAN DEFAULT false,
  work_hours_start TIME,
  work_hours_end TIME,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'book')),
  sound_enabled BOOLEAN DEFAULT true,
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: SECURITY DEFINER FUNCTIONS
-- ============================================

-- 3a. Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 3b. Function to check if user has active trial or pro
CREATE OR REPLACE FUNCTION public.check_user_access(p_user_id UUID)
RETURNS TABLE (
  is_pro BOOLEAN,
  is_trial BOOLEAN,
  trial_days_remaining INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_record RECORD;
BEGIN
  SELECT p.is_pro, p.trial_started_at, p.trial_ends_at, p.subscription_status
  INTO profile_record
  FROM public.profiles p
  WHERE p.id = p_user_id;
  
  IF profile_record IS NULL THEN
    RETURN QUERY SELECT false, false, 0;
    RETURN;
  END IF;
  
  -- Check if pro
  IF profile_record.is_pro THEN
    RETURN QUERY SELECT true, false, 0;
    RETURN;
  END IF;
  
  -- Check if in trial
  IF profile_record.trial_ends_at IS NOT NULL AND profile_record.trial_ends_at > now() THEN
    RETURN QUERY SELECT 
      false, 
      true, 
      EXTRACT(DAY FROM (profile_record.trial_ends_at - now()))::INTEGER;
    RETURN;
  END IF;
  
  RETURN QUERY SELECT false, false, 0;
END;
$$;

-- 3c. Function to start trial for a user (1 day trial)
CREATE OR REPLACE FUNCTION public.start_trial(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    trial_started_at = now(),
    trial_ends_at = now() + INTERVAL '1 day',
    subscription_status = 'trial'
  WHERE id = p_user_id
    AND trial_started_at IS NULL;
  
  RETURN FOUND;
END;
$$;

-- 3d. Function to update user streak
CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  streak_record RECORD;
  today DATE := CURRENT_DATE;
  new_streak INTEGER;
BEGIN
  SELECT * INTO streak_record
  FROM public.user_streaks
  WHERE user_id = p_user_id;
  
  IF streak_record IS NULL THEN
    -- Create new streak record
    INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_session_date)
    VALUES (p_user_id, 1, 1, today);
    RETURN 1;
  END IF;
  
  IF streak_record.last_session_date = today THEN
    -- Already recorded today
    RETURN streak_record.current_streak;
  ELSIF streak_record.last_session_date = today - 1 THEN
    -- Consecutive day
    new_streak := streak_record.current_streak + 1;
    UPDATE public.user_streaks
    SET 
      current_streak = new_streak,
      longest_streak = GREATEST(longest_streak, new_streak),
      last_session_date = today,
      updated_at = now()
    WHERE user_id = p_user_id;
    RETURN new_streak;
  ELSE
    -- Streak broken
    UPDATE public.user_streaks
    SET 
      current_streak = 1,
      last_session_date = today,
      updated_at = now()
    WHERE user_id = p_user_id;
    RETURN 1;
  END IF;
END;
$$;

-- 3e. Function to handle new user registration (auto-start trial)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, trial_started_at, trial_ends_at, subscription_status)
  VALUES (
    NEW.id,
    NEW.email,
    now(),
    now() + INTERVAL '1 day',
    'trial'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for auto-creating profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 4: RLS POLICIES
-- ============================================

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- User roles policies
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;
CREATE POLICY "Only admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Sessions policies
DROP POLICY IF EXISTS "Users can manage own sessions" ON public.sessions;
CREATE POLICY "Users can manage own sessions" ON public.sessions
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all sessions" ON public.sessions;
CREATE POLICY "Admins can view all sessions" ON public.sessions
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- User analytics policies
DROP POLICY IF EXISTS "Users can insert own analytics" ON public.user_analytics;
CREATE POLICY "Users can insert own analytics" ON public.user_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can view own analytics" ON public.user_analytics;
CREATE POLICY "Users can view own analytics" ON public.user_analytics
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all analytics" ON public.user_analytics;
CREATE POLICY "Admins can view all analytics" ON public.user_analytics
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Onboarding preferences policies
DROP POLICY IF EXISTS "Users can manage own onboarding" ON public.onboarding_preferences;
CREATE POLICY "Users can manage own onboarding" ON public.onboarding_preferences
  FOR ALL USING (auth.uid() = user_id);

-- User preferences policies
DROP POLICY IF EXISTS "Users can manage own preferences" ON public.user_preferences;
CREATE POLICY "Users can manage own preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- User streaks policies
DROP POLICY IF EXISTS "Users can manage own streaks" ON public.user_streaks;
CREATE POLICY "Users can manage own streaks" ON public.user_streaks
  FOR ALL USING (auth.uid() = user_id);

-- User settings policies
DROP POLICY IF EXISTS "Users can manage own settings" ON public.user_settings;
CREATE POLICY "Users can manage own settings" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- STEP 5: INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON public.user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_event_type ON public.user_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_user_analytics_created_at ON public.user_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_completed_at ON public.sessions(completed_at);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- ============================================
-- STEP 6: ADMIN SETUP
-- ============================================

-- TO SET ADMIN ROLE FOR A USER, RUN:
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('YOUR_USER_UUID_HERE', 'admin');

-- TO CHECK IF A USER IS ADMIN:
-- SELECT public.has_role('YOUR_USER_UUID_HERE', 'admin');

-- ============================================
-- DONE! All tables and functions are ready.
-- ============================================
