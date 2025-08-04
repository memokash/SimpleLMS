// lib/openaiCourseCategorizer.ts - Enhanced version with robust error handling and retry logic
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
export interface CategorizationResult {
  processedCount: number;
  categorizedCount: number;
  failedCount: number;
  skippedCount: number;
  success: boolean;
  errors: Array<{courseId: string; error: string}>;
  duration: number;
}

export interface PreviewResult {
  courseId: string;
  courseName: string;
  currentCategory: string;
  aiSuggestedCategory: string;
  needsUpdate: boolean;
  description: string;
  confidence?: string;
}

export interface CategoryStats {
  totalCourses: number;
  categorized: number;
  uncategorized: number;
  categories: Record<string, number>;
  sources: Record<string, number>;
  lastUpdated: Date;
}

export interface CategorizationProgress {
  total: number;
  processed: number;
  categorized: number;
  failed: number;
  currentCourse?: string;
  estimatedTimeRemaining?: number;
}

interface CourseContent {
  title: string;
  description: string;
  courseName: string;
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

// Enhanced configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2
};

const BATCH_SIZE = 500;
const RATE_LIMIT_DELAY = 1500; // 1.5 seconds between API calls
const PROGRESS_UPDATE_INTERVAL = 10; // Update progress every 10 courses

// Progress callback type
export type ProgressCallback = (progress: CategorizationProgress) => void;

/**
 * Enhanced categorization with retry logic, progress tracking, and robust error handling
 */
export const categorizeCoursesWithOpenAI = async (
  progressCallback?: ProgressCallback,
  retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<CategorizationResult> => {
  const startTime = Date.now();
  let processedCount = 0;
  let categorizedCount = 0;
  let failedCount = 0;
  let skippedCount = 0;
  const errors: Array<{courseId: string; error: string}> = [];

  try {
    console.log('🤖 Starting enhanced OpenAI course categorization...');
    
    // Get all courses that need categorization
    const coursesRef = collection(db, 'courses');
    const coursesSnapshot = await getDocs(coursesRef);
    
    if (coursesSnapshot.empty) {
      console.log('📝 No courses found');
      return { 
        processedCount: 0, 
        categorizedCount: 0, 
        failedCount: 0,
        skippedCount: 0,
        success: true,
        errors: [],
        duration: Date.now() - startTime
      };
    }
    
    const totalCourses = coursesSnapshot.size;
    console.log(`📊 Found ${totalCourses} courses to process`);
    
    // Initialize progress
    if (progressCallback) {
      progressCallback({
        total: totalCourses,
        processed: 0,
        categorized: 0,
        failed: 0
      });
    }

    let batch = writeBatch(db);
    let batchCount = 0;
    
    // Process each course with enhanced error handling
    for (const courseDoc of coursesSnapshot.docs) {
      const courseData = courseDoc.data();
      const courseId = courseDoc.id;
      const courseName = courseData.CourseName || courseData.NewTitle || courseId;
      
      try {
        console.log(`🔍 Processing course: ${courseName}`);
        
        // Skip if Category already exists
        if (courseData.Category) {
          console.log(`  ✅ Category already exists: ${courseData.Category}`);
          processedCount++;
          skippedCount++;
          continue;
        }
        
        // Prepare course content for OpenAI analysis
        const courseContent: CourseContent = {
          title: courseData.NewTitle || courseData.OriginalQuizTitle || courseData.CourseName || '',
          description: courseData.BriefDescription || '',
          courseName: courseData.CourseName || ''
        };
        
        // Skip if no meaningful content
        if (!courseContent.title && !courseContent.description && !courseContent.courseName) {
          console.log(`  ⚠️ No content to analyze for course ${courseId}`);
          errors.push({courseId, error: 'No content available for analysis'});
          processedCount++;
          failedCount++;
          continue;
        }
        
        // Get AI-powered category with retry logic
        const aiResult = await getOpenAICategoryWithRetry(courseContent, retryConfig);
        
        if (aiResult.success && aiResult.category) {
          // Update course document with AI category
          batch.update(courseDoc.ref, {
            Category: aiResult.category,
            categorySource: 'openai',
            categoryConfidence: aiResult.confidence || 'unknown',
            categoryGeneratedAt: serverTimestamp(),
            categoryVersion: '2.0' // Track version for future migrations
          });
          
          console.log(`  🤖 AI categorized as: ${aiResult.category} (${aiResult.confidence})`);
          batchCount++;
          categorizedCount++;
        } else {
          console.log(`  ⚠️ Could not categorize course ${courseId}: ${aiResult.error}`);
          errors.push({courseId, error: aiResult.error || 'Unknown error'});
          failedCount++;
        }
        
        processedCount++;
        
        // Update progress periodically
        if (progressCallback && processedCount % PROGRESS_UPDATE_INTERVAL === 0) {
          const remainingCourses = totalCourses - processedCount;
          const avgTimePerCourse = (Date.now() - startTime) / processedCount;
          const estimatedTimeRemaining = remainingCourses * avgTimePerCourse;
          
          progressCallback({
            total: totalCourses,
            processed: processedCount,
            categorized: categorizedCount,
            failed: failedCount,
            currentCourse: courseName,
            estimatedTimeRemaining
          });
        }
        
        // Commit batch if it reaches the limit
        if (batchCount >= BATCH_SIZE) {
          await batch.commit();
          console.log(`💾 Committed batch of ${batchCount} updates`);
          batch = writeBatch(db);
          batchCount = 0;
        }
        
        // Rate limiting to avoid API limits
        await sleep(RATE_LIMIT_DELAY);
        
      } catch (courseError) {
        console.error(`❌ Error processing course ${courseId}:`, courseError);
        errors.push({
          courseId, 
          error: courseError instanceof Error ? courseError.message : 'Unknown error'
        });
        processedCount++;
        failedCount++;
      }
    }
    
    // Commit any remaining items in the batch
    if (batchCount > 0) {
      await batch.commit();
      console.log(`💾 Committed final batch of ${batchCount} updates`);
    }
    
    // Final progress update
    if (progressCallback) {
      progressCallback({
        total: totalCourses,
        processed: processedCount,
        categorized: categorizedCount,
        failed: failedCount
      });
    }
    
    const duration = Date.now() - startTime;
    console.log(`🎉 Categorization complete!`);
    console.log(`📊 Results: ${processedCount} processed, ${categorizedCount} categorized, ${failedCount} failed, ${skippedCount} skipped`);
    console.log(`⏱️ Duration: ${Math.round(duration / 1000)}s`);
    
    return {
      processedCount,
      categorizedCount,
      failedCount,
      skippedCount,
      success: failedCount < processedCount * 0.1, // Success if less than 10% failed
      errors,
      duration
    };
    
  } catch (error) {
    console.error('❌ Categorization failed:', error);
    throw error;
  }
};

/**
 * Enhanced OpenAI category retrieval with retry logic and exponential backoff
 */
const getOpenAICategoryWithRetry = async (
  courseContent: CourseContent,
  retryConfig: RetryConfig
): Promise<{success: boolean; category?: string; confidence?: string; error?: string}> => {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.min(
          retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempt - 1),
          retryConfig.maxDelay
        );
        console.log(`  🔄 Retry attempt ${attempt} after ${delay}ms delay`);
        await sleep(delay);
      }
      
      const response = await fetch('/api/ai/categorize-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: courseContent.title,
          description: courseContent.description,
          courseName: courseContent.courseName
        }),
      });

      if (!response.ok) {
        // Handle different HTTP error codes
        if (response.status === 429) {
          throw new Error('Rate limit exceeded');
        } else if (response.status >= 500) {
          throw new Error(`Server error: ${response.status}`);
        } else {
          throw new Error(`HTTP error: ${response.status}`);
        }
      }

      const data = await response.json();
      
      if (!data.category) {
        throw new Error('No category returned from API');
      }
      
      return {
        success: true,
        category: data.category,
        confidence: data.confidence
      };
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.log(`  ⚠️ Attempt ${attempt + 1} failed: ${lastError.message}`);
      
      // Don't retry for certain errors
      if (lastError.message.includes('No content') || lastError.message.includes('Invalid')) {
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
 * Enhanced preview with better error handling
 */
export const previewOpenAICategorization = async (
  limitCount: number = 5,
  progressCallback?: ProgressCallback
): Promise<PreviewResult[]> => {
  try {
    console.log(`🔍 Previewing OpenAI categorization (first ${limitCount} courses)...`);
    
    const coursesRef = collection(db, 'courses');
    const coursesSnapshot = await getDocs(query(coursesRef, firestoreLimit(limitCount * 2))); // Get extra in case some are skipped
    
    const preview: PreviewResult[] = [];
    let count = 0;
    let processed = 0;
    
    for (const courseDoc of coursesSnapshot.docs) {
      if (count >= limitCount) {
        break;
      }
      
      const courseData = courseDoc.data();
      const courseId = courseDoc.id;
      
      const courseContent: CourseContent = {
        title: courseData.NewTitle || courseData.OriginalQuizTitle || courseData.CourseName || '',
        description: courseData.BriefDescription || '',
        courseName: courseData.CourseName || ''
      };
      
      // Skip if no content
      if (!courseContent.title && !courseContent.description && !courseContent.courseName) {
        processed++;
        continue;
      }
      
      // Update progress
      if (progressCallback) {
        progressCallback({
          total: limitCount,
          processed: count,
          categorized: 0,
          failed: 0,
          currentCourse: courseContent.title || courseContent.courseName
        });
      }
      
      // Get AI prediction with retry
      const aiResult = await getOpenAICategoryWithRetry(courseContent, {
        ...DEFAULT_RETRY_CONFIG,
        maxRetries: 1 // Fewer retries for preview
      });
      
      preview.push({
        courseId,
        courseName: courseContent.title || courseContent.courseName,
        currentCategory: courseData.Category || 'MISSING',
        aiSuggestedCategory: aiResult.category || 'COULD_NOT_DETERMINE',
        needsUpdate: !courseData.Category,
        description: (courseContent.description || '').substring(0, 100) + '...',
        confidence: aiResult.confidence
      });
      
      count++;
      processed++;
      
      // Small delay to avoid rate limits
      await sleep(500);
    }
    
    console.table(preview);
    
    const needsUpdate = preview.filter(p => p.needsUpdate).length;
    const categories = Array.from(new Set(preview.map(p => p.aiSuggestedCategory)));
    
    console.log(`📊 Preview Summary:`);
    console.log(`  - Courses previewed: ${preview.length}`);
    console.log(`  - Need categorization: ${needsUpdate}`);
    console.log(`  - Already categorized: ${preview.length - needsUpdate}`);
    console.log(`  - AI suggested categories: ${categories.join(', ')}`);
    
    return preview;
    
  } catch (error) {
    console.error('❌ Preview failed:', error);
    throw error;
  }
};

/**
 * Enhanced category statistics with better performance
 */
export const getCategoryStatistics = async (): Promise<CategoryStats> => {
  try {
    const coursesRef = collection(db, 'courses');
    const snapshot = await getDocs(coursesRef);
    
    const stats: CategoryStats = {
      totalCourses: snapshot.size,
      categorized: 0,
      uncategorized: 0,
      categories: {},
      sources: {},
      lastUpdated: new Date()
    };
    
    snapshot.forEach(doc => {
      const data = doc.data();
      
      if (data.Category) {
        stats.categorized++;
        stats.categories[data.Category] = (stats.categories[data.Category] || 0) + 1;
        
        const source = data.categorySource || 'unknown';
        stats.sources[source] = (stats.sources[source] || 0) + 1;
      } else {
        stats.uncategorized++;
      }
    });
    
    console.log('📊 Category Statistics:');
    console.log(`  ✅ Categorized: ${stats.categorized}`);
    console.log(`  ❌ Uncategorized: ${stats.uncategorized}`);
    console.log(`  📂 Categories:`, stats.categories);
    console.log(`  🤖 Sources:`, stats.sources);
    
    return stats;
    
  } catch (error) {
    console.error('Error getting category statistics:', error);
    throw error;
  }
};

/**
 * Utility function for delays
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Cancel categorization (for future implementation)
 */
export class CategorizationController {
  private cancelled = false;
  
  cancel() {
    this.cancelled = true;
  }
  
  isCancelled() {
    return this.cancelled;
  }
}

/**
 * Validate and clean up existing categories
 */
export const validateExistingCategories = async (): Promise<{
  validCategories: number;
  invalidCategories: number;
  fixedCategories: number;
}> => {
  const validCategories = [
    'Immunology', 'Dermatology', 'Cardiology', 'Neurology', 'Emergency Medicine',
    'Internal Medicine', 'Surgery', 'Pediatrics', 'Psychiatry', 'Radiology',
    'Obstetrics & Gynecology', 'Orthopedics', 'Anesthesiology', 'Pathology',
    'Pharmacology', 'Family Medicine', 'Ophthalmology', 'Otolaryngology',
    'Urology', 'Oncology', 'Endocrinology', 'Gastroenterology', 'Pulmonology',
    'Nephrology', 'Infectious Disease', 'Hematology', 'Rheumatology', 'Medical Knowledge'
  ];
  
  const coursesRef = collection(db, 'courses');
  const snapshot = await getDocs(coursesRef);
  
  let validCount = 0;
  let invalidCount = 0;
  let fixedCount = 0;
  const batch = writeBatch(db);
  
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.Category) {
      const isValid = validCategories.includes(data.Category);
      if (isValid) {
        validCount++;
      } else {
        invalidCount++;
        // Try to find a close match or default to Medical Knowledge
        const closestMatch = validCategories.find(cat => 
          cat.toLowerCase().includes(data.Category.toLowerCase()) ||
          data.Category.toLowerCase().includes(cat.toLowerCase())
        ) || 'Medical Knowledge';
        
        batch.update(doc.ref, {
          Category: closestMatch,
          categorySource: 'validation_fix',
          categoryFixedAt: serverTimestamp()
        });
        fixedCount++;
      }
    }
  });
  
  if (fixedCount > 0) {
    await batch.commit();
  }
  
  return { validCategories: validCount, invalidCategories: invalidCount, fixedCategories: fixedCount };
};