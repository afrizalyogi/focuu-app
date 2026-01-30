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
  event_data JSONB DEFAULT '{}', -- Payload: { interaction_type: 'hit'|'miss', component_text, distance, etc }
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

-- 3f. Helper function to set user role by email (Run via SQL Editor)
CREATE OR REPLACE FUNCTION public.set_user_role(p_email TEXT, p_role TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_role app_role;
BEGIN
  -- Validate role
  BEGIN
    v_role := p_role::app_role;
  EXCEPTION WHEN OTHERS THEN
    RETURN 'Error: Invalid role. Use admin, moderator, or user.';
  END;

  -- Find user ID from profiles (safer than querying auth.users directly if permissions are tight)
  SELECT id INTO v_user_id
  FROM public.profiles
  WHERE email = p_email;

  IF v_user_id IS NULL THEN
    RETURN 'Error: User not found with email ' || p_email;
  END IF;

  -- Upsert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, v_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- If assigning admin, also give them access to pro/everything via subscription override? 
  -- Optional, but for now just role.

  RETURN 'Success: Set ' || p_email || ' to role ' || p_role;
END;
$$;

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

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;
CREATE POLICY "Only admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create user_feedback table
create table if not exists public.user_feedback (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  feedback text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.user_feedback enable row level security;

-- Policies
DROP POLICY IF EXISTS "Users can insert their own feedback" ON public.user_feedback;
CREATE POLICY "Users can insert their own feedback" ON public.user_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own feedback" ON public.user_feedback;
CREATE POLICY "Users can view their own feedback" ON public.user_feedback
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all feedback" ON public.user_feedback;
CREATE POLICY "Admins can view all feedback" ON public.user_feedback
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

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

-- Allow authenticated users to view heatmap data (fixes admin visibility issues)
DROP POLICY IF EXISTS "Authenticated users can view heatmap data" ON public.user_analytics;
CREATE POLICY "Authenticated users can view heatmap data" ON public.user_analytics
  FOR SELECT
  TO authenticated
  USING (event_type = 'heatmap_click');

-- Allow authenticated users to view heatmap data (fixes admin visibility issues)
DROP POLICY IF EXISTS "Authenticated users can view heatmap data" ON public.user_analytics;
CREATE POLICY "Authenticated users can view heatmap data" ON public.user_analytics
  FOR SELECT
  TO authenticated
  USING (event_type = 'heatmap_click');

-- Onboarding preferences policies
DROP POLICY IF EXISTS "Users can manage own onboarding" ON public.onboarding_preferences;
CREATE POLICY "Users can manage own onboarding" ON public.onboarding_preferences
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all onboarding" ON public.onboarding_preferences;
CREATE POLICY "Admins can view all onboarding" ON public.onboarding_preferences
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- User preferences policies
DROP POLICY IF EXISTS "Users can manage own preferences" ON public.user_preferences;
CREATE POLICY "Users can manage own preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all preferences" ON public.user_preferences;
CREATE POLICY "Admins can view all preferences" ON public.user_preferences
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- User streaks policies
DROP POLICY IF EXISTS "Users can manage own streaks" ON public.user_streaks;
CREATE POLICY "Users can manage own streaks" ON public.user_streaks
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all streaks" ON public.user_streaks;
CREATE POLICY "Admins can view all streaks" ON public.user_streaks
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- User settings policies
DROP POLICY IF EXISTS "Users can manage own settings" ON public.user_settings;
CREATE POLICY "Users can manage own settings" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all settings" ON public.user_settings;
CREATE POLICY "Admins can view all settings" ON public.user_settings
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- STEP 5: INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON public.user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_event_type ON public.user_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_user_analytics_created_at ON public.user_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_user_analytics_page ON public.user_analytics(page);
CREATE INDEX IF NOT EXISTS idx_user_analytics_type_page ON public.user_analytics(event_type, page);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_completed_at ON public.sessions(completed_at);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- ============================================
-- STEP 6: ADMIN SETUP
-- ============================================

-- TO SET ADMIN ROLE FOR A USER (Using Email):
-- SELECT public.set_user_role('admin@example.com', 'admin');

-- TO SET ADMIN ROLE FOR A USER (Using UUID):
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('YOUR_USER_UUID_HERE', 'admin');

-- TO CHECK IF A USER IS ADMIN:
-- SELECT public.has_role('YOUR_USER_UUID_HERE', 'admin');
-- OR Check via Email:
-- SELECT * FROM public.user_roles WHERE user_id IN (SELECT id FROM public.profiles WHERE email = 'admin@example.com');

-- ============================================
-- STEP 7: SUBSCRIPTION MANAGEMENT TABLES
-- ============================================

-- 7a. Orders table - records all purchase attempts
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly', 'lifetime')),
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  payment_provider TEXT,
  payment_provider_order_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 7b. Payments table - records successful payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_provider TEXT,
  payment_provider_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'succeeded' CHECK (status IN ('succeeded', 'refunded', 'disputed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 7c. Subscriptions table - tracks active subscription periods
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly', 'lifetime')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ, -- NULL for lifetime
  auto_renew BOOLEAN DEFAULT false,
  reminder_sent BOOLEAN DEFAULT false,
  order_id UUID REFERENCES public.orders(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Orders policies
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
CREATE POLICY "Users can create own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Admins can manage all orders" ON public.orders
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Payments policies
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all payments" ON public.payments;
CREATE POLICY "Admins can manage all payments" ON public.payments
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Subscriptions policies
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can manage all subscriptions" ON public.subscriptions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_ends_at ON public.subscriptions(ends_at);

-- Function to check and expire subscriptions (auto-downgrade)
CREATE OR REPLACE FUNCTION public.check_expired_subscriptions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expired_count INTEGER := 0;
  sub_record RECORD;
BEGIN
  FOR sub_record IN
    SELECT s.id, s.user_id
    FROM public.subscriptions s
    WHERE s.status = 'active'
      AND s.plan_type != 'lifetime'
      AND s.ends_at IS NOT NULL
      AND s.ends_at < now()
  LOOP
    UPDATE public.subscriptions
    SET status = 'expired', updated_at = now()
    WHERE id = sub_record.id;
    
    UPDATE public.profiles
    SET is_pro = false, subscription_status = 'expired', updated_at = now()
    WHERE id = sub_record.user_id;
    
    expired_count := expired_count + 1;
  END LOOP;
  
  RETURN expired_count;
END;
$$;

-- Function to activate subscription after successful payment
CREATE OR REPLACE FUNCTION public.activate_subscription(
  p_user_id UUID,
  p_plan_type TEXT,
  p_order_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ends_at TIMESTAMPTZ;
  v_subscription_id UUID;
BEGIN
  CASE p_plan_type
    WHEN 'monthly' THEN v_ends_at := now() + INTERVAL '1 month';
    WHEN 'yearly' THEN v_ends_at := now() + INTERVAL '1 year';
    WHEN 'lifetime' THEN v_ends_at := NULL;
    ELSE RAISE EXCEPTION 'Invalid plan type: %', p_plan_type;
  END CASE;
  
  UPDATE public.subscriptions
  SET status = 'expired', updated_at = now()
  WHERE user_id = p_user_id AND status = 'active';
  
  INSERT INTO public.subscriptions (user_id, plan_type, status, starts_at, ends_at, order_id)
  VALUES (p_user_id, p_plan_type, 'active', now(), v_ends_at, p_order_id)
  RETURNING id INTO v_subscription_id;
  
  UPDATE public.profiles
  SET is_pro = true, subscription_status = 'pro', updated_at = now()
  WHERE id = p_user_id;
  
  RETURN v_subscription_id;
END;
$$;

-- Function to get user subscription status
CREATE OR REPLACE FUNCTION public.get_subscription_status(p_user_id UUID)
RETURNS TABLE (
  is_active BOOLEAN,
  plan_type TEXT,
  ends_at TIMESTAMPTZ,
  days_remaining INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.status = 'active' AS is_active,
    s.plan_type,
    s.ends_at,
    CASE 
      WHEN s.ends_at IS NULL THEN NULL
      WHEN s.ends_at > now() THEN EXTRACT(DAY FROM (s.ends_at - now()))::INTEGER
      ELSE 0
    END AS days_remaining
  FROM public.subscriptions s
  WHERE s.user_id = p_user_id
    AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'free'::TEXT, NULL::TIMESTAMPTZ, 0;
  END IF;
END;
$$;

-- ============================================
-- STEP 8: MIGRATION FIXES (Run if table already exists)
-- ============================================

-- Fix subscriptions foreign key to point to profiles instead of auth.users
-- This is required for PostgREST resource embedding (e.g. profiles!inner)
DO $$
BEGIN
  -- Check if the constraint exists (simplification: attempt to drop and recreate)
  BEGIN
    ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;
  END;

  -- Add the correct constraint
  BEGIN
    ALTER TABLE public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id)
    ON DELETE CASCADE;
  EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN others THEN raise notice 'Could not create constraint: %', SQLERRM;
  END;
END $$;

-- ============================================
-- ============================================
-- STEP 9: GRANT PERMISSIONS (CRITICAL)
-- ============================================

-- Grant usage on public schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant access to all tables for authorized roles
-- (RLS policies will still restrict data access row-by-row)

-- 1. User Roles
GRANT SELECT ON TABLE public.user_roles TO authenticated;
GRANT SELECT ON TABLE public.user_roles TO service_role;

-- 2. Profiles
GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;

-- 3. Sessions
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.sessions TO authenticated;
GRANT ALL ON TABLE public.sessions TO service_role;

-- 4. User Analytics
GRANT SELECT, INSERT ON TABLE public.user_analytics TO authenticated;
GRANT INSERT ON TABLE public.user_analytics TO anon;
GRANT ALL ON TABLE public.user_analytics TO service_role;

-- 5. Preferences & Settings
GRANT SELECT, INSERT, UPDATE ON TABLE public.onboarding_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.user_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.user_settings TO authenticated;
GRANT ALL ON TABLE public.onboarding_preferences TO service_role;
GRANT ALL ON TABLE public.user_preferences TO service_role;
GRANT ALL ON TABLE public.user_settings TO service_role;

-- 6. Streaks
GRANT SELECT, INSERT, UPDATE ON TABLE public.user_streaks TO authenticated;
GRANT ALL ON TABLE public.user_streaks TO service_role;

-- 7. Feedback (if present)
GRANT SELECT, INSERT ON TABLE public.user_feedback TO authenticated;
GRANT ALL ON TABLE public.user_feedback TO service_role;

-- 8. Subscription/Payment Tables
GRANT SELECT, INSERT, UPDATE ON TABLE public.orders TO authenticated;
GRANT SELECT ON TABLE public.payments TO authenticated;
GRANT SELECT ON TABLE public.subscriptions TO authenticated;
GRANT ALL ON TABLE public.orders TO service_role;
GRANT ALL ON TABLE public.payments TO service_role;
GRANT ALL ON TABLE public.subscriptions TO service_role;

-- Grant access to sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Force refresh schema cache by notifying
NOTIFY pgrst, 'reload schema';

-- ============================================
-- DONE! All tables and functions are ready.
-- ============================================

-- ============================================
-- STEP 10: PRICING MANAGEMENT SCHEMA
-- ============================================

-- 10a. Create pricing_plans table
CREATE TABLE IF NOT EXISTS public.pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  interval TEXT NOT NULL CHECK (interval IN ('monthly', 'yearly', 'lifetime')),
  is_active BOOLEAN DEFAULT true,
  features JSONB DEFAULT '[]', -- List of feature strings
  payment_link TEXT, -- Optional external link (Stripe/LemonSqueezy)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10b. Enable RLS
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

-- 10c. Policies
-- Anyone can view active plans
DROP POLICY IF EXISTS "Anyone can view active plans" ON public.pricing_plans;
CREATE POLICY "Anyone can view active plans" ON public.pricing_plans
  FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

-- Only admins can manage plans
DROP POLICY IF EXISTS "Admins can manage plans" ON public.pricing_plans;
CREATE POLICY "Admins can manage plans" ON public.pricing_plans
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 10d. Indexes
CREATE INDEX IF NOT EXISTS idx_pricing_plans_active ON public.pricing_plans(is_active);

-- 10e. Seed Data
INSERT INTO public.pricing_plans (name, description, price_cents, interval, features)
SELECT 'Pro Monthly', 'Perfect for focused individuals', 900, 'monthly', '["Unlimited Focus Time", "Advanced Analytics", "Custom Themes"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.pricing_plans WHERE name = 'Pro Monthly');

INSERT INTO public.pricing_plans (name, description, price_cents, interval, features)
SELECT 'Pro Yearly', 'Best value for long-term focus', 9000, 'yearly', '["All Pro Features", "2 Months Free", "Priority Support"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.pricing_plans WHERE name = 'Pro Yearly');

INSERT INTO public.pricing_plans (name, description, price_cents, interval, features)
SELECT 'Lifetime', 'One-time payment forever', 29900, 'lifetime', '["All Future Updates", "Founder Badge", "Vibrational Energy"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.pricing_plans WHERE name = 'Lifetime');

-- 10f. Permissions
GRANT SELECT ON TABLE public.pricing_plans TO anon, authenticated;
GRANT ALL ON TABLE public.pricing_plans TO service_role;
GRANT INSERT, UPDATE, DELETE ON TABLE public.pricing_plans TO authenticated;

-- Force refresh schema cache by notifying
NOTIFY pgrst, 'reload schema';

