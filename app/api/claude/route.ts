// Save as: app/api/claude/route.ts (App Router)
// OR: pages/api/claude.ts (Pages Router)

import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '../../../lib/claude';

export async function POST(request: NextRequest) {
  try {
    // Security: Basic rate limiting check (implement proper rate limiting in production)
    const userAgent = request.headers.get('user-agent');
    if (!userAgent) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    const { prompt } = await request.json();
    
    // Security: Input validation
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Valid prompt is required' },
        { status: 400 }
      );
    }

    // Security: Limit prompt length to prevent abuse
    if (prompt.length > 4000) {
      return NextResponse.json(
        { error: 'Prompt too long' },
        { status: 400 }
      );
    }

    // Security: Basic content filtering for malicious prompts
    const maliciousPatterns = ['ignore previous instructions', 'jailbreak', 'override system'];
    const lowercasePrompt = prompt.toLowerCase();
    if (maliciousPatterns.some(pattern => lowercasePrompt.includes(pattern))) {
      return NextResponse.json(
        { error: 'Invalid prompt content' },
        { status: 400 }
      );
    }
    
    const response = await callClaude(prompt);
    
    return NextResponse.json({ response });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}