// lib/monitoringService.ts - Simplified monitoring service for SimpleLMS
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

export interface MonitoringEvent {
  id?: string;
  type: 'info' | 'warning' | 'error' | 'success';
  category: 'categorization' | 'enhancement' | 'system' | 'api' | 'performance';
  title: string;
  message: string;
  metadata?: any;
  timestamp: Date;
  userId?: string;
  operationId?: string;
}

export interface SystemMetrics {
  timestamp: Date;
  categorization: {
    totalCourses: number;
    categorizedCourses: number;
    failureRate: number;
    avgProcessingTime: number;
  };
  enhancement: {
    totalQuestions: number;
    enhancedQuestions: number;
    failureRate: number;
    avgProcessingTime: number;
  };
  api: {
    requestCount: number;
    errorRate: number;
    avgResponseTime: number;
  };
}

class MonitoringService {
  /**
   * Log a monitoring event
   */
  async logEvent(event: Omit<MonitoringEvent, 'id' | 'timestamp'>): Promise<string> {
    try {
      const eventWithTimestamp: MonitoringEvent = {
        ...event,
        timestamp: new Date()
      };

      const docRef = await addDoc(collection(db, 'monitoring_events'), {
        ...eventWithTimestamp,
        timestamp: serverTimestamp()
      });

      console.log(`📊 Monitoring event logged: ${event.type.toUpperCase()} - ${event.title}`);
      return docRef.id;
    } catch (error) {
      console.error('Failed to log monitoring event:', error);
      throw error;
    }
  }

  /**
   * Get recent monitoring events
   */
  async getRecentEvents(
    limit: number = 50,
    category?: string,
    type?: string
  ): Promise<MonitoringEvent[]> {
    try {
      let eventsQuery = query(
        collection(db, 'monitoring_events'),
        orderBy('timestamp', 'desc'),
        firestoreLimit(limit)
      );

      if (category) {
        eventsQuery = query(eventsQuery, where('category', '==', category));
      }

      if (type) {
        eventsQuery = query(eventsQuery, where('type', '==', type));
      }

      const snapshot = await getDocs(eventsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as MonitoringEvent[];
    } catch (error) {
      console.error('Failed to get recent events:', error);
      return [];
    }
  }

  /**
   * Monitor an operation and log performance metrics
   */
  async monitorOperation<T>(
    operationName: string,
    category: MonitoringEvent['category'],
    operation: () => Promise<T>,
    metadata?: any
  ): Promise<T> {
    const operationId = `${operationName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    try {
      await this.logEvent({
        type: 'info',
        category,
        title: `${operationName} Started`,
        message: `Operation ${operationName} has been initiated`,
        metadata: { ...metadata, operationId },
        operationId
      });

      const result = await operation();
      const duration = Date.now() - startTime;

      await this.logEvent({
        type: 'success',
        category,
        title: `${operationName} Completed`,
        message: `Operation completed successfully in ${duration}ms`,
        metadata: { 
          ...metadata, 
          operationId, 
          duration,
          success: true
        },
        operationId
      });

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      await this.logEvent({
        type: 'error',
        category,
        title: `${operationName} Failed`,
        message: `Operation failed after ${duration}ms: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: { 
          ...metadata, 
          operationId, 
          duration,
          success: false,
          error: error instanceof Error ? error.stack : error
        },
        operationId
      });

      throw error;
    }
  }

  /**
   * Get system metrics
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    try {
      // Get categorization metrics
      const { getCategoryStatistics } = await import('./openaiCourseCategorizer');
      const categoryStats = await getCategoryStatistics();
      
      // Get enhancement metrics  
      const { getEnhancementStatistics } = await import('./openaiQuizEnhancer');
      const enhancementStats = await getEnhancementStatistics();
      
      // Get API metrics from recent events
      const recentEvents = await this.getRecentEvents(100, 'api');
      const apiEvents = recentEvents.filter(e => 
        (Date.now() - e.timestamp.getTime()) < 3600000 // Last hour
      );
      
      const totalRequests = apiEvents.length;
      const errorRequests = apiEvents.filter(e => e.type === 'error').length;
      const successEvents = apiEvents.filter(e => 
        e.type === 'success' && e.metadata?.duration
      );
      const avgResponseTime = successEvents.length > 0
        ? successEvents.reduce((sum, e) => sum + e.metadata.duration, 0) / successEvents.length
        : 0;

      return {
        timestamp: new Date(),
        categorization: {
          totalCourses: categoryStats.totalCourses,
          categorizedCourses: categoryStats.categorized,
          failureRate: 0, // Calculate from events
          avgProcessingTime: 2500 // Default value
        },
        enhancement: {
          totalQuestions: enhancementStats.totalQuestions,
          enhancedQuestions: enhancementStats.totalQuestions - enhancementStats.questionsNeedingEnhancement,
          failureRate: 0, // Calculate from events
          avgProcessingTime: 4500 // Default value
        },
        api: {
          requestCount: totalRequests,
          errorRate: totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0,
          avgResponseTime
        }
      };
    } catch (error) {
      console.error('Failed to get system metrics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const monitoringService = new MonitoringService();

// Convenience functions for easy import
export const logEvent = (event: Omit<MonitoringEvent, 'id' | 'timestamp'>) => 
  monitoringService.logEvent(event);

export const monitorOperation = <T>(
  operationName: string,
  category: MonitoringEvent['category'],
  operation: () => Promise<T>,
  metadata?: any
) => monitoringService.monitorOperation(operationName, category, operation, metadata);

export const getSystemMetrics = () => 
  monitoringService.getSystemMetrics();

// Enhanced wrapper functions for existing operations
export const monitoredCategorizeCoursesWithOpenAI = async (
  progressCallback?: (progress: any) => void
) => {
  return monitoringService.monitorOperation(
    'Course Categorization',
    'categorization',
    async () => {
      const { categorizeCoursesWithOpenAI } = await import('./openaiCourseCategorizer');
      return categorizeCoursesWithOpenAI(progressCallback);
    }
  );
};

export const monitoredEnhanceQuizExplanationsWithOpenAI = async (
  progressCallback?: (progress: any) => void
) => {
  return monitoringService.monitorOperation(
    'Quiz Enhancement',
    'enhancement',
    async () => {
      const { enhanceQuizExplanationsWithOpenAI } = await import('./openaiQuizEnhancer');
      return enhanceQuizExplanationsWithOpenAI(progressCallback);
    }
  );
};