// lib/batchProcessingService.ts
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from './firebase';
import { monitoringService } from './monitoringService';

export interface BatchResult {
  processed: number;
  successful: number;
  failed: number;
  duration: number;
}

export interface BatchProgress {
  current: number;
  total: number;
  percentage: number;
  status: 'processing' | 'completed' | 'failed';
  currentQuestion?: string;
}

class BatchProcessingService {
  async batchEnhanceQuestions(
    courseId: string,
    progressCallback?: (progress: BatchProgress) => void
  ): Promise<BatchResult> {
    return monitoringService.monitorOperation(
      'Batch Question Enhancement',
      'enhancement',
      async () => {
        const startTime = Date.now();
        let processed = 0;
        let successful = 0;
        let failed = 0;

        try {
          // Get all questions for the course
          const questionsRef = collection(db, 'courses', courseId, 'questions');
          const questionsSnapshot = await getDocs(questionsRef);
          const total = questionsSnapshot.size;

          if (total === 0) {
            throw new Error('No questions found for this course');
          }

          // Initialize progress
          progressCallback?.({
            current: 0,
            total,
            percentage: 0,
            status: 'processing'
          });

          const batch = writeBatch(db);
          const batchSize = 500; // Firestore batch write limit
          let currentBatchOperations = 0;

          for (const questionDoc of questionsSnapshot.docs) {
            try {
              const questionData = questionDoc.data();
              
              // Skip if already enhanced
              if (questionData.explanationEnhancedBy) {
                processed++;
                progressCallback?.({
                  current: processed,
                  total,
                  percentage: Math.round((processed / total) * 100),
                  status: 'processing',
                  currentQuestion: questionData.question?.substring(0, 50) + '...'
                });
                continue;
              }

              // Validate question data
              if (!questionData.question || !questionData.options || typeof questionData.correctAnswer !== 'number') {
                console.warn('Skipping invalid question:', questionDoc.id);
                failed++;
                processed++;
                continue;
              }

              // Call enhancement API
              const response = await fetch('/api/ai/enhance-quiz-explanations', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  question: questionData.question,
                  options: questionData.options,
                  correctAnswer: questionData.correctAnswer,
                  category: questionData.category || 'Medical Knowledge'
                })
              });

              if (response.ok) {
                const enhanced = await response.json();
                
                // Add to batch update
                batch.update(questionDoc.ref, {
                  correctExplanation: enhanced.correctExplanation,
                  incorrectExplanation: enhanced.incorrectExplanation,
                  teachingElements: enhanced.teachingElements,
                  explanationEnhancedBy: 'openai',
                  explanationVersion: '2.0',
                  enhancedAt: new Date(),
                  confidence: enhanced.confidence || 'high'
                });
                
                currentBatchOperations++;
                successful++;

                // Execute batch if we're near the limit
                if (currentBatchOperations >= batchSize - 10) {
                  await batch.commit();
                  currentBatchOperations = 0;
                }
              } else {
                console.error('Enhancement API failed:', response.status, response.statusText);
                failed++;
              }

              processed++;
              
              // Update progress
              progressCallback?.({
                current: processed,
                total,
                percentage: Math.round((processed / total) * 100),
                status: 'processing',
                currentQuestion: questionData.question?.substring(0, 50) + '...'
              });

              // Small delay to avoid rate limits (OpenAI has rate limits)
              await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (error) {
              console.error('Enhancement error for question:', questionDoc.id, error);
              failed++;
              processed++;
            }
          }

          // Commit any remaining batch operations
          if (currentBatchOperations > 0) {
            await batch.commit();
          }

          // Final progress update
          progressCallback?.({
            current: processed,
            total,
            percentage: 100,
            status: 'completed'
          });

          return {
            processed,
            successful,
            failed,
            duration: Date.now() - startTime
          };

        } catch (error) {
          progressCallback?.({
            current: processed,
            total: processed,
            percentage: 100,
            status: 'failed'
          });
          throw error;
        }
      }
    );
  }

  async batchCategorizeQuestions(
    courseId: string,
    progressCallback?: (progress: BatchProgress) => void
  ): Promise<BatchResult> {
    return monitoringService.monitorOperation(
      'Batch Question Categorization',
      'categorization',
      async () => {
        const startTime = Date.now();
        let processed = 0;
        let successful = 0;
        let failed = 0;

        try {
          const questionsRef = collection(db, 'courses', courseId, 'questions');
          const questionsSnapshot = await getDocs(questionsRef);
          const total = questionsSnapshot.size;

          progressCallback?.({
            current: 0,
            total,
            percentage: 0,
            status: 'processing'
          });

          const batch = writeBatch(db);
          let currentBatchOperations = 0;

          for (const questionDoc of questionsSnapshot.docs) {
            try {
              const questionData = questionDoc.data();
              
              // Skip if already categorized
              if (questionData.aiCategory) {
                processed++;
                continue;
              }

              // Call categorization API
              const response = await fetch('/api/ai/categorize-course', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  question: questionData.question,
                  options: questionData.options
                })
              });

              if (response.ok) {
                const result = await response.json();
                
                batch.update(questionDoc.ref, {
                  aiCategory: result.category,
                  categoryConfidence: result.confidence,
                  categorizedAt: new Date(),
                  categorizedBy: 'openai'
                });
                
                currentBatchOperations++;
                successful++;

                if (currentBatchOperations >= 490) {
                  await batch.commit();
                  currentBatchOperations = 0;
                }
              } else {
                failed++;
              }

              processed++;
              
              progressCallback?.({
                current: processed,
                total,
                percentage: Math.round((processed / total) * 100),
                status: 'processing',
                currentQuestion: questionData.question?.substring(0, 50) + '...'
              });

              await new Promise(resolve => setTimeout(resolve, 500));

            } catch (error) {
              console.error('Categorization error:', error);
              failed++;
              processed++;
            }
          }

          if (currentBatchOperations > 0) {
            await batch.commit();
          }

          progressCallback?.({
            current: processed,
            total,
            percentage: 100,
            status: 'completed'
          });

          return {
            processed,
            successful,
            failed,
            duration: Date.now() - startTime
          };

        } catch (error) {
          progressCallback?.({
            current: processed,
            total: processed,
            percentage: 100,
            status: 'failed'
          });
          throw error;
        }
      }
    );
  }

  // Utility method to check enhancement status for a course
  async getEnhancementStatus(courseId: string): Promise<{
    total: number;
    enhanced: number;
    categorized: number;
    needsWork: number;
  }> {
    try {
      const questionsRef = collection(db, 'courses', courseId, 'questions');
      const questionsSnapshot = await getDocs(questionsRef);
      
      let enhanced = 0;
      let categorized = 0;
      
      questionsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.explanationEnhancedBy) {
          enhanced++;
        }
        if (data.aiCategory) {
          categorized++;
        }
      });

      return {
        total: questionsSnapshot.size,
        enhanced,
        categorized,
        needsWork: questionsSnapshot.size - enhanced
      };
    } catch (error) {
      console.error('Error getting enhancement status:', error);
      throw error;
    }
  }
}

export const batchProcessingService = new BatchProcessingService();