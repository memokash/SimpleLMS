// lib/logger.ts
// Production-safe logging utility

const isDevelopment = process.env.NODE_ENV === 'development';
const isDebugEnabled = process.env.NEXT_PUBLIC_DEBUG === 'true';

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment || isDebugEnabled) {
      console.log(...args);
    }
  },
  
  error: (...args: any[]) => {
    // Always log errors
    console.error(...args);
    // In production, you could send to Firebase Crashlytics or another service
    // if you need error tracking in the future
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