// lib/openaiQuizEnhancer.ts - Enhanced quiz explanation generator
import { 
  collection, 
  getDocs, 
  updateDoc, 
  doc, 
  writeBatch,
  serverTimestamp,
  query,
  where,
  limit as firestoreLimit
} from 'firebase/firestore';
import { db } from './firebase';

// Enhanced TypeScript interfaces
export interface ExplanationEnhancementResult {
  processedQuizzes: number;
  processedQuestions: number;
  enhancedQuestions: number;
  failedQuestions: number;
  skippedQuestions: number;
  success: boolean;
  errors: Array<{quizId: string; questionId: string; error: string}>;
  duration: number;
}

export interface EnhancementPreviewResult {
  quizId: string;
  quizTitle: string;
  questionId: string;
  questionText: string;
  currentCorrectExplanation: string;
  currentIncorrectExplanation: string;
  aiCorrectExplanation: string;
  aiIncorrectExplanation: string;
  needsEnhancement: boolean;
  category: string;
}

export interface EnhancementProgress {
  totalQuizzes: number;
  processedQuizzes: number;
  totalQuestions: number;
  processedQuestions: number;
  enhancedQuestions: number;
  failedQuestions: number;
  currentQuiz?: string;
  currentQuestion?: string;
  estimatedTimeRemaining?: number;
}

export interface QuestionData {
  question: string;
  options: string[];
  correctAnswer: number;
  incorrectExplanation?: string;
  correctExplanation?: string;
  category?: string;
  specialty?: string;
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

// Configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 2000, // 2 seconds (longer for explanation generation)
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2
};

const BATCH_SIZE = 100; // Smaller batches for explanations
const RATE_LIMIT_DELAY = 3000; // 3 seconds between API calls (explanations take longer)
const PROGRESS_UPDATE_INTERVAL = 5; // Update progress every 5 questions

// Progress callback type
export type EnhancementProgressCallback = (progress: EnhancementProgress) => void;

/**
 * Enhanced quiz explanation generator with comprehensive teaching material
 */
export const enhanceQuizExplanationsWithOpenAI = async (
  progressCallback?: EnhancementProgressCallback,
  retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG,
  targetQuizId?: string // Optional: enhance specific quiz
): Promise<ExplanationEnhancementResult> => {
  const startTime = Date.now();
  let processedQuizzes = 0;
  let processedQuestions = 0;
  let enhancedQuestions = 0;
  let failedQuestions = 0;
  let skippedQuestions = 0;
  const errors: Array<{quizId: string; questionId: string; error: string}> = [];

  try {
    
    // Get all quizzes (courses)
    const coursesRef = collection(db, 'courses');
    const coursesSnapshot = await getDocs(coursesRef);
    
    if (coursesSnapshot.empty) {
      return createEmptyResult(startTime);
    }
    
    // Filter for specific quiz if provided
    const quizzesToProcess = coursesSnapshot.docs.filter(doc => 
      !targetQuizId || doc.id === targetQuizId
    );
    
    const totalQuizzes = quizzesToProcess.length;
    
    // Count total questions first for accurate progress
    let totalQuestions = 0;
    for (const quizDoc of quizzesToProcess) {
      const questionsRef = collection(db, 'courses', quizDoc.id, 'questions');
      const questionsSnapshot = await getDocs(questionsRef);
      totalQuestions += questionsSnapshot.size;
    }
    
    
    // Initialize progress
    if (progressCallback) {
      progressCallback({
        totalQuizzes,
        processedQuizzes: 0,
        totalQuestions,
        processedQuestions: 0,
        enhancedQuestions: 0,
        failedQuestions: 0
      });
    }

    let batch = writeBatch(db);
    let batchCount = 0;
    
    // Process each quiz
    for (const quizDoc of quizzesToProcess) {
      const quizData = quizDoc.data();
      const quizId = quizDoc.id;
      const quizTitle = quizData.NewTitle || quizData.OriginalQuizTitle || quizData.CourseName || quizId;
      
      try {
        
        // Get all questions for this quiz
        const questionsRef = collection(db, 'courses', quizId, 'questions');
        const questionsSnapshot = await getDocs(questionsRef);
        
        if (questionsSnapshot.empty) {
          processedQuizzes++;
          continue;
        }
        
        // Process each question
        for (const questionDoc of questionsSnapshot.docs) {
          const questionData = questionDoc.data() as QuestionData;
          const questionId = questionDoc.id;
          
          try {
            // Check if explanations need enhancement
            const needsCorrectExplanation = !questionData.correctExplanation || 
                                          questionData.correctExplanation.trim() === '';
            const needsIncorrectExplanation = !questionData.incorrectExplanation || 
                                            questionData.incorrectExplanation.trim() === '';
            
            if (!needsCorrectExplanation && !needsIncorrectExplanation) {
              processedQuestions++;
              skippedQuestions++;
              continue;
            }
            
            // Update progress
            if (progressCallback && processedQuestions % PROGRESS_UPDATE_INTERVAL === 0) {
              const remainingQuestions = totalQuestions - processedQuestions;
              const avgTimePerQuestion = (Date.now() - startTime) / Math.max(processedQuestions, 1);
              const estimatedTimeRemaining = remainingQuestions * avgTimePerQuestion;
              
              progressCallback({
                totalQuizzes,
                processedQuizzes,
                totalQuestions,
                processedQuestions,
                enhancedQuestions,
                failedQuestions,
                currentQuiz: quizTitle,
                currentQuestion: questionData.question?.substring(0, 50) + '...',
                estimatedTimeRemaining
              });
            }
            
            
            // Generate enhanced explanations with AI
            const enhancementResult = await generateEnhancedExplanationsWithRetry(
              questionData, 
              quizData.Category || 'Medical Knowledge',
              retryConfig
            );
            
            if (enhancementResult.success) {
              // Prepare update data
              const updateData: any = {
                explanationEnhancedAt: serverTimestamp(),
                explanationEnhancedBy: 'openai',
                explanationVersion: '2.0'
              };
              
              if (needsCorrectExplanation && enhancementResult.correctExplanation) {
                updateData.correctExplanation = enhancementResult.correctExplanation;
              }
              
              if (needsIncorrectExplanation && enhancementResult.incorrectExplanation) {
                updateData.incorrectExplanation = enhancementResult.incorrectExplanation;
              }
              
              // Add to batch
              batch.update(questionDoc.ref, updateData);
              batchCount++;
              enhancedQuestions++;
              
            } else {
              errors.push({quizId, questionId, error: enhancementResult.error || 'Unknown error'});
              failedQuestions++;
            }
            
            processedQuestions++;
            
            // Commit batch if it reaches the limit
            if (batchCount >= BATCH_SIZE) {
              await batch.commit();
              batch = writeBatch(db);
              batchCount = 0;
            }
            
            // Rate limiting to avoid API limits
            await sleep(RATE_LIMIT_DELAY);
            
          } catch (questionError) {
            if (process.env.NODE_ENV === 'development') {
              console.error(`❌ Error processing question ${questionId}:`, questionError);
            }
            errors.push({
              quizId,
              questionId, 
              error: questionError instanceof Error ? questionError.message : 'Unknown error'
            });
            processedQuestions++;
            failedQuestions++;
          }
        }
        
        processedQuizzes++;
        
      } catch (quizError) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`❌ Error processing quiz ${quizId}:`, quizError);
        }
        errors.push({
          quizId,
          questionId: 'N/A',
          error: quizError instanceof Error ? quizError.message : 'Unknown error'
        });
        processedQuizzes++;
      }
    }
    
    // Commit any remaining items in the batch
    if (batchCount > 0) {
      await batch.commit();
    }
    
    // Final progress update
    if (progressCallback) {
      progressCallback({
        totalQuizzes,
        processedQuizzes,
        totalQuestions,
        processedQuestions,
        enhancedQuestions,
        failedQuestions
      });
    }
    
    const duration = Date.now() - startTime;
    
    return {
      processedQuizzes,
      processedQuestions,
      enhancedQuestions,
      failedQuestions,
      skippedQuestions,
      success: failedQuestions < processedQuestions * 0.1, // Success if less than 10% failed
      errors,
      duration
    };
    
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Explanation enhancement failed:', error);
    }
    throw error;
  }
};

/**
 * Generate enhanced explanations with retry logic
 */
const generateEnhancedExplanationsWithRetry = async (
  questionData: QuestionData,
  category: string,
  retryConfig: RetryConfig
): Promise<{success: boolean; correctExplanation?: string; incorrectExplanation?: string; error?: string}> => {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.min(
          retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempt - 1),
          retryConfig.maxDelay
        );
        await sleep(delay);
      }
      
      const response = await fetch('/api/ai/enhance-quiz-explanations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: questionData.question,
          options: questionData.options,
          correctAnswer: questionData.correctAnswer,
          category: category,
          currentCorrectExplanation: questionData.correctExplanation || '',
          currentIncorrectExplanation: questionData.incorrectExplanation || ''
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded');
        } else if (response.status >= 500) {
          throw new Error(`Server error: ${response.status}`);
        } else {
          throw new Error(`HTTP error: ${response.status}`);
        }
      }

      const data = await response.json();
      
      if (!data.correctExplanation && !data.incorrectExplanation) {
        throw new Error('No explanations returned from API');
      }
      
      return {
        success: true,
        correctExplanation: data.correctExplanation,
        incorrectExplanation: data.incorrectExplanation
      };
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Don't retry for certain errors
      if (lastError.message.includes('Invalid question') || lastError.message.includes('No content')) {
        break;
      }
    }
  }
  
  return {
    success: false,
    error: lastError?.message || 'All retry attempts failed'
  };
};

/**
 * Preview explanation enhancements
 */
export const previewExplanationEnhancements = async (
  limitCount: number = 5,
  progressCallback?: EnhancementProgressCallback
): Promise<EnhancementPreviewResult[]> => {
  try {
    
    const preview: EnhancementPreviewResult[] = [];
    let count = 0;
    
    // Get quizzes
    const coursesRef = collection(db, 'courses');
    const coursesSnapshot = await getDocs(query(coursesRef, firestoreLimit(5))); // Check first 5 quizzes
    
    for (const quizDoc of coursesSnapshot.docs) {
      if (count >= limitCount) {
        break;
      }
      
      const quizData = quizDoc.data();
      const quizId = quizDoc.id;
      const quizTitle = quizData.NewTitle || quizData.OriginalQuizTitle || quizData.CourseName || quizId;
      
      // Get questions
      const questionsRef = collection(db, 'courses', quizId, 'questions');
      const questionsSnapshot = await getDocs(query(questionsRef, firestoreLimit(3))); // First 3 questions per quiz
      
      for (const questionDoc of questionsSnapshot.docs) {
        if (count >= limitCount) {
          break;
        }
        
        const questionData = questionDoc.data() as QuestionData;
        const questionId = questionDoc.id;
        
        // Check if needs enhancement
        const needsCorrectExplanation = !questionData.correctExplanation || 
                                      questionData.correctExplanation.trim() === '';
        const needsIncorrectExplanation = !questionData.incorrectExplanation || 
                                        questionData.incorrectExplanation.trim() === '';
        
        if (!needsCorrectExplanation && !needsIncorrectExplanation) {
          continue; // Skip questions that don't need enhancement
        }
        
        // Update progress
        if (progressCallback) {
          progressCallback({
            totalQuizzes: 1,
            processedQuizzes: 0,
            totalQuestions: limitCount,
            processedQuestions: count,
            enhancedQuestions: 0,
            failedQuestions: 0,
            currentQuiz: quizTitle,
            currentQuestion: questionData.question?.substring(0, 50) + '...'
          });
        }
        
        // Get AI enhancement preview
        const enhancementResult = await generateEnhancedExplanationsWithRetry(
          questionData,
          quizData.Category || 'Medical Knowledge',
          {
            ...DEFAULT_RETRY_CONFIG,
            maxRetries: 1 // Fewer retries for preview
          }
        );
        
        preview.push({
          quizId,
          quizTitle,
          questionId,
          questionText: questionData.question || 'No question text',
          currentCorrectExplanation: questionData.correctExplanation || 'MISSING',
          currentIncorrectExplanation: questionData.incorrectExplanation || 'MISSING',
          aiCorrectExplanation: enhancementResult.correctExplanation || 'COULD_NOT_GENERATE',
          aiIncorrectExplanation: enhancementResult.incorrectExplanation || 'COULD_NOT_GENERATE',
          needsEnhancement: needsCorrectExplanation || needsIncorrectExplanation,
          category: quizData.Category || 'Medical Knowledge'
        });
        
        count++;
        
        // Small delay to avoid rate limits
        await sleep(1000);
      }
    }
    
    console.table(preview.map(p => ({
      Quiz: p.quizTitle.substring(0, 30),
      Question: p.questionText.substring(0, 50),
      NeedsEnhancement: p.needsEnhancement,
      Category: p.category
    })));
    
    
    return preview;
    
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Preview failed:', error);
    }
    throw error;
  }
};

/**
 * Get enhancement statistics
 */
export const getEnhancementStatistics = async (): Promise<{
  totalQuizzes: number;
  totalQuestions: number;
  questionsWithCorrectExplanations: number;
  questionsWithIncorrectExplanations: number;
  questionsNeedingEnhancement: number;
  enhancementsByCategory: Record<string, number>;
  lastUpdated: Date;
}> => {
  try {
    const coursesRef = collection(db, 'courses');
    const coursesSnapshot = await getDocs(coursesRef);
    
    const stats = {
      totalQuizzes: coursesSnapshot.size,
      totalQuestions: 0,
      questionsWithCorrectExplanations: 0,
      questionsWithIncorrectExplanations: 0,
      questionsNeedingEnhancement: 0,
      enhancementsByCategory: {} as Record<string, number>,
      lastUpdated: new Date()
    };
    
    for (const quizDoc of coursesSnapshot.docs) {
      const quizData = quizDoc.data();
      const category = quizData.Category || 'Medical Knowledge';
      
      const questionsRef = collection(db, 'courses', quizDoc.id, 'questions');
      const questionsSnapshot = await getDocs(questionsRef);
      
      stats.totalQuestions += questionsSnapshot.size;
      
      questionsSnapshot.forEach(questionDoc => {
        const questionData = questionDoc.data();
        
        const hasCorrectExplanation = questionData.correctExplanation && 
                                    questionData.correctExplanation.trim() !== '';
        const hasIncorrectExplanation = questionData.incorrectExplanation && 
                                      questionData.incorrectExplanation.trim() !== '';
        
        if (hasCorrectExplanation) {
          stats.questionsWithCorrectExplanations++;
        }
        
        if (hasIncorrectExplanation) {
          stats.questionsWithIncorrectExplanations++;
        }
        
        if (!hasCorrectExplanation || !hasIncorrectExplanation) {
          stats.questionsNeedingEnhancement++;
          stats.enhancementsByCategory[category] = (stats.enhancementsByCategory[category] || 0) + 1;
        }
      });
    }
    
    
    return stats;
    
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting enhancement statistics:', error);
    }
    throw error;
  }
};

/**
 * Utility functions
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const createEmptyResult = (startTime: number): ExplanationEnhancementResult => ({
  processedQuizzes: 0,
  processedQuestions: 0,
  enhancedQuestions: 0,
  failedQuestions: 0,
  skippedQuestions: 0,
  success: true,
  errors: [],
  duration: Date.now() - startTime
});

/**
 * Enhancement controller for cancellation support
 */
export class ExplanationEnhancementController {
  private cancelled = false;
  
  cancel() {
    this.cancelled = true;
  }
  
  isCancelled() {
    return this.cancelled;
  }
}