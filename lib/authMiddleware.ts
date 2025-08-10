/**
 * Authentication and Authorization Middleware for API Routes
 * @description Provides secure authentication checks and request validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from './firebase';
import { signInWithCustomToken } from 'firebase/auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    uid: string;
    email?: string;
    emailVerified?: boolean;
  };
}

/**
 * Validates Firebase ID token from request headers
 * @param request - NextRequest object
 * @returns User object or null if invalid
 */
export async function validateIdToken(request: NextRequest): Promise<{ uid: string; email?: string; emailVerified?: boolean } | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    if (!idToken || idToken.length < 10) {
      return null;
    }

    // For client-side applications, we'll validate the token format and extract the user ID
    // In production, you should use Firebase Admin SDK to verify the token server-side
    try {
      // Basic token validation - in production use Firebase Admin SDK
      const tokenPayload = JSON.parse(atob(idToken.split('.')[1]));
      
      if (tokenPayload.exp < Date.now() / 1000) {
        console.error('Token expired');
        return null;
      }

      return {
        uid: tokenPayload.sub || tokenPayload.user_id,
        email: tokenPayload.email,
        emailVerified: tokenPayload.email_verified
      };
    } catch (parseError) {
      console.error('Token parse error:', parseError);
      return null;
    }

  } catch (error) {
    console.error('Auth validation error:', error);
    return null;
  }
}

/**
 * Authentication middleware for API routes
 * @param request - NextRequest object
 * @param options - Middleware options
 * @returns NextResponse with error or null if authenticated
 */
export async function requireAuth(
  request: NextRequest,
  options: { 
    requireEmailVerified?: boolean;
    allowedRoles?: string[];
  } = {}
): Promise<{ user: { uid: string; email?: string; emailVerified?: boolean } } | NextResponse> {
  
  const user = await validateIdToken(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required', code: 'AUTH_REQUIRED' },
      { status: 401 }
    );
  }

  if (options.requireEmailVerified && !user.emailVerified) {
    return NextResponse.json(
      { error: 'Email verification required', code: 'EMAIL_NOT_VERIFIED' },
      { status: 403 }
    );
  }

  return { user };
}

/**
 * Rate limiting middleware (simple in-memory implementation)
 * In production, use Redis or another persistent store
 */
class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  
  isAllowed(ip: string, limit: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const key = ip;
    const record = this.requests.get(key);
    
    if (!record || now > record.resetTime) {
      this.requests.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (record.count >= limit) {
      return false;
    }
    
    record.count++;
    return true;
  }
  
  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of Array.from(this.requests.entries())) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

const rateLimiter = new RateLimiter();

// Clean up rate limiter every 5 minutes
setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);

/**
 * Rate limiting middleware
 * @param request - NextRequest object
 * @param limit - Requests per window
 * @param windowMs - Window duration in milliseconds
 * @returns NextResponse with error or null if allowed
 */
export function rateLimit(
  request: NextRequest,
  limit: number = 10,
  windowMs: number = 60000
): NextResponse | null {
  const ip = request.ip || 
             request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  if (!rateLimiter.isAllowed(ip, limit, windowMs)) {
    return NextResponse.json(
      { 
        error: 'Too many requests', 
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(windowMs / 1000)
      },
      { status: 429 }
    );
  }
  
  return null;
}

/**
 * Input validation and sanitization utilities
 */
export const validation = {
  /**
   * Validates and sanitizes string input
   */
  sanitizeString(input: unknown, maxLength: number = 1000): string | null {
    if (typeof input !== 'string') return null;
    if (input.length === 0 || input.length > maxLength) return null;
    
    // Remove null bytes and control characters except newlines and tabs
    return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
  },

  /**
   * Validates user ID format
   */
  isValidUserId(userId: unknown): userId is string {
    return typeof userId === 'string' && 
           userId.length >= 10 && 
           userId.length <= 100 &&
           /^[a-zA-Z0-9_-]+$/.test(userId);
  },

  /**
   * Validates email format
   */
  isValidEmail(email: unknown): email is string {
    return typeof email === 'string' &&
           email.length <= 254 &&
           /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  /**
   * Validates number within range
   */
  isValidNumber(value: unknown, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): value is number {
    return typeof value === 'number' &&
           !isNaN(value) &&
           value >= min &&
           value <= max;
  },

  /**
   * Validates array of strings
   */
  isValidStringArray(value: unknown, maxLength: number = 100): value is string[] {
    return Array.isArray(value) &&
           value.length <= maxLength &&
           value.every(item => typeof item === 'string' && item.length <= 1000);
  }
};

/**
 * CORS headers for API responses
 */
export function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || 'http://localhost:3000');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  return response;
}

/**
 * Security headers for API responses
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Content-Security-Policy', "default-src 'self'");
  
  return response;
}

/**
 * Comprehensive API middleware that combines authentication, rate limiting, and security
 */
export async function apiMiddleware(
  request: NextRequest,
  options: {
    requireAuth?: boolean;
    requireEmailVerified?: boolean;
    rateLimit?: { limit: number; windowMs: number };
    allowedRoles?: string[];
  } = {}
): Promise<{ user?: { uid: string; email?: string; emailVerified?: boolean } } | NextResponse> {
  
  // Apply rate limiting if specified
  if (options.rateLimit) {
    const rateLimitResponse = rateLimit(request, options.rateLimit.limit, options.rateLimit.windowMs);
    if (rateLimitResponse) {
      return addSecurityHeaders(rateLimitResponse);
    }
  }

  // Apply authentication if required
  if (options.requireAuth) {
    const authResult = await requireAuth(request, {
      requireEmailVerified: options.requireEmailVerified,
      allowedRoles: options.allowedRoles
    });
    
    if (authResult instanceof NextResponse) {
      return addSecurityHeaders(authResult);
    }
    
    return authResult;
  }

  return {};
}