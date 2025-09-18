-- Row Level Security Policies for SimpleLMS
-- This ensures data security at the database level

-- ================================================
-- ENABLE RLS ON ALL TABLES
-- ================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disease_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cme_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ================================================
-- PROFILES POLICIES
-- ================================================

-- Anyone can view profiles (public directory)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (handled by trigger, but adding for completeness)
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ================================================
-- QUIZZES POLICIES
-- ================================================

-- Anyone can view published quizzes
CREATE POLICY "Published quizzes are viewable by everyone"
  ON public.quizzes FOR SELECT
  USING (is_published = true);

-- Authenticated users can create quizzes
CREATE POLICY "Authenticated users can create quizzes"
  ON public.quizzes FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Quiz creators can update their own quizzes
CREATE POLICY "Users can update own quizzes"
  ON public.quizzes FOR UPDATE
  USING (auth.uid() = created_by);

-- Quiz creators can delete their own quizzes
CREATE POLICY "Users can delete own quizzes"
  ON public.quizzes FOR DELETE
  USING (auth.uid() = created_by);

-- Admins can manage all quizzes
CREATE POLICY "Admins can manage all quizzes"
  ON public.quizzes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ================================================
-- QUESTIONS POLICIES
-- ================================================

-- Questions are viewable if the quiz is published
CREATE POLICY "Questions viewable with published quiz"
  ON public.questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes
      WHERE quizzes.id = questions.quiz_id
      AND (quizzes.is_published = true OR quizzes.created_by = auth.uid())
    )
  );

-- Quiz creators can manage questions
CREATE POLICY "Quiz creators can manage questions"
  ON public.questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes
      WHERE quizzes.id = questions.quiz_id
      AND quizzes.created_by = auth.uid()
    )
  );

-- ================================================
-- QUIZ ATTEMPTS POLICIES
-- ================================================

-- Users can view their own attempts
CREATE POLICY "Users can view own quiz attempts"
  ON public.quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own attempts
CREATE POLICY "Users can create own quiz attempts"
  ON public.quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own incomplete attempts
CREATE POLICY "Users can update own incomplete attempts"
  ON public.quiz_attempts FOR UPDATE
  USING (auth.uid() = user_id AND is_completed = false);

-- ================================================
-- PRACTICE UPDATES POLICIES
-- ================================================

-- Published updates are public
CREATE POLICY "Published practice updates are public"
  ON public.practice_updates FOR SELECT
  USING (status = 'published');

-- Authors can view their own drafts
CREATE POLICY "Authors can view own practice updates"
  ON public.practice_updates FOR SELECT
  USING (auth.uid() = author_id);

-- Authenticated users can create updates
CREATE POLICY "Authenticated users can create practice updates"
  ON public.practice_updates FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Authors can update their own updates
CREATE POLICY "Authors can update own practice updates"
  ON public.practice_updates FOR UPDATE
  USING (auth.uid() = author_id);

-- Authors can delete their own drafts
CREATE POLICY "Authors can delete own draft updates"
  ON public.practice_updates FOR DELETE
  USING (auth.uid() = author_id AND status = 'draft');

-- ================================================
-- DISEASE REPORTS POLICIES
-- ================================================

-- All reports are publicly viewable (public health)
CREATE POLICY "Disease reports are public"
  ON public.disease_reports FOR SELECT
  USING (true);

-- Authenticated medical professionals can create reports
CREATE POLICY "Medical professionals can create disease reports"
  ON public.disease_reports FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('resident', 'fellow', 'attending', 'admin')
    )
  );

-- Reporters can update their own unverified reports
CREATE POLICY "Reporters can update own unverified reports"
  ON public.disease_reports FOR UPDATE
  USING (auth.uid() = reported_by AND verified = false);

-- ================================================
-- STUDY GROUPS POLICIES
-- ================================================

-- Public groups are viewable by all
CREATE POLICY "Public study groups are viewable"
  ON public.study_groups FOR SELECT
  USING (
    is_private = false OR
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = study_groups.id
      AND group_members.user_id = auth.uid()
    )
  );

-- Authenticated users can create groups
CREATE POLICY "Authenticated users can create study groups"
  ON public.study_groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Group owners can update their groups
CREATE POLICY "Group owners can update their groups"
  ON public.study_groups FOR UPDATE
  USING (auth.uid() = created_by);

-- Group owners can delete their groups
CREATE POLICY "Group owners can delete their groups"
  ON public.study_groups FOR DELETE
  USING (auth.uid() = created_by);

-- ================================================
-- GROUP MEMBERS POLICIES
-- ================================================

-- Members can view their group memberships
CREATE POLICY "Members can view group memberships"
  ON public.group_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.group_members gm2
      WHERE gm2.group_id = group_members.group_id
      AND gm2.user_id = auth.uid()
    )
  );

-- Users can join public groups
CREATE POLICY "Users can join public groups"
  ON public.group_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.study_groups
      WHERE study_groups.id = group_id
      AND study_groups.is_private = false
    )
  );

-- Users can leave groups
CREATE POLICY "Users can leave groups"
  ON public.group_members FOR DELETE
  USING (user_id = auth.uid());

-- Group owners can manage members
CREATE POLICY "Group owners can manage members"
  ON public.group_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.study_groups
      WHERE study_groups.id = group_members.group_id
      AND study_groups.created_by = auth.uid()
    )
  );

-- ================================================
-- COMMUNITY POSTS POLICIES
-- ================================================

-- All posts are publicly viewable
CREATE POLICY "Community posts are public"
  ON public.community_posts FOR SELECT
  USING (true);

-- Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Authors can update their own posts
CREATE POLICY "Authors can update own posts"
  ON public.community_posts FOR UPDATE
  USING (auth.uid() = author_id);

-- Authors can delete their own posts
CREATE POLICY "Authors can delete own posts"
  ON public.community_posts FOR DELETE
  USING (auth.uid() = author_id);

-- ================================================
-- COMMENTS POLICIES
-- ================================================

-- Comments are publicly viewable
CREATE POLICY "Comments are public"
  ON public.comments FOR SELECT
  USING (true);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Authors can update their own comments
CREATE POLICY "Authors can update own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = author_id);

-- Authors can delete their own comments
CREATE POLICY "Authors can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = author_id);

-- ================================================
-- MESSAGES POLICIES
-- ================================================

-- Users can view messages they sent or received
CREATE POLICY "Users can view own messages"
  ON public.messages FOR SELECT
  USING (
    auth.uid() = sender_id OR
    auth.uid() = receiver_id OR
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = messages.group_id
      AND group_members.user_id = auth.uid()
    )
  );

-- Users can send messages
CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Senders can update their own messages
CREATE POLICY "Senders can update own messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = sender_id);

-- ================================================
-- CME ACTIVITIES POLICIES
-- ================================================

-- Users can view their own CME activities
CREATE POLICY "Users can view own CME activities"
  ON public.cme_activities FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own CME activities
CREATE POLICY "Users can create own CME activities"
  ON public.cme_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own CME activities
CREATE POLICY "Users can update own CME activities"
  ON public.cme_activities FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own CME activities
CREATE POLICY "Users can delete own CME activities"
  ON public.cme_activities FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================
-- DEBATES POLICIES
-- ================================================

-- Debates are publicly viewable
CREATE POLICY "Debates are public"
  ON public.debates FOR SELECT
  USING (true);

-- Authenticated users can create debates
CREATE POLICY "Authenticated users can create debates"
  ON public.debates FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Creators can update their own debates
CREATE POLICY "Creators can update own debates"
  ON public.debates FOR UPDATE
  USING (auth.uid() = created_by AND is_concluded = false);

-- ================================================
-- USER ENGAGEMENT POLICIES
-- ================================================

-- Users can view their own engagement
CREATE POLICY "Users can view own engagement"
  ON public.user_engagement FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own engagement records
CREATE POLICY "Users can create own engagement"
  ON public.user_engagement FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own engagement records
CREATE POLICY "Users can delete own engagement"
  ON public.user_engagement FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================
-- NOTIFICATIONS POLICIES
-- ================================================

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- System can create notifications for users
CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================
-- GRANT PERMISSIONS FOR AUTHENTICATED USERS
-- ================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ================================================
-- GRANT PERMISSIONS FOR SERVICE ROLE (for admin operations)
-- ================================================

GRANT ALL ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;