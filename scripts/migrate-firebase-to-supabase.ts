#!/usr/bin/env node

/**
 * Migration Script: Firebase to Supabase
 * This script migrates data from Firebase to Supabase
 *
 * Usage: npm run migrate:firebase-to-supabase
 */

import { createClient } from '@supabase/supabase-js';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  limit
} from 'firebase/firestore';
import { db as firebaseDb } from '../lib/firebase';
import * as dotenv from 'dotenv';
import { getAuth } from 'firebase/auth';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role for admin access
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Progress tracking
let progress = {
  users: { total: 0, migrated: 0, failed: 0 },
  quizzes: { total: 0, migrated: 0, failed: 0 },
  questions: { total: 0, migrated: 0, failed: 0 },
  attempts: { total: 0, migrated: 0, failed: 0 }
};

// Logging utilities
const log = {
  info: (msg: string) => console.log(`✅ ${msg}`),
  error: (msg: string, error?: any) => console.error(`❌ ${msg}`, error || ''),
  warning: (msg: string) => console.log(`⚠️  ${msg}`),
  progress: () => console.table(progress)
};

/**
 * Migrate Users from Firebase Auth to Supabase Auth
 */
async function migrateUsers() {
  log.info('Starting user migration...');

  try {
    // Get users from Firebase (you might need Firebase Admin SDK for full user list)
    // For now, we'll migrate from the users collection if you have one
    const usersSnapshot = await getDocs(collection(firebaseDb, 'users'));
    progress.users.total = usersSnapshot.size;

    for (const userDoc of usersSnapshot.docs) {
      try {
        const userData = userDoc.data();

        // Create user in Supabase Auth (if using Admin API)
        // Note: You'll need to use Supabase Admin API for this
        // For now, we'll just create the profile

        const { data: profile, error } = await supabase
          .from('profiles')
          .upsert({
            id: userDoc.id, // You might need to generate new UUIDs
            email: userData.email,
            full_name: userData.displayName || userData.name,
            avatar_url: userData.photoURL || userData.profilePicture,
            role: userData.role || 'student',
            specialty: userData.specialty,
            institution: userData.institution,
            subscription_tier: userData.subscriptionTier || 'free',
            subscription_status: userData.subscriptionStatus || 'active',
            stripe_customer_id: userData.stripeCustomerId,
            total_quizzes_taken: userData.totalQuizzesTaken || 0,
            created_at: userData.createdAt?.toDate?.() || new Date()
          })
          .select();

        if (error) throw error;

        progress.users.migrated++;
        log.info(`Migrated user: ${userData.email}`);
      } catch (error) {
        progress.users.failed++;
        log.error(`Failed to migrate user ${userDoc.id}:`, error);
      }
    }
  } catch (error) {
    log.error('User migration failed:', error);
  }
}

/**
 * Migrate Quizzes
 */
async function migrateQuizzes() {
  log.info('Starting quiz migration...');

  try {
    // First try 'quizzes' collection, then 'courses' if that's what you're using
    let quizzesSnapshot;
    try {
      quizzesSnapshot = await getDocs(collection(firebaseDb, 'quizzes'));
    } catch {
      log.warning('No "quizzes" collection found, trying "courses"...');
      quizzesSnapshot = await getDocs(collection(firebaseDb, 'courses'));
    }

    progress.quizzes.total = quizzesSnapshot.size;

    for (const quizDoc of quizzesSnapshot.docs) {
      try {
        const quizData = quizDoc.data();

        const { data: quiz, error } = await supabase
          .from('quizzes')
          .insert({
            id: quizDoc.id,
            title: quizData.title || quizData.name,
            description: quizData.description,
            category: quizData.category || 'General',
            specialty: quizData.specialty,
            difficulty: quizData.difficulty?.toLowerCase() || 'intermediate',
            question_count: quizData.questionCount || quizData.questions?.length || 0,
            estimated_time: quizData.estimatedTime || 20,
            pass_percentage: quizData.passPercentage || 70,
            exam_type: quizData.examType,
            tags: quizData.tags || [],
            is_published: quizData.isPublished !== false,
            is_premium: quizData.isPremium || false,
            created_at: quizData.createdAt?.toDate?.() || new Date()
          })
          .select()
          .single();

        if (error) throw error;

        progress.quizzes.migrated++;
        log.info(`Migrated quiz: ${quizData.title}`);

        // Migrate questions for this quiz
        await migrateQuestionsForQuiz(quizDoc.id, quiz.id);

      } catch (error) {
        progress.quizzes.failed++;
        log.error(`Failed to migrate quiz ${quizDoc.id}:`, error);
      }
    }
  } catch (error) {
    log.error('Quiz migration failed:', error);
  }
}

/**
 * Migrate Questions for a specific quiz
 */
async function migrateQuestionsForQuiz(firebaseQuizId: string, supabaseQuizId: string) {
  try {
    const questionsSnapshot = await getDocs(
      collection(firebaseDb, `courses/${firebaseQuizId}/questions`)
    );

    if (questionsSnapshot.empty) {
      log.warning(`No questions found for quiz ${firebaseQuizId}`);
      return;
    }

    progress.questions.total += questionsSnapshot.size;

    const questions = questionsSnapshot.docs.map((doc, index) => {
      const q = doc.data();

      // Parse options based on different possible formats
      let options = {};
      if (q.options) {
        if (typeof q.options === 'string') {
          try {
            // Try to parse if it's a JSON string
            const parsed = JSON.parse(q.options);
            options = parsed;
          } catch {
            // If not JSON, try to parse as "A) Option, B) Option" format
            const optionMatches = q.options.match(/([A-E])\)\s*([^,]+)/g);
            if (optionMatches) {
              optionMatches.forEach((match: string) => {
                const [key, value] = match.split(')');
                options[key.trim()] = value.trim();
              });
            }
          }
        } else if (Array.isArray(q.options)) {
          // Convert array to object with A, B, C, D keys
          q.options.forEach((opt: string, i: number) => {
            options[String.fromCharCode(65 + i)] = opt;
          });
        } else {
          options = q.options;
        }
      }

      return {
        quiz_id: supabaseQuizId,
        question_text: q.question || q.questionText || q.text,
        question_type: q.questionType || 'multiple_choice',
        options: options,
        correct_answer: q.correctAnswer || q.answer,
        explanation: q.explanation || q.rationale,
        clinical_vignette: q.clinicalVignette || q.vignette,
        difficulty: q.difficulty || 3,
        points: q.points || 1,
        order_index: q.orderIndex || index,
        topic: q.topic,
        created_at: q.createdAt?.toDate?.() || new Date()
      };
    });

    // Batch insert questions
    const { data, error } = await supabase
      .from('questions')
      .insert(questions)
      .select();

    if (error) throw error;

    progress.questions.migrated += questions.length;
    log.info(`Migrated ${questions.length} questions for quiz ${supabaseQuizId}`);

  } catch (error) {
    progress.questions.failed++;
    log.error(`Failed to migrate questions for quiz ${firebaseQuizId}:`, error);
  }
}

/**
 * Migrate Quiz Attempts
 */
async function migrateQuizAttempts() {
  log.info('Starting quiz attempts migration...');

  try {
    const attemptsSnapshot = await getDocs(
      query(collection(firebaseDb, 'quizAttempts'), limit(1000))
    );

    progress.attempts.total = attemptsSnapshot.size;

    for (const attemptDoc of attemptsSnapshot.docs) {
      try {
        const attemptData = attemptDoc.data();

        const { error } = await supabase
          .from('quiz_attempts')
          .insert({
            user_id: attemptData.userId,
            quiz_id: attemptData.quizId,
            score: attemptData.score || 0,
            total_points: attemptData.totalPoints,
            percentage: attemptData.percentage || attemptData.scorePercentage,
            correct_answers: attemptData.correctAnswers,
            incorrect_answers: attemptData.incorrectAnswers,
            time_taken: attemptData.timeTaken,
            answers: attemptData.answers || {},
            started_at: attemptData.startedAt?.toDate?.() || new Date(),
            completed_at: attemptData.completedAt?.toDate?.(),
            is_completed: attemptData.isCompleted || attemptData.completed || false,
            created_at: attemptData.createdAt?.toDate?.() || new Date()
          });

        if (error) throw error;

        progress.attempts.migrated++;
      } catch (error) {
        progress.attempts.failed++;
        log.error(`Failed to migrate attempt ${attemptDoc.id}:`, error);
      }
    }
  } catch (error) {
    log.error('Quiz attempts migration failed:', error);
  }
}

/**
 * Verify migration
 */
async function verifyMigration() {
  log.info('Verifying migration...');

  const checks = {
    profiles: 0,
    quizzes: 0,
    questions: 0,
    quiz_attempts: 0
  };

  try {
    // Count records in Supabase
    const { count: profileCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    checks.profiles = profileCount || 0;

    const { count: quizCount } = await supabase
      .from('quizzes')
      .select('*', { count: 'exact', head: true });
    checks.quizzes = quizCount || 0;

    const { count: questionCount } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true });
    checks.questions = questionCount || 0;

    const { count: attemptCount } = await supabase
      .from('quiz_attempts')
      .select('*', { count: 'exact', head: true });
    checks.quiz_attempts = attemptCount || 0;

    console.log('\n📊 Migration Verification:');
    console.table(checks);

  } catch (error) {
    log.error('Verification failed:', error);
  }
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('🚀 Starting Firebase to Supabase Migration');
  console.log('=========================================\n');

  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    log.error('Missing Supabase credentials in .env.local');
    log.warning('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  try {
    // Run migrations in sequence
    await migrateUsers();
    await migrateQuizzes();
    await migrateQuizAttempts();

    // Show final progress
    console.log('\n📈 Migration Progress:');
    log.progress();

    // Verify migration
    await verifyMigration();

    console.log('\n✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Update your authentication code to use Supabase Auth');
    console.log('2. Update all database queries to use Supabase');
    console.log('3. Test the application thoroughly');
    console.log('4. Remove Firebase dependencies once everything is working');

  } catch (error) {
    log.error('Migration failed with critical error:', error);
    process.exit(1);
  }
}

// Run migration
if (require.main === module) {
  migrate().catch(console.error);
}

export { migrate };