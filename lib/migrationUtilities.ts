// lib/migrationUtilities.ts - Data migration and backup utilities
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  writeBatch,
  serverTimestamp,
  query,
  where,
  orderBy,
  addDoc
} from 'firebase/firestore';
import { db } from './firebase';

export interface MigrationResult {
  success: boolean;
  processedItems: number;
  migratedItems: number;
  failedItems: number;
  errors: Array<{id: string; error: string}>;
  duration: number;
  backupId?: string;
}

export interface BackupResult {
  success: boolean;
  backupId: string;
  itemCount: number;
  timestamp: Date;
  error?: string;
}

export interface MigrationPlan {
  name: string;
  description: string;
  estimatedItems: number;
  estimatedDuration: string;
  requirements: string[];
  risks: string[];
  backupRequired: boolean;
}

/**
 * Create a backup of all courses and questions before migration
 */
export const createSystemBackup = async (label: string = 'pre-migration'): Promise<BackupResult> => {
  const startTime = Date.now();
  console.log('💾 Creating system backup...');
  
  try {
    const backupData = {
      timestamp: new Date(),
      label,
      courses: [] as any[],
      metadata: {
        version: '1.0',
        createdBy: 'migration-utility',
        totalCourses: 0,
        totalQuestions: 0
      }
    };
    
    // Get all courses
    const coursesRef = collection(db, 'courses');
    const coursesSnapshot = await getDocs(coursesRef);
    
    let totalQuestions = 0;
    
    for (const courseDoc of coursesSnapshot.docs) {
      const courseData = courseDoc.data();
      const courseId = courseDoc.id;
      
      // Get all questions for this course
      const questionsRef = collection(db, 'courses', courseId, 'questions');
      const questionsSnapshot = await getDocs(questionsRef);
      
      const questions = questionsSnapshot.docs.map(questionDoc => ({
        id: questionDoc.id,
        ...questionDoc.data()
      }));
      
      backupData.courses.push({
        id: courseId,
        ...courseData,
        questions
      });
      
      totalQuestions += questions.length;
    }
    
    backupData.metadata.totalCourses = backupData.courses.length;
    backupData.metadata.totalQuestions = totalQuestions;
    
    // Save backup to Firebase
    const backupsRef = collection(db, 'system_backups');
    const backupDoc = await addDoc(backupsRef, backupData);
    
    console.log(`✅ Backup created: ${backupDoc.id} (${backupData.courses.length} courses, ${totalQuestions} questions)`);
    
    return {
      success: true,
      backupId: backupDoc.id,
      itemCount: backupData.courses.length + totalQuestions,
      timestamp: backupData.timestamp
    };
    
  } catch (error) {
    console.error('❌ Backup creation failed:', error);
    return {
      success: false,
      backupId: '',
      itemCount: 0,
      timestamp: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Migrate existing courses to ensure they have proper category fields
 */
export const migrateCourseCategories = async (createBackup: boolean = true): Promise<MigrationResult> => {
  const startTime = Date.now();
  console.log('🔄 Starting course category migration...');
  
  let backupId: string | undefined;
  let processedItems = 0;
  let migratedItems = 0;
  let failedItems = 0;
  const errors: Array<{id: string; error: string}> = [];
  
  try {
    // Create backup if requested
    if (createBackup) {
      console.log('📦 Creating pre-migration backup...');
      const backupResult = await createSystemBackup('course-category-migration');
      if (backupResult.success) {
        backupId = backupResult.backupId;
        console.log(`✅ Backup created: ${backupId}`);
      } else {
        console.warn('⚠️ Backup failed, proceeding without backup');
      }
    }
    
    const coursesRef = collection(db, 'courses');
    const coursesSnapshot = await getDocs(coursesRef);
    
    let batch = writeBatch(db);
    let batchCount = 0;
    const BATCH_SIZE = 500;
    
    for (const courseDoc of coursesSnapshot.docs) {
      processedItems++;
      const courseData = courseDoc.data();
      const courseId = courseDoc.id;
      
      try {
        const updateData: any = {};
        let needsUpdate = false;
        
        // Ensure Category field exists
        if (!courseData.Category) {
          // Try to infer from existing fields or default
          let inferredCategory = 'Medical Knowledge'; // Default
          
          const title = courseData.NewTitle || courseData.OriginalQuizTitle || courseData.CourseName || '';
          const description = courseData.BriefDescription || '';
          const combinedText = (title + ' ' + description).toLowerCase();
          
          // Simple category inference
          if (combinedText.includes('cardio')) {
            inferredCategory = 'Cardiology';
          } else if (combinedText.includes('neuro')) {
            inferredCategory = 'Neurology';
          } else if (combinedText.includes('dermat')) {
            inferredCategory = 'Dermatology';
          } else if (combinedText.includes('immun')) {
            inferredCategory = 'Immunology';
          } else if (combinedText.includes('surgery') || combinedText.includes('surgical')) {
            inferredCategory = 'Surgery';
          } else if (combinedText.includes('pediatric') || combinedText.includes('child')) {
            inferredCategory = 'Pediatrics';
          } else if (combinedText.includes('psychiatr') || combinedText.includes('mental')) {
            inferredCategory = 'Psychiatry';
          } else if (combinedText.includes('emergency') || combinedText.includes('trauma')) {
            inferredCategory = 'Emergency Medicine';
          } else if (combinedText.includes('radiol') || combinedText.includes('imaging')) {
            inferredCategory = 'Radiology';
          } else if (combinedText.includes('pharmac') || combinedText.includes('drug')) {
            inferredCategory = 'Pharmacology';
          }
          
          updateData.Category = inferredCategory;
          updateData.categorySource = 'migration_inference';
          needsUpdate = true;
        }
        
        // Add migration metadata
        if (!courseData.migrationVersion) {
          updateData.migrationVersion = '1.0';
          updateData.migratedAt = serverTimestamp();
          needsUpdate = true;
        }
        
        // Ensure proper title fields
        if (!courseData.NewTitle && !courseData.OriginalQuizTitle && courseData.CourseName) {
          updateData.NewTitle = courseData.CourseName;
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          batch.update(courseDoc.ref, updateData);
          batchCount++;
          migratedItems++;
          
          console.log(`📝 Queued migration for course: ${courseData.CourseName || courseId}`);
        }
        
        // Commit batch if it reaches the limit
        if (batchCount >= BATCH_SIZE) {
          await batch.commit();
          console.log(`💾 Committed batch of ${batchCount} course updates`);
          batch = writeBatch(db);
          batchCount = 0;
        }
        
      } catch (courseError) {
        failedItems++;
        const error = courseError instanceof Error ? courseError.message : 'Unknown error';
        errors.push({ id: courseId, error });
        console.error(`❌ Failed to migrate course ${courseId}:`, error);
      }
    }
    
    // Commit any remaining items
    if (batchCount > 0) {
      await batch.commit();
      console.log(`💾 Committed final batch of ${batchCount} course updates`);
    }
    
    const duration = Date.now() - startTime;
    console.log(`✅ Course category migration complete: ${migratedItems}/${processedItems} courses migrated in ${Math.round(duration / 1000)}s`);
    
    return {
      success: failedItems < processedItems * 0.1, // Success if less than 10% failed
      processedItems,
      migratedItems,
      failedItems,
      errors,
      duration,
      backupId
    };
    
  } catch (error) {
    console.error('❌ Course category migration failed:', error);
    return {
      success: false,
      processedItems,
      migratedItems,
      failedItems,
      errors: [...errors, { id: 'global', error: error instanceof Error ? error.message : 'Unknown error' }],
      duration: Date.now() - startTime,
      backupId
    };
  }
};

/**
 * Migrate existing questions to ensure proper explanation field structure
 */
export const migrateQuestionExplanations = async (createBackup: boolean = true): Promise<MigrationResult> => {
  const startTime = Date.now();
  console.log('🔄 Starting question explanation migration...');
  
  let backupId: string | undefined;
  let processedItems = 0;
  let migratedItems = 0;
  let failedItems = 0;
  const errors: Array<{id: string; error: string}> = [];
  
  try {
    // Create backup if requested
    if (createBackup) {
      console.log('📦 Creating pre-migration backup...');
      const backupResult = await createSystemBackup('question-explanation-migration');
      if (backupResult.success) {
        backupId = backupResult.backupId;
        console.log(`✅ Backup created: ${backupId}`);
      } else {
        console.warn('⚠️ Backup failed, proceeding without backup');
      }
    }
    
    const coursesRef = collection(db, 'courses');
    const coursesSnapshot = await getDocs(coursesRef);
    
    let batch = writeBatch(db);
    let batchCount = 0;
    const BATCH_SIZE = 500;
    
    for (const courseDoc of coursesSnapshot.docs) {
      const courseId = courseDoc.id;
      
      // Get all questions for this course
      const questionsRef = collection(db, 'courses', courseId, 'questions');
      const questionsSnapshot = await getDocs(questionsRef);
      
      for (const questionDoc of questionsSnapshot.docs) {
        processedItems++;
        const questionData = questionDoc.data();
        const questionId = questionDoc.id;
        
        try {
          const updateData: any = {};
          let needsUpdate = false;
          
          // Ensure explanation fields exist
          if (questionData.correctExplanation === undefined) {
            updateData.correctExplanation = '';
            needsUpdate = true;
          }
          
          if (questionData.incorrectExplanation === undefined) {
            updateData.incorrectExplanation = '';
            needsUpdate = true;
          }
          
          // Migrate old field names if they exist
          if (questionData.explanation && !questionData.correctExplanation) {
            updateData.correctExplanation = questionData.explanation;
            needsUpdate = true;
          }
          
          if (questionData.wrongAnswerExplanation && !questionData.incorrectExplanation) {
            updateData.incorrectExplanation = questionData.wrongAnswerExplanation;
            needsUpdate = true;
          }
          
          // Ensure proper question structure
          if (!questionData.question) {
            updateData.question = questionData.questionText || questionData.title || '';
            needsUpdate = true;
          }
          
          if (!Array.isArray(questionData.options)) {
            // Try to reconstruct from individual option fields
            const options = [];
            for (let i = 0; i < 6; i++) {
              const optionKey = `option${i}` || `choice${i}` || `answer${i}`;
              if (questionData[optionKey]) {
                options.push(questionData[optionKey]);
              }
            }
            if (options.length > 0) {
              updateData.options = options;
              needsUpdate = true;
            }
          }
          
          // Ensure correctAnswer is a number
          if (typeof questionData.correctAnswer !== 'number') {
            const correctAnswerIndex = parseInt(questionData.correctAnswer) || 0;
            updateData.correctAnswer = correctAnswerIndex;
            needsUpdate = true;
          }
          
          // Add migration metadata
          if (!questionData.migrationVersion) {
            updateData.migrationVersion = '1.0';
            updateData.migratedAt = serverTimestamp();
            needsUpdate = true;
          }
          
          if (needsUpdate) {
            batch.update(questionDoc.ref, updateData);
            batchCount++;
            migratedItems++;
            
            if (batchCount % 50 === 0) {
              console.log(`📝 Queued ${batchCount} question migrations...`);
            }
          }
          
          // Commit batch if it reaches the limit
          if (batchCount >= BATCH_SIZE) {
            await batch.commit();
            console.log(`💾 Committed batch of ${batchCount} question updates`);
            batch = writeBatch(db);
            batchCount = 0;
          }
          
        } catch (questionError) {
          failedItems++;
          const error = questionError instanceof Error ? questionError.message : 'Unknown error';
          errors.push({ id: `${courseId}/${questionId}`, error });
          console.error(`❌ Failed to migrate question ${courseId}/${questionId}:`, error);
        }
      }
    }
    
    // Commit any remaining items
    if (batchCount > 0) {
      await batch.commit();
      console.log(`💾 Committed final batch of ${batchCount} question updates`);
    }
    
    const duration = Date.now() - startTime;
    console.log(`✅ Question explanation migration complete: ${migratedItems}/${processedItems} questions migrated in ${Math.round(duration / 1000)}s`);
    
    return {
      success: failedItems < processedItems * 0.1, // Success if less than 10% failed
      processedItems,
      migratedItems,
      failedItems,
      errors,
      duration,
      backupId
    };
    
  } catch (error) {
    console.error('❌ Question explanation migration failed:', error);
    return {
      success: false,
      processedItems,
      migratedItems,
      failedItems,
      errors: [...errors, { id: 'global', error: error instanceof Error ? error.message : 'Unknown error' }],
      duration: Date.now() - startTime,
      backupId
    };
  }
};

/**
 * Get available migration plans
 */
export const getAvailableMigrations = (): MigrationPlan[] => {
  return [
    {
      name: 'Course Categories',
      description: 'Ensure all courses have proper category fields with intelligent inference for missing categories',
      estimatedItems: 0, // Will be filled dynamically
      estimatedDuration: '5-15 minutes',
      requirements: [
        'Firebase connection',
        'Read/write access to courses collection'
      ],
      risks: [
        'Category inference may not be 100% accurate',
        'Batch operations may timeout for very large datasets'
      ],
      backupRequired: true
    },
    {
      name: 'Question Explanations',
      description: 'Standardize question explanation fields and migrate from legacy field names',
      estimatedItems: 0, // Will be filled dynamically
      estimatedDuration: '10-30 minutes',
      requirements: [
        'Firebase connection',
        'Read/write access to questions subcollections'
      ],
      risks: [
        'Large question sets may require multiple batch operations',
        'Legacy field mapping may miss some edge cases'
      ],
      backupRequired: true
    }
  ];
};

/**
 * Estimate migration scope
 */
export const estimateMigrationScope = async (): Promise<{
  courses: {
    total: number;
    needingCategoryMigration: number;
    needingFieldMigration: number;
  };
  questions: {
    total: number;
    needingExplanationMigration: number;
    needingStructureMigration: number;
  };
}> => {
  console.log('🔍 Estimating migration scope...');
  
  const scope = {
    courses: {
      total: 0,
      needingCategoryMigration: 0,
      needingFieldMigration: 0
    },
    questions: {
      total: 0,
      needingExplanationMigration: 0,
      needingStructureMigration: 0
    }
  };
  
  try {
    const coursesRef = collection(db, 'courses');
    const coursesSnapshot = await getDocs(coursesRef);
    scope.courses.total = coursesSnapshot.size;
    
    for (const courseDoc of coursesSnapshot.docs) {
      const courseData = courseDoc.data();
      
      // Check if course needs category migration
      if (!courseData.Category) {
        scope.courses.needingCategoryMigration++;
      }
      
      // Check if course needs field migration
      if (!courseData.migrationVersion || !courseData.NewTitle) {
        scope.courses.needingFieldMigration++;
      }
      
      // Check questions
      const questionsRef = collection(db, 'courses', courseDoc.id, 'questions');
      const questionsSnapshot = await getDocs(questionsRef);
      scope.questions.total += questionsSnapshot.size;
      
      questionsSnapshot.forEach(questionDoc => {
        const questionData = questionDoc.data();
        
        // Check if question needs explanation migration
        if (questionData.correctExplanation === undefined || 
            questionData.incorrectExplanation === undefined ||
            questionData.explanation || 
            questionData.wrongAnswerExplanation) {
          scope.questions.needingExplanationMigration++;
        }
        
        // Check if question needs structure migration
        if (!questionData.migrationVersion || 
            !Array.isArray(questionData.options) ||
            typeof questionData.correctAnswer !== 'number') {
          scope.questions.needingStructureMigration++;
        }
      });
    }
    
    console.log('📊 Migration scope estimate:', scope);
    return scope;
    
  } catch (error) {
    console.error('❌ Failed to estimate migration scope:', error);
    throw error;
  }
};

/**
 * Validate data after migration
 */
export const validatePostMigration = async (): Promise<{
  courses: {
    withCategories: number;
    withoutCategories: number;
    withMigrationData: number;
  };
  questions: {
    withCorrectExplanations: number;
    withIncorrectExplanations: number;
    withMigrationData: number;
    withValidStructure: number;
  };
  overallHealth: 'healthy' | 'warning' | 'error';
}> => {
  console.log('✅ Validating post-migration data...');
  
  const validation = {
    courses: {
      withCategories: 0,
      withoutCategories: 0,
      withMigrationData: 0
    },
    questions: {
      withCorrectExplanations: 0,
      withIncorrectExplanations: 0,
      withMigrationData: 0,
      withValidStructure: 0
    },
    overallHealth: 'error' as 'healthy' | 'warning' | 'error'
  };
  
  try {
    const coursesRef = collection(db, 'courses');
    const coursesSnapshot = await getDocs(coursesRef);
    
    for (const courseDoc of coursesSnapshot.docs) {
      const courseData = courseDoc.data();
      
      if (courseData.Category) {
        validation.courses.withCategories++;
      } else {
        validation.courses.withoutCategories++;
      }
      
      if (courseData.migrationVersion) {
        validation.courses.withMigrationData++;
      }
      
      // Check questions
      const questionsRef = collection(db, 'courses', courseDoc.id, 'questions');
      const questionsSnapshot = await getDocs(questionsRef);
      
      questionsSnapshot.forEach(questionDoc => {
        const questionData = questionDoc.data();
        
        if (questionData.correctExplanation !== undefined) {
          validation.questions.withCorrectExplanations++;
        }
        
        if (questionData.incorrectExplanation !== undefined) {
          validation.questions.withIncorrectExplanations++;
        }
        
        if (questionData.migrationVersion) {
          validation.questions.withMigrationData++;
        }
        
        if (Array.isArray(questionData.options) && 
            typeof questionData.correctAnswer === 'number' &&
            questionData.question) {
          validation.questions.withValidStructure++;
        }
      });
    }
    
    // Determine overall health
    const courseHealthy = validation.courses.withoutCategories === 0;
    const questionHealthy = validation.questions.withValidStructure > 0;
    
    if (courseHealthy && questionHealthy) {
      validation.overallHealth = 'healthy';
    } else if (courseHealthy || questionHealthy) {
      validation.overallHealth = 'warning';
    } else {
      validation.overallHealth = 'error';
    }
    
    console.log('📊 Post-migration validation:', validation);
    return validation;
    
  } catch (error) {
    console.error('❌ Post-migration validation failed:', error);
    throw error;
  }
};

/**
 * Run complete migration suite with comprehensive reporting
 */
export const runCompleteMigration = async (
  includeBackup: boolean = true,
  progressCallback?: (stage: string, progress: number) => void
): Promise<{
  overall: { success: boolean; duration: number };
  backup?: BackupResult;
  courseMigration: MigrationResult;
  questionMigration: MigrationResult;
  validation: any;
  summary: string[];
}> => {
  const startTime = Date.now();
  console.log('🚀 Starting complete migration suite...');
  
  const results: any = {
    overall: { success: false, duration: 0 }
  };
  
  try {
    // Stage 1: Backup (if requested)
    if (includeBackup) {
      progressCallback?.('Creating backup', 10);
      results.backup = await createSystemBackup('complete-migration');
      if (!results.backup.success) {
        console.warn('⚠️ Backup failed, continuing without backup');
      }
    }
    
    // Stage 2: Course migration
    progressCallback?.('Migrating courses', 30);
    results.courseMigration = await migrateCourseCategories(false); // No backup since we already made one
    
    // Stage 3: Question migration
    progressCallback?.('Migrating questions', 60);
    results.questionMigration = await migrateQuestionExplanations(false);
    
    // Stage 4: Validation
    progressCallback?.('Validating results', 90);
    results.validation = await validatePostMigration();
    
    // Generate summary
    const summary = [];
    summary.push(`Migration completed in ${Math.round((Date.now() - startTime) / 1000)}s`);
    
    if (results.backup?.success) {
      summary.push(`✅ Backup created: ${results.backup.backupId}`);
    }
    
    summary.push(`✅ Courses: ${results.courseMigration.migratedItems}/${results.courseMigration.processedItems} migrated`);
    summary.push(`✅ Questions: ${results.questionMigration.migratedItems}/${results.questionMigration.processedItems} migrated`);
    summary.push(`📊 Overall health: ${results.validation.overallHealth}`);
    
    if (results.courseMigration.failedItems > 0 || results.questionMigration.failedItems > 0) {
      summary.push(`⚠️ ${results.courseMigration.failedItems + results.questionMigration.failedItems} items failed migration`);
    }
    
    results.overall = {
      success: results.courseMigration.success && results.questionMigration.success,
      duration: Date.now() - startTime
    };
    
    results.summary = summary;
    
    progressCallback?.('Complete', 100);
    console.log('🎉 Complete migration suite finished:', summary.join(', '));
    
    return results;
    
  } catch (error) {
    console.error('❌ Complete migration suite failed:', error);
    results.overall = {
      success: false,
      duration: Date.now() - startTime
    };
    throw error;
  }
};