-- SimpleLMS Database Schema for Supabase
-- Complete migration from Firebase to PostgreSQL

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================
-- USER PROFILES (extends Supabase auth.users)
-- ================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('student', 'resident', 'fellow', 'attending', 'admin')) DEFAULT 'student',
  specialty TEXT,
  sub_specialty TEXT,
  institution TEXT,
  country TEXT,
  medical_school_year INTEGER,
  residency_year INTEGER,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  trial_ends_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  quiz_attempts_today INTEGER DEFAULT 0,
  quiz_attempts_reset_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 day',
  total_quizzes_taken INTEGER DEFAULT 0,
  total_points_earned INTEGER DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  device_count INTEGER DEFAULT 0,
  max_devices INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- QUIZZES
-- ================================================
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  specialty TEXT,
  sub_specialty TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'intermediate',
  question_count INTEGER DEFAULT 0,
  estimated_time INTEGER DEFAULT 20,
  pass_percentage INTEGER DEFAULT 70,
  exam_type TEXT, -- USMLE Step 1, Step 2 CK, COMLEX, etc.
  tags TEXT[],
  image_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  attempt_count INTEGER DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- QUESTIONS
-- ================================================
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank', 'matching')),
  options JSONB NOT NULL, -- {A: "text", B: "text", C: "text", D: "text", E: "text"}
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  clinical_vignette TEXT,
  lab_values JSONB,
  image_url TEXT,
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5) DEFAULT 3,
  points INTEGER DEFAULT 1,
  time_limit INTEGER, -- seconds
  order_index INTEGER,
  topic TEXT,
  learning_objective TEXT,
  reference_source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- QUIZ ATTEMPTS
-- ================================================
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  total_points INTEGER,
  percentage DECIMAL(5,2),
  correct_answers INTEGER DEFAULT 0,
  incorrect_answers INTEGER DEFAULT 0,
  unanswered INTEGER DEFAULT 0,
  time_taken INTEGER, -- seconds
  answers JSONB, -- {question_id: {selected: "A", correct: "B", is_correct: false}}
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  is_completed BOOLEAN DEFAULT false,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- PRACTICE UPDATES (Medical News/Guidelines)
-- ================================================
CREATE TABLE IF NOT EXISTS public.practice_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT,
  author_credentials TEXT,
  specialty TEXT,
  sub_specialty TEXT,
  impact_level TEXT CHECK (impact_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  source_url TEXT,
  source_journal TEXT,
  publication_date DATE,
  doi TEXT,
  pubmed_id TEXT,
  tags TEXT[],
  evidence_level TEXT CHECK (evidence_level IN ('I', 'II', 'III', 'IV', 'V')),
  recommendation_grade TEXT CHECK (recommendation_grade IN ('A', 'B', 'C', 'D', 'I')),
  key_takeaways TEXT[],
  clinical_pearls TEXT[],
  image_url TEXT,
  pdf_url TEXT,
  video_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'published', 'archived')),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,
  endorsement_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- DISEASE SURVEILLANCE
-- ================================================
CREATE TABLE IF NOT EXISTS public.disease_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  condition TEXT NOT NULL,
  icd10_code TEXT,
  country TEXT NOT NULL,
  state_province TEXT,
  city TEXT,
  facility TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  severity TEXT CHECK (severity IN ('low', 'moderate', 'high', 'critical')) DEFAULT 'moderate',
  cases_count INTEGER DEFAULT 0,
  deaths_count INTEGER DEFAULT 0,
  recovered_count INTEGER DEFAULT 0,
  hospitalized_count INTEGER DEFAULT 0,
  icu_count INTEGER DEFAULT 0,
  symptoms TEXT[],
  transmission_mode TEXT CHECK (transmission_mode IN ('airborne', 'droplet', 'contact', 'vector', 'bloodborne', 'unknown')),
  incubation_period TEXT,
  reported_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reporter_credentials TEXT,
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  public_health_alert BOOLEAN DEFAULT false,
  alert_level TEXT CHECK (alert_level IN ('watch', 'warning', 'emergency')),
  containment_measures TEXT[],
  lab_results JSONB,
  epidemiology_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- STUDY GROUPS
-- ================================================
CREATE TABLE IF NOT EXISTS public.study_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  specialty TEXT,
  exam_focus TEXT, -- USMLE Step 1, etc.
  level TEXT CHECK (level IN ('medical_student', 'resident', 'fellow', 'all')),
  is_private BOOLEAN DEFAULT false,
  join_code TEXT UNIQUE,
  max_members INTEGER DEFAULT 50,
  member_count INTEGER DEFAULT 1,
  meeting_schedule TEXT,
  meeting_link TEXT,
  resources_url TEXT,
  rules TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- GROUP MEMBERS
-- ================================================
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'moderator', 'member')),
  contribution_score INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- ================================================
-- COMMUNITY POSTS (Forums)
-- ================================================
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('discussion', 'question', 'case_study', 'announcement', 'resource', 'meme')),
  specialty TEXT,
  tags TEXT[],
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  has_accepted_answer BOOLEAN DEFAULT false,
  accepted_answer_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- COMMENTS
-- ================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_expert_answer BOOLEAN DEFAULT false,
  is_accepted BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- MESSAGES (Direct & Group)
-- ================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'quiz_share')),
  attachment_url TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (
    (receiver_id IS NOT NULL AND group_id IS NULL) OR
    (receiver_id IS NULL AND group_id IS NOT NULL)
  )
);

-- ================================================
-- CME CREDITS
-- ================================================
CREATE TABLE IF NOT EXISTS public.cme_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_name TEXT NOT NULL,
  activity_type TEXT CHECK (activity_type IN ('course', 'conference', 'workshop', 'quiz', 'article')),
  provider TEXT,
  credits_earned DECIMAL(4,2),
  category TEXT,
  completion_date DATE,
  certificate_url TEXT,
  expires_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- DEBATE FORUM
-- ================================================
CREATE TABLE IF NOT EXISTS public.debates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  description TEXT,
  category TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  position_for TEXT NOT NULL,
  position_against TEXT NOT NULL,
  evidence_required BOOLEAN DEFAULT true,
  voting_ends_at TIMESTAMPTZ,
  votes_for INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  is_concluded BOOLEAN DEFAULT false,
  winner TEXT CHECK (winner IN ('for', 'against', 'tie')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- USER ENGAGEMENT TRACKING
-- ================================================
CREATE TABLE IF NOT EXISTS public.user_engagement (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('quiz', 'post', 'update', 'debate', 'comment')),
  entity_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('view', 'like', 'share', 'bookmark', 'endorse', 'upvote', 'downvote')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, entity_type, entity_id, action)
);

-- ================================================
-- NOTIFICATIONS
-- ================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

-- Profiles
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_subscription_tier ON public.profiles(subscription_tier);
CREATE INDEX idx_profiles_specialty ON public.profiles(specialty);

-- Quizzes
CREATE INDEX idx_quizzes_category ON public.quizzes(category);
CREATE INDEX idx_quizzes_specialty ON public.quizzes(specialty);
CREATE INDEX idx_quizzes_difficulty ON public.quizzes(difficulty);
CREATE INDEX idx_quizzes_published ON public.quizzes(is_published);
CREATE INDEX idx_quizzes_created_at ON public.quizzes(created_at DESC);

-- Questions
CREATE INDEX idx_questions_quiz_id ON public.questions(quiz_id);
CREATE INDEX idx_questions_order ON public.questions(quiz_id, order_index);

-- Quiz Attempts
CREATE INDEX idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_created_at ON public.quiz_attempts(created_at DESC);

-- Practice Updates
CREATE INDEX idx_practice_updates_specialty ON public.practice_updates(specialty);
CREATE INDEX idx_practice_updates_status ON public.practice_updates(status);
CREATE INDEX idx_practice_updates_published_at ON public.practice_updates(published_at DESC);
CREATE INDEX idx_practice_updates_author ON public.practice_updates(author_id);

-- Disease Reports
CREATE INDEX idx_disease_reports_country ON public.disease_reports(country);
CREATE INDEX idx_disease_reports_severity ON public.disease_reports(severity);
CREATE INDEX idx_disease_reports_condition ON public.disease_reports(condition);
CREATE INDEX idx_disease_reports_created_at ON public.disease_reports(created_at DESC);

-- Messages
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX idx_messages_group ON public.messages(group_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

-- Community Posts
CREATE INDEX idx_community_posts_author ON public.community_posts(author_id);
CREATE INDEX idx_community_posts_category ON public.community_posts(category);
CREATE INDEX idx_community_posts_created_at ON public.community_posts(created_at DESC);

-- Notifications
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read);

-- Full text search
CREATE INDEX idx_quizzes_title_search ON public.quizzes USING gin(to_tsvector('english', title));
CREATE INDEX idx_questions_text_search ON public.questions USING gin(to_tsvector('english', question_text));
CREATE INDEX idx_practice_updates_search ON public.practice_updates USING gin(to_tsvector('english', title || ' ' || COALESCE(content, '')));
CREATE INDEX idx_community_posts_search ON public.community_posts USING gin(to_tsvector('english', COALESCE(title, '') || ' ' || content));

-- ================================================
-- TRIGGERS FOR UPDATED_AT
-- ================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON public.quizzes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_practice_updates_updated_at BEFORE UPDATE ON public.practice_updates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disease_reports_updated_at BEFORE UPDATE ON public.disease_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_groups_updated_at BEFORE UPDATE ON public.study_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_debates_updated_at BEFORE UPDATE ON public.debates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- TRIGGER FOR NEW USER PROFILE
-- ================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================
-- TRIGGER FOR QUIZ STATISTICS
-- ================================================

CREATE OR REPLACE FUNCTION update_quiz_statistics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_completed = true AND OLD.is_completed = false THEN
    UPDATE public.quizzes
    SET
      attempt_count = attempt_count + 1,
      average_score = (
        SELECT AVG(percentage)
        FROM public.quiz_attempts
        WHERE quiz_id = NEW.quiz_id AND is_completed = true
      )
    WHERE id = NEW.quiz_id;

    UPDATE public.profiles
    SET
      total_quizzes_taken = total_quizzes_taken + 1,
      total_points_earned = total_points_earned + NEW.score,
      average_score = (
        SELECT AVG(percentage)
        FROM public.quiz_attempts
        WHERE user_id = NEW.user_id AND is_completed = true
      )
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quiz_stats_on_completion
  AFTER UPDATE ON public.quiz_attempts
  FOR EACH ROW EXECUTE FUNCTION update_quiz_statistics();

-- ================================================
-- FUNCTION FOR QUIZ ATTEMPT LIMITS
-- ================================================

CREATE OR REPLACE FUNCTION check_quiz_attempt_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_tier TEXT;
  attempts_today INTEGER;
  daily_limit INTEGER;
BEGIN
  SELECT subscription_tier, quiz_attempts_today
  INTO user_tier, attempts_today
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Reset attempts if needed
  UPDATE public.profiles
  SET
    quiz_attempts_today = CASE
      WHEN quiz_attempts_reset_at < NOW() THEN 1
      ELSE quiz_attempts_today + 1
    END,
    quiz_attempts_reset_at = CASE
      WHEN quiz_attempts_reset_at < NOW() THEN NOW() + INTERVAL '1 day'
      ELSE quiz_attempts_reset_at
    END
  WHERE id = NEW.user_id;

  -- Check limits based on tier
  IF user_tier = 'free' THEN
    daily_limit := 5;
  ELSE
    RETURN NEW; -- No limit for paid tiers
  END IF;

  IF attempts_today >= daily_limit THEN
    RAISE EXCEPTION 'Daily quiz attempt limit reached. Upgrade to Pro for unlimited quizzes.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_quiz_attempt_limit
  BEFORE INSERT ON public.quiz_attempts
  FOR EACH ROW EXECUTE FUNCTION check_quiz_attempt_limit();

-- ================================================
-- COMMENTS
-- ================================================

COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase auth';
COMMENT ON TABLE public.quizzes IS 'Medical education quizzes and assessments';
COMMENT ON TABLE public.questions IS 'Quiz questions with clinical vignettes';
COMMENT ON TABLE public.quiz_attempts IS 'User quiz attempts and results';
COMMENT ON TABLE public.practice_updates IS 'Practice-changing medical information';
COMMENT ON TABLE public.disease_reports IS 'Global disease surveillance reports';
COMMENT ON TABLE public.study_groups IS 'Collaborative study groups';
COMMENT ON TABLE public.community_posts IS 'Community forum discussions';
COMMENT ON TABLE public.messages IS 'Direct and group messaging';
COMMENT ON TABLE public.cme_activities IS 'Continuing Medical Education tracking';
COMMENT ON TABLE public.debates IS 'Medical debate forum';
COMMENT ON TABLE public.user_engagement IS 'User interaction tracking';
COMMENT ON TABLE public.notifications IS 'User notifications';

-- End of migration