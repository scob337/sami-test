-- ============================================
-- MindMatch - Database Schema
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. Users Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 2. Personality Types Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.personality_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL, -- e.g., INTJ, INFP
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. Questions Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_ar TEXT NOT NULL,
  question_en TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- personality, values, lifestyle, etc.
  order_index INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. Question Answers (Options) Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.question_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  answer_ar TEXT NOT NULL,
  answer_en TEXT NOT NULL,
  value_score INT NOT NULL, -- Points for scoring
  personality_weights JSONB, -- Map of personality types to weights
  order_index INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. Test Results Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  personality_type_id UUID NOT NULL REFERENCES public.personality_types(id),
  score INT NOT NULL,
  confidence_percentage INT,
  answers JSONB NOT NULL, -- Store user's answers for audit trail
  free_report JSONB, -- Free summary report
  full_report_url TEXT, -- URL to PDF or full report
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed
  stripe_payment_id TEXT,
  is_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  report_generated_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 6. Books Table (Recommendations)
-- ============================================
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  author_ar TEXT,
  author_en TEXT,
  description_ar TEXT,
  description_en TEXT,
  cover_image_url TEXT,
  pdf_url TEXT,
  personality_type_ids UUID[] NOT NULL, -- Which personality types this book is for
  category VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  download_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. AI Prompts Table (Secure Storage)
-- ============================================
CREATE TABLE IF NOT EXISTS public.ai_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  prompt_template TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- report_generation, analysis, etc.
  version INT DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  model_config JSONB, -- Model settings like temperature, max_tokens
  usage_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 8. Payments Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  test_result_id UUID REFERENCES public.test_results(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'SAR',
  stripe_payment_intent_id TEXT UNIQUE,
  status VARCHAR(50) NOT NULL, -- pending, succeeded, failed
  payment_method VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 9. Analytics Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL, -- test_completed, payment_completed, report_downloaded
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 10. Admin Logs Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON public.test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_created_at ON public.test_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_category ON public.questions(category);
CREATE INDEX IF NOT EXISTS idx_books_personality_types ON public.books USING GIN(personality_type_ids);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON public.analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON public.admin_logs(admin_id);

-- ============================================
-- Update Timestamps Trigger
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at_trigger
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER personality_types_updated_at_trigger
BEFORE UPDATE ON public.personality_types
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER questions_updated_at_trigger
BEFORE UPDATE ON public.questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER test_results_updated_at_trigger
BEFORE UPDATE ON public.test_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER books_updated_at_trigger
BEFORE UPDATE ON public.books
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER ai_prompts_updated_at_trigger
BEFORE UPDATE ON public.ai_prompts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER payments_updated_at_trigger
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personality_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Users RLS Policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = auth_id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND is_admin = TRUE
    )
  );

-- Personality Types - Public Read
CREATE POLICY "Anyone can view personality types" ON public.personality_types
  FOR SELECT USING (TRUE);

-- Questions - Public Read
CREATE POLICY "Anyone can view active questions" ON public.questions
  FOR SELECT USING (is_active = TRUE);

-- Question Answers - Public Read
CREATE POLICY "Anyone can view question answers" ON public.question_answers
  FOR SELECT USING (TRUE);

-- Test Results - Own results only
CREATE POLICY "Users can view their own results" ON public.test_results
  FOR SELECT USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = user_id));

CREATE POLICY "Users can create test results" ON public.test_results
  FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_id FROM public.users WHERE id = user_id));

CREATE POLICY "Admins can view all results" ON public.test_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND is_admin = TRUE
    )
  );

-- Books - Public Read
CREATE POLICY "Anyone can view active books" ON public.books
  FOR SELECT USING (is_active = TRUE);

-- AI Prompts - Admin Only
CREATE POLICY "Only admins can manage prompts" ON public.ai_prompts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND is_admin = TRUE
    )
  );

-- Payments - Own payments only
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = user_id));

CREATE POLICY "Users can create payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_id FROM public.users WHERE id = user_id));

CREATE POLICY "Admins can view all payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND is_admin = TRUE
    )
  );

-- Analytics - Logged in users can insert
CREATE POLICY "Users can create analytics events" ON public.analytics
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can view analytics" ON public.analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND is_admin = TRUE
    )
  );

-- Admin Logs - Admin Only
CREATE POLICY "Only admins can access admin logs" ON public.admin_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND is_admin = TRUE
    )
  );

-- ============================================
-- Insert Sample Data
-- ============================================

-- Insert Personality Types (MBTI)
INSERT INTO public.personality_types (code, name_ar, name_en, description_ar, description_en, color_primary, color_secondary) VALUES
('INTJ', 'المهندس', 'The Architect', 'القائد المستقل والمبدع', 'Independent and creative leader', '#5B3BA0', '#8B5FBF'),
('INTP', 'المنطقي', 'The Logician', 'المفكر التحليلي والفضولي', 'Analytical and curious thinker', '#234E70', '#4A7BA7'),
('ENTJ', 'القائد', 'The Commander', 'الرائد الحازم والطموح', 'Bold and ambitious leader', '#D62839', '#FF6B6B'),
('ENTP', 'المناظر', 'The Debater', 'المبتكر الجريء والفضولي', 'Innovative and bold debater', '#F77F00', '#FCBF49'),
('INFJ', 'المستشار', 'The Advocate', 'المرشد الحكيم والمثالي', 'Wise and idealistic guide', '#06A77D', '#26C485'),
('INFP', 'الوسيط', 'The Mediator', 'الحالم المثالي والداعم', 'Idealistic and supportive dreamer', '#9D4EDD', '#C77DFF'),
('ENFJ', 'المعلم', 'The Teacher', 'القائد الكريم والملهم', 'Charismatic and inspiring leader', '#FF006E', '#FB5607'),
('ENFP', 'المشعل', 'The Campaigner', 'الحماسي الحر والمغامر', 'Enthusiastic and free-spirited explorer', '#FFB703', '#FB8500'),
('ISTJ', 'اللواء', 'The Logistician', 'الموثوق والمنظم', 'Reliable and organized', '#003049', '#669BBC'),
('ISFJ', 'المدافع', 'The Defender', 'الحامي الوفي والعملي', 'Loyal and practical protector', '#8ECAE6', '#219EBC'),
('ESTJ', 'المدير', 'The Executive', 'المسؤول الفعال والمنظم', 'Effective and organized administrator', '#023E8A', '#0077B6'),
('ESFJ', 'القنصل', 'The Consul', 'الاجتماعي الدافئ والرعاية', 'Warm and caring socialite', '#FFB4A2', '#E5989B'),
('ISTP', 'الحرفي', 'The Virtuoso', 'الخبير المنطقي والعملي', 'Logical and practical expert', '#577590', '#90E0EF'),
('ISFP', 'الفنان', 'The Adventurer', 'الحساس الحر والفني', 'Sensitive and artistic free spirit', '#E63946', '#F1FAEE'),
('ESTP', 'المسعى', 'The Entrepreneur', 'المغامر الذكي والحاضر', 'Smart and spontaneous entrepreneur', '#A23B72', '#F18F01'),
('ESFP', 'الأداء', 'The Entertainer', 'الحماسي المرح والاجتماعي', 'Enthusiastic and social entertainer', '#C1121F', '#FDF0D5');

COMMIT;
