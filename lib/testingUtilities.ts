// lib/testingUtilities.ts - Testing and validation utilities for AI enhancement system
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  where, 
  limit as firestoreLimit,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';

export interface ValidationResult {
  passed: boolean;
  message: string;
  details?: any;
}

export interface SystemHealthCheck {
  firebaseConnection: ValidationResult;
  openaiApiKey: ValidationResult;
  coursesCollection: ValidationResult;
  questionsStructure: ValidationResult;
  enhancementReadiness: ValidationResult;
  overallHealth: 'healthy' | 'warning' | 'error';
}

export interface TestEnhancementResult {
  success: boolean;
  originalQuestion: any;
  enhancedExplanations: any;
  qualityScore: number;
  processingTime: number;
  error?: string;
}

export interface DataIntegrityCheck {
  totalCourses: number;
  coursesWithQuestions: number;
  totalQuestions: number;
  questionsWithCorrectExplanations: number;
  questionsWithIncorrectExplanations: number;
  questionsNeedingEnhancement: number;
  categorizedCourses: number;
  uncategorizedCourses: number;
  dataIssues: Array<{
    courseId: string;
    questionId?: string;
    issue: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

/**
 * Comprehensive system health check
 */
export const performSystemHealthCheck = async (): Promise<SystemHealthCheck> => {
  console.log('🏥 Starting system health check...');
  
  const results: SystemHealthCheck = {
    firebaseConnection: { passed: false, message: 'Not checked' },
    openaiApiKey: { passed: false, message: 'Not checked' },
    coursesCollection: { passed: false, message: 'Not checked' },
    questionsStructure: { passed: false, message: 'Not checked' },
    enhancementReadiness: { passed: false, message: 'Not checked' },
    overallHealth: 'error'
  };

  try {
    // Test 1: Firebase Connection
    console.log('📡 Testing Firebase connection...');
    try {
      const testRef = collection(db, 'courses');
      const testSnapshot = await getDocs(query(testRef, firestoreLimit(1)));
      results.firebaseConnection = {
        passed: true,
        message: 'Firebase connection successful',
        details: { documentsFound: testSnapshot.size }
      };
    } catch (error) {
      results.firebaseConnection = {
        passed: false,
        message: `Firebase connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      };
    }

    // Test 2: OpenAI API Key
    console.log('🤖 Testing OpenAI API key...');
    try {
      const response = await fetch('/api/ai/enhance-quiz-explanations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: 'Test question for API validation',
          options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
          correctAnswer: 0,
          category: 'Test'
        })
      });
      
      if (response.status === 401) {
        results.openaiApiKey = {
          passed: false,
          message: 'OpenAI API key is invalid or missing'
        };
      } else if (response.status === 200 || response.status === 400) {
        // 400 might be expected for test data, but API key is working
        results.openaiApiKey = {
          passed: true,
          message: 'OpenAI API key is valid and accessible'
        };
      } else {
        results.openaiApiKey = {
          passed: false,
          message: `OpenAI API responded with status: ${response.status}`
        };
      }
    } catch (error) {
      results.openaiApiKey = {
        passed: false,
        message: `OpenAI API test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }

    // Test 3: Courses Collection Structure
    console.log('📚 Testing courses collection structure...');
    try {
      const coursesRef = collection(db, 'courses');
      const coursesSnapshot = await getDocs(query(coursesRef, firestoreLimit(5)));
      
      if (coursesSnapshot.empty) {
        results.coursesCollection = {
          passed: false,
          message: 'No courses found in database'
        };
      } else {
        const sampleCourse = coursesSnapshot.docs[0].data();
        const hasRequiredFields = sampleCourse.CourseName || sampleCourse.NewTitle || sampleCourse.OriginalQuizTitle;
        
        results.coursesCollection = {
          passed: hasRequiredFields,
          message: hasRequiredFields 
            ? `Courses collection valid (${coursesSnapshot.size} courses checked)`
            : 'Courses missing required fields (CourseName, NewTitle, or OriginalQuizTitle)',
          details: { 
            courseCount: coursesSnapshot.size,
            sampleFields: Object.keys(sampleCourse)
          }
        };
      }
    } catch (error) {
      results.coursesCollection = {
        passed: false,
        message: `Courses collection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }

    // Test 4: Questions Structure
    console.log('❓ Testing questions structure...');
    try {
      const coursesRef = collection(db, 'courses');
      const coursesSnapshot = await getDocs(query(coursesRef, firestoreLimit(3)));
      
      let questionsFound = 0;
      let validQuestions = 0;
      
      for (const courseDoc of coursesSnapshot.docs) {
        const questionsRef = collection(db, 'courses', courseDoc.id, 'questions');
        const questionsSnapshot = await getDocs(query(questionsRef, firestoreLimit(3)));
        
        questionsSnapshot.forEach(questionDoc => {
          questionsFound++;
          const questionData = questionDoc.data();
          
          if (questionData.question && 
              Array.isArray(questionData.options) && 
              typeof questionData.correctAnswer === 'number') {
            validQuestions++;
          }
        });
      }
      
      results.questionsStructure = {
        passed: validQuestions > 0,
        message: validQuestions > 0 
          ? `Questions structure valid (${validQuestions}/${questionsFound} questions properly formatted)`
          : 'No valid questions found or questions missing required fields',
        details: { questionsFound, validQuestions }
      };
    } catch (error) {
      results.questionsStructure = {
        passed: false,
        message: `Questions structure test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }

    // Test 5: Enhancement Readiness
    console.log('🚀 Testing enhancement readiness...');
    const enhancementIssues = [];
    
    if (!results.firebaseConnection.passed) {
      enhancementIssues.push('Firebase connection issue');
    }
    if (!results.openaiApiKey.passed) {
      enhancementIssues.push('OpenAI API key issue');
    }
    if (!results.coursesCollection.passed) {
      enhancementIssues.push('Courses collection issue');
    }
    if (!results.questionsStructure.passed) {
      enhancementIssues.push('Questions structure issue');
    }
    
    results.enhancementReadiness = {
      passed: enhancementIssues.length === 0,
      message: enhancementIssues.length === 0 
        ? 'System ready for AI enhancement operations'
        : `${enhancementIssues.length} issues prevent enhancement: ${enhancementIssues.join(', ')}`,
      details: { issues: enhancementIssues }
    };

    // Determine Overall Health
    const passedTests = Object.values(results).filter(r => typeof r === 'object' && r.passed).length;
    const totalTests = 5;
    
    if (passedTests === totalTests) {
      results.overallHealth = 'healthy';
    } else if (passedTests >= totalTests * 0.6) {
      results.overallHealth = 'warning';
    } else {
      results.overallHealth = 'error';
    }

    console.log(`✅ Health check complete: ${results.overallHealth} (${passedTests}/${totalTests} tests passed)`);
    return results;

  } catch (error) {
    console.error('❌ Health check failed:', error);
    results.overallHealth = 'error';
    return results;
  }
};

/**
 * Test enhancement on a single question
 */
export const testQuestionEnhancement = async (
  courseId: string, 
  questionId: string
): Promise<TestEnhancementResult> => {
  const startTime = Date.now();
  
  try {
    console.log(`🧪 Testing enhancement for question ${questionId} in course ${courseId}`);
    
    // Get the question data
    const questionRef = doc(db, 'courses', courseId, 'questions', questionId);
    const questionDoc = await getDoc(questionRef);
    
    if (!questionDoc.exists()) {
      throw new Error('Question not found');
    }
    
    const questionData = questionDoc.data();
    
    // Get course data for category
    const courseRef = doc(db, 'courses', courseId);
    const courseDoc = await getDoc(courseRef);
    const courseData = courseDoc.exists() ? courseDoc.data() : {};
    
    // Test the enhancement API
    const response = await fetch('/api/ai/enhance-quiz-explanations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: questionData.question,
        options: questionData.options,
        correctAnswer: questionData.correctAnswer,
        category: courseData.Category || 'Medical Knowledge',
        currentCorrectExplanation: questionData.correctExplanation || '',
        currentIncorrectExplanation: questionData.incorrectExplanation || ''
      })
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const enhancedExplanations = await response.json();
    const processingTime = Date.now() - startTime;
    
    // Calculate quality score
    const qualityScore = calculateExplanationQuality(enhancedExplanations);
    
    console.log(`✅ Test enhancement completed in ${processingTime}ms (Quality: ${qualityScore}/100)`);
    
    return {
      success: true,
      originalQuestion: questionData,
      enhancedExplanations,
      qualityScore,
      processingTime,
    };
    
  } catch (error) {
    console.error('❌ Test enhancement failed:', error);
    return {
      success: false,
      originalQuestion: null,
      enhancedExplanations: null,
      qualityScore: 0,
      processingTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Comprehensive data integrity check
 */
export const performDataIntegrityCheck = async (): Promise<DataIntegrityCheck> => {
  console.log('🔍 Performing data integrity check...');
  
  const check: DataIntegrityCheck = {
    totalCourses: 0,
    coursesWithQuestions: 0,
    totalQuestions: 0,
    questionsWithCorrectExplanations: 0,
    questionsWithIncorrectExplanations: 0,
    questionsNeedingEnhancement: 0,
    categorizedCourses: 0,
    uncategorizedCourses: 0,
    dataIssues: []
  };
  
  try {
    const coursesRef = collection(db, 'courses');
    const coursesSnapshot = await getDocs(coursesRef);
    check.totalCourses = coursesSnapshot.size;
    
    for (const courseDoc of coursesSnapshot.docs) {
      const courseData = courseDoc.data();
      const courseId = courseDoc.id;
      
      // Check course categorization
      if (courseData.Category) {
        check.categorizedCourses++;
      } else {
        check.uncategorizedCourses++;
        check.dataIssues.push({
          courseId,
          issue: 'Course missing category',
          severity: 'medium'
        });
      }
      
      // Check course has required fields
      if (!courseData.CourseName && !courseData.NewTitle && !courseData.OriginalQuizTitle) {
        check.dataIssues.push({
          courseId,
          issue: 'Course missing title fields',
          severity: 'high'
        });
      }
      
      // Check questions
      const questionsRef = collection(db, 'courses', courseId, 'questions');
      const questionsSnapshot = await getDocs(questionsRef);
      
      if (questionsSnapshot.size > 0) {
        check.coursesWithQuestions++;
        check.totalQuestions += questionsSnapshot.size;
        
        questionsSnapshot.forEach(questionDoc => {
          const questionData = questionDoc.data();
          const questionId = questionDoc.id;
          
          // Check question structure
          if (!questionData.question) {
            check.dataIssues.push({
              courseId,
              questionId,
              issue: 'Question missing question text',
              severity: 'high'
            });
          }
          
          if (!Array.isArray(questionData.options) || questionData.options.length === 0) {
            check.dataIssues.push({
              courseId,
              questionId,
              issue: 'Question missing or invalid options',
              severity: 'high'
            });
          }
          
          if (typeof questionData.correctAnswer !== 'number') {
            check.dataIssues.push({
              courseId,
              questionId,
              issue: 'Question missing correct answer',
              severity: 'high'
            });
          }
          
          // Check explanations
          const hasCorrectExplanation = questionData.correctExplanation && 
                                      questionData.correctExplanation.trim() !== '';
          const hasIncorrectExplanation = questionData.incorrectExplanation && 
                                        questionData.incorrectExplanation.trim() !== '';
          
          if (hasCorrectExplanation) {
            check.questionsWithCorrectExplanations++;
          }
          
          if (hasIncorrectExplanation) {
            check.questionsWithIncorrectExplanations++;
          }
          
          if (!hasCorrectExplanation || !hasIncorrectExplanation) {
            check.questionsNeedingEnhancement++;
          }
          
          // Check explanation quality
          if (hasCorrectExplanation && questionData.correctExplanation.length < 50) {
            check.dataIssues.push({
              courseId,
              questionId,
              issue: 'Correct explanation too short (less than 50 characters)',
              severity: 'low'
            });
          }
          
          if (hasIncorrectExplanation && questionData.incorrectExplanation.length < 50) {
            check.dataIssues.push({
              courseId,
              questionId,
              issue: 'Incorrect explanation too short (less than 50 characters)',
              severity: 'low'
            });
          }
        });
      } else {
        check.dataIssues.push({
          courseId,
          issue: 'Course has no questions',
          severity: 'medium'
        });
      }
    }
    
    console.log('✅ Data integrity check complete');
    console.log(`📊 Summary: ${check.totalCourses} courses, ${check.totalQuestions} questions, ${check.dataIssues.length} issues found`);
    
    return check;
    
  } catch (error) {
    console.error('❌ Data integrity check failed:', error);
    throw error;
  }
};

/**
 * Test AI categorization on sample courses
 */
export const testCourseCategorization = async (sampleSize: number = 3): Promise<Array<{
  courseId: string;
  courseName: string;
  currentCategory: string;
  suggestedCategory: string;
  confidence: string;
  processingTime: number;
  success: boolean;
  error?: string;
}>> => {
  console.log(`🏷️ Testing course categorization on ${sampleSize} courses...`);
  
  const results = [];
  
  try {
    const coursesRef = collection(db, 'courses');
    const coursesSnapshot = await getDocs(query(coursesRef, firestoreLimit(sampleSize)));
    
    for (const courseDoc of coursesSnapshot.docs) {
      const startTime = Date.now();
      const courseData = courseDoc.data();
      const courseId = courseDoc.id;
      const courseName = courseData.NewTitle || courseData.OriginalQuizTitle || courseData.CourseName || courseId;
      
      try {
        const response = await fetch('/api/ai/categorize-course', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: courseData.NewTitle || courseData.OriginalQuizTitle || '',
            description: courseData.BriefDescription || '',
            courseName: courseData.CourseName || ''
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          results.push({
            courseId,
            courseName,
            currentCategory: courseData.Category || 'MISSING',
            suggestedCategory: data.category || 'COULD_NOT_DETERMINE',
            confidence: data.confidence || 'unknown',
            processingTime: Date.now() - startTime,
            success: true
          });
        } else {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        // Small delay to avoid rate limits
        await sleep(1000);
        
      } catch (error) {
        results.push({
          courseId,
          courseName,
          currentCategory: courseData.Category || 'MISSING',
          suggestedCategory: 'ERROR',
          confidence: 'none',
          processingTime: Date.now() - startTime,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    console.log(`✅ Categorization test complete: ${results.filter(r => r.success).length}/${results.length} successful`);
    return results;
    
  } catch (error) {
    console.error('❌ Categorization test failed:', error);
    throw error;
  }
};

/**
 * Helper Functions
 */

function calculateExplanationQuality(explanations: any): number {
  let score = 0;
  
  // Check if explanations exist
  if (explanations.correctExplanation) {
    score += 25;
  }
  if (explanations.incorrectExplanation) {
    score += 25;
  }
  
  // Check length (quality indicator)
  if (explanations.correctExplanation && explanations.correctExplanation.length > 100) {
    score += 15;
  }
  if (explanations.incorrectExplanation && explanations.incorrectExplanation.length > 100) {
    score += 15;
  }
  
  // Check for teaching elements
  if (explanations.teachingElements) {
    if (explanations.teachingElements.analogies && explanations.teachingElements.analogies.length > 0) {
      score += 5;
    }
    if (explanations.teachingElements.mnemonics && explanations.teachingElements.mnemonics.length > 0) {
      score += 5;
    }
    if (explanations.teachingElements.examples && explanations.teachingElements.examples.length > 0) {
      score += 5;
    }
  }
  
  // Check confidence
  if (explanations.confidence === 'high') {
    score += 5;
  } else if (explanations.confidence === 'medium') {
    score += 3;
  }
  
  return Math.min(score, 100);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate a comprehensive system report
 */
export const generateSystemReport = async (): Promise<{
  healthCheck: SystemHealthCheck;
  dataIntegrity: DataIntegrityCheck;
  timestamp: Date;
  recommendations: string[];
}> => {
  console.log('📋 Generating comprehensive system report...');
  
  const [healthCheck, dataIntegrity] = await Promise.all([
    performSystemHealthCheck(),
    performDataIntegrityCheck()
  ]);
  
  const recommendations = [];
  
  // Health-based recommendations
  if (!healthCheck.firebaseConnection.passed) {
    recommendations.push('Fix Firebase connection issues before proceeding');
  }
  if (!healthCheck.openaiApiKey.passed) {
    recommendations.push('Configure valid OpenAI API key in environment variables');
  }
  if (!healthCheck.questionsStructure.passed) {
    recommendations.push('Review and fix question data structure issues');
  }
  
  // Data-based recommendations
  if (dataIntegrity.uncategorizedCourses > 0) {
    recommendations.push(`Categorize ${dataIntegrity.uncategorizedCourses} uncategorized courses`);
  }
  if (dataIntegrity.questionsNeedingEnhancement > 0) {
    recommendations.push(`Enhance explanations for ${dataIntegrity.questionsNeedingEnhancement} questions`);
  }
  
  const highSeverityIssues = dataIntegrity.dataIssues.filter(i => i.severity === 'high').length;
  if (highSeverityIssues > 0) {
    recommendations.push(`Address ${highSeverityIssues} high-severity data issues immediately`);
  }
  
  if (recommendations.length === 0) {
    recommendations.push('System is healthy and ready for AI operations');
  }
  
  return {
    healthCheck,
    dataIntegrity,
    timestamp: new Date(),
    recommendations
  };
};