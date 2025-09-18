# Firebase to Supabase Migration Guide

## Overview
Migrating SimpleLMS from Firebase to Supabase for better performance, lower costs, and improved data relationships.

## Migration Checklist

### Phase 1: Setup (Day 1)
- [ ] Create Supabase project
- [ ] Design PostgreSQL schema
- [ ] Set up database tables
- [ ] Configure RLS policies
- [ ] Set up Edge Functions

### Phase 2: Data Migration (Day 2-3)
- [ ] Export Firebase data
- [ ] Transform to PostgreSQL format
- [ ] Import to Supabase
- [ ] Verify data integrity
- [ ] Set up backups

### Phase 3: Code Migration (Day 4-5)
- [ ] Replace Firebase SDK with Supabase
- [ ] Update authentication
- [ ] Convert Firestore queries to SQL
- [ ] Update real-time listeners
- [ ] Migrate file storage

### Phase 4: Testing (Day 6-7)
- [ ] Test all CRUD operations
- [ ] Verify authentication flows
- [ ] Test real-time features
- [ ] Performance testing
- [ ] Security audit

## Database Schema Design

### Core Tables

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('student', 'resident', 'fellow', 'attending', 'admin')),
  specialty TEXT,
  institution TEXT,
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quizzes table
CREATE TABLE quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  specialty TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
  question_count INTEGER DEFAULT 0,
  estimated_time INTEGER,
  pass_percentage INTEGER DEFAULT 70,
  created_by UUID REFERENCES profiles(id),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions table
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice',
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  points INTEGER DEFAULT 1,
  image_url TEXT,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz attempts
CREATE TABLE quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  score INTEGER,
  total_points INTEGER,
  percentage DECIMAL(5,2),
  time_taken INTEGER,
  answers JSONB,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Practice updates
CREATE TABLE practice_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  author_id UUID REFERENCES profiles(id),
  specialty TEXT,
  impact_level TEXT CHECK (impact_level IN ('low', 'medium', 'high', 'critical')),
  source_url TEXT,
  source_journal TEXT,
  publication_date DATE,
  tags TEXT[],
  evidence_level TEXT,
  status TEXT DEFAULT 'draft',
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disease reports
CREATE TABLE disease_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  condition TEXT NOT NULL,
  icd10_code TEXT,
  country TEXT NOT NULL,
  state TEXT,
  city TEXT,
  facility TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  severity TEXT CHECK (severity IN ('low', 'moderate', 'high', 'critical')),
  cases_count INTEGER DEFAULT 0,
  deaths_count INTEGER DEFAULT 0,
  recovered_count INTEGER DEFAULT 0,
  reported_by UUID REFERENCES profiles(id),
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES profiles(id),
  alert_level TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study groups
CREATE TABLE study_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  specialty TEXT,
  level TEXT,
  is_private BOOLEAN DEFAULT false,
  max_members INTEGER DEFAULT 50,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group members
CREATE TABLE group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Messages
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id),
  receiver_id UUID REFERENCES profiles(id),
  group_id UUID REFERENCES study_groups(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community posts
CREATE TABLE community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES profiles(id),
  title TEXT,
  content TEXT NOT NULL,
  category TEXT,
  specialty TEXT,
  tags TEXT[],
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id),
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_quizzes_category ON quizzes(category);
CREATE INDEX idx_quizzes_specialty ON quizzes(specialty);
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_practice_updates_specialty ON practice_updates(specialty);
CREATE INDEX idx_practice_updates_status ON practice_updates(status);
CREATE INDEX idx_disease_reports_country ON disease_reports(country);
CREATE INDEX idx_disease_reports_severity ON disease_reports(severity);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_community_posts_category ON community_posts(category);
```

## Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Quiz policies
CREATE POLICY "Anyone can view published quizzes" ON quizzes
  FOR SELECT USING (is_published = true);

CREATE POLICY "Creators can manage own quizzes" ON quizzes
  FOR ALL USING (auth.uid() = created_by);

-- Quiz attempts policies
CREATE POLICY "Users can view own attempts" ON quiz_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own attempts" ON quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR
    auth.uid() = receiver_id OR
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = messages.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Community posts policies
CREATE POLICY "Anyone can view posts" ON community_posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON community_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts" ON community_posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts" ON community_posts
  FOR DELETE USING (auth.uid() = author_id);
```

## Key Differences from Firebase

### 1. Authentication
```typescript
// Firebase
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
const auth = getAuth();
await signInWithEmailAndPassword(auth, email, password);

// Supabase
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, key);
await supabase.auth.signInWithPassword({ email, password });
```

### 2. Database Queries
```typescript
// Firebase (NoSQL)
const q = query(
  collection(db, 'quizzes'),
  where('category', '==', 'cardiology'),
  orderBy('createdAt', 'desc'),
  limit(10)
);
const snapshot = await getDocs(q);

// Supabase (SQL)
const { data, error } = await supabase
  .from('quizzes')
  .select('*')
  .eq('category', 'cardiology')
  .order('created_at', { ascending: false })
  .limit(10);
```

### 3. Real-time Subscriptions
```typescript
// Firebase
onSnapshot(doc(db, 'posts', postId), (doc) => {
  console.log('Document updated:', doc.data());
});

// Supabase
supabase
  .channel('posts')
  .on('postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'posts', filter: `id=eq.${postId}` },
    (payload) => console.log('Post updated:', payload.new)
  )
  .subscribe();
```

### 4. File Storage
```typescript
// Firebase Storage
import { getStorage, ref, uploadBytes } from 'firebase/storage';
const storage = getStorage();
const storageRef = ref(storage, 'images/file.jpg');
await uploadBytes(storageRef, file);

// Supabase Storage
const { data, error } = await supabase
  .storage
  .from('images')
  .upload('file.jpg', file);
```

## Migration Steps

### Step 1: Install Supabase
```bash
npm install @supabase/supabase-js
npm uninstall firebase
```

### Step 2: Environment Variables
```env
# Replace Firebase config with:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key # Server-side only
```

### Step 3: Create Supabase Client
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
```

## Benefits After Migration

1. **Cost Savings**: ~$200/month vs $700/month at scale
2. **Performance**: 10x faster complex queries
3. **HIPAA Compliance**: Built-in with BAA available
4. **SQL Power**: Complex analytics with single queries
5. **Open Source**: No vendor lock-in
6. **Better DX**: TypeScript types auto-generated
7. **Built-in Features**:
   - Row Level Security
   - Database functions
   - Triggers
   - Full-text search
   - PostGIS for location data

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Data loss during migration | Backup Firebase data, test migration on staging |
| Learning curve for SQL | Supabase has excellent docs and AI assistant |
| Real-time performance | Supabase real-time is actually faster |
| File storage limits | Supabase storage is more generous |

## Timeline

- **Day 1**: Set up Supabase, create schema
- **Day 2-3**: Migrate existing data
- **Day 4-5**: Update all code
- **Day 6**: Testing
- **Day 7**: Final verification and cleanup

## Post-Migration Checklist

- [ ] All authentication flows working
- [ ] Quiz system fully functional
- [ ] File uploads working
- [ ] Real-time features operational
- [ ] RLS policies tested
- [ ] Performance benchmarked
- [ ] Costs verified
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] Documentation updated