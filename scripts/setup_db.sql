-- ============================================
-- MindMatch - Simplified Database Schema Setup
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. Users Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  language VARCHAR(5) DEFAULT 'ar',
  is_admin BOOLEAN DEFAULT FALSE,
  subscription_status VARCHAR(50) DEFAULT 'free',
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- Create index on email
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_id);

-- ============================================
-- 2. Personality Types Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.personality_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  icon_url TEXT,
  color_primary VARCHAR(7),
  color_secondary VARCHAR(7),
  characteristics JSONB,
  strengths JSONB,
  weaknesses JSONB,
  career_suggestions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. Questions Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_ar TEXT NOT NULL,
  question_en TEXT NOT NULL,
  category VARCHAR(50),
  dimension VARCHAR(20),
  answer_type VARCHAR(20) DEFAULT 'scale',
  options JSONB,
  correct_dimension VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. Test Results Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  personality_type_id UUID NOT NULL REFERENCES public.personality_types(id),
  answers JSONB NOT NULL,
  scores JSONB NOT NULL,
  completion_time INTEGER,
  is_free_version BOOLEAN DEFAULT TRUE,
  report_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON public.test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_created_at ON public.test_results(created_at DESC);

-- ============================================
-- 5. Personality Books Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.personality_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  personality_type_id UUID NOT NULL REFERENCES public.personality_types(id),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  author TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. Payment Records Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  test_result_id UUID REFERENCES public.test_results(id) ON DELETE SET NULL,
  stripe_payment_id TEXT UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'SAR',
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_records_user_id ON public.payment_records(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_stripe_id ON public.payment_records(stripe_payment_id);

-- ============================================
-- 7. AI Prompts Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.ai_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  personality_type_id UUID REFERENCES public.personality_types(id) ON DELETE SET NULL,
  prompt_type VARCHAR(50) NOT NULL,
  system_prompt TEXT NOT NULL,
  user_prompt TEXT NOT NULL,
  parameters JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 8. Analytics Events Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  session_id VARCHAR(100),
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics_events(created_at DESC);

-- ============================================
-- 9. OTP Codes Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  code VARCHAR(6) NOT NULL,
  attempt_count INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  is_verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_otp_phone ON public.otp_codes(phone_number);

-- ============================================
-- 10. Session Management Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  device_info JSONB,
  ip_address TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON public.user_sessions(session_token);

-- ============================================
-- Enable RLS
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personality_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personality_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies - Users Table
-- ============================================
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid()::uuid = auth_id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid()::uuid = auth_id);

-- ============================================
-- RLS Policies - Personality Types (Public)
-- ============================================
CREATE POLICY "Personality types are publicly readable"
  ON public.personality_types FOR SELECT
  USING (true);

-- ============================================
-- RLS Policies - Questions (Public)
-- ============================================
CREATE POLICY "Questions are publicly readable"
  ON public.questions FOR SELECT
  USING (is_active = true);

-- ============================================
-- RLS Policies - Test Results
-- ============================================
CREATE POLICY "Users can view their own test results"
  ON public.test_results FOR SELECT
  USING (auth.uid()::uuid = (SELECT auth_id FROM public.users WHERE id = user_id));

CREATE POLICY "Users can create test results"
  ON public.test_results FOR INSERT
  WITH CHECK (auth.uid()::uuid = (SELECT auth_id FROM public.users WHERE id = user_id));

-- ============================================
-- RLS Policies - Books (Public)
-- ============================================
CREATE POLICY "Books are publicly readable"
  ON public.personality_books FOR SELECT
  USING (is_published = true);

-- ============================================
-- Sample Personality Types Data
-- ============================================
INSERT INTO public.personality_types (code, name_ar, name_en, description_ar, description_en, color_primary, color_secondary)
VALUES 
('INTJ', 'المهندس المستراتيجي', 'The Strategist', 'شخص مستقل وثقة بالنفس', 'Independent and confident', '#5B3BA0', '#7B5BA8'),
('INFP', 'الحالم المثالي', 'The Idealist', 'شخص عاطفي ومبدع', 'Emotional and creative', '#FF6B9D', '#FF8FB0'),
('ENFP', 'المستكشف المتحمس', 'The Explorer', 'شخص اجتماعي وديناميكي', 'Social and dynamic', '#FFA500', '#FFB84D'),
('ISTJ', 'المنطقي المنظم', 'The Logistician', 'شخص عملي وموثوق', 'Practical and reliable', '#4A90E2', '#6BA3E5')
ON CONFLICT (code) DO NOTHING;
