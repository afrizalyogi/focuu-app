-- ============================================
-- FOCUU DATABASE SCHEMA EXTENSION
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create app_role enum for admin access
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Security definer function for role checking
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

-- 4. Update profiles table for trial support
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'trial', 'pro', 'expired'));

-- 5. User analytics/behavior tracking table
CREATE TABLE public.user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  session_id TEXT,
  page TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- 6. Onboarding preferences table
CREATE TABLE public.onboarding_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  energy_level TEXT CHECK (energy_level IN ('low', 'okay', 'high')),
  pressure_preference TEXT CHECK (pressure_preference IN ('push', 'steady', 'support')),
  initial_intent TEXT,
  completed_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.onboarding_preferences ENABLE ROW LEVEL SECURITY;

-- 7. User preferences table (for music, background, etc)
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  music_url TEXT,
  background_url TEXT,
  background_type TEXT CHECK (background_type IN ('image', 'video', 'none')),
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'book')),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 8. Daily streaks tracking
CREATE TABLE public.user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_session_date DATE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- User analytics policies
CREATE POLICY "Users can insert own analytics" ON public.user_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view own analytics" ON public.user_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics" ON public.user_analytics
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Onboarding preferences policies
CREATE POLICY "Users can manage own onboarding" ON public.onboarding_preferences
  FOR ALL USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can manage own preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- User streaks policies
CREATE POLICY "Users can manage own streaks" ON public.user_streaks
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to check if user has active trial or pro
CREATE OR REPLACE FUNCTION public.check_user_access(user_id UUID)
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
  WHERE p.id = user_id;
  
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

-- Function to start trial for a user
CREATE OR REPLACE FUNCTION public.start_trial(user_id UUID)
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
  WHERE id = user_id
    AND trial_started_at IS NULL;
  
  RETURN FOUND;
END;
$$;

-- Function to update streak
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

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON public.user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_event_type ON public.user_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_user_analytics_created_at ON public.user_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_completed_at ON public.sessions(completed_at);

-- ============================================
-- TO SET ADMIN ROLE FOR A USER:
-- ============================================
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('YOUR_USER_UUID_HERE', 'admin');
