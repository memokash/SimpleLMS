// lib/logger.ts
// Production-safe logging utility
import * as Sentry from '@sentry/nextjs';

const isDevelopment = process.env.NODE_ENV === 'development';
const isDebugEnabled = process.env.NEXT_PUBLIC_DEBUG === 'true';

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment || isDebugEnabled) {
      console.log(...args);
    }
  },
  
  error: (...args: any[]) => {
    // Always log errors, but in production send to monitoring service
    if (isDevelopment) {
      console.error(...args);
    } else {
      // Send to Sentry in production
      const error = args[0];
      if (error instanceof Error) {
        Sentry.captureException(error);
      } else {
        Sentry.captureMessage(String(error), 'error');
      }
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment || isDebugEnabled) {
      console.warn(...args);
    }
  },
  
  debug: (...args: any[]) => {
    if (isDevelopment && isDebugEnabled) {
      console.debug(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment || isDebugEnabled) {
      console.info(...args);
    }
  }
};

export default logger;