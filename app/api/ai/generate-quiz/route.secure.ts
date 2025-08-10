/**
 * Secure AI Quiz Generation API Route
 * @description Generates medical quiz questions using OpenAI with proper security measures
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { apiMiddleware, validation, addSecurityHeaders, addCorsHeaders } from '../../../../lib/authMiddleware';

// Rate limiting configuration
const RATE_LIMIT = {
  limit: 5, // 5 requests per minute for AI generation
  windowMs: 60 * 1000 // 1 minute
};

// Input validation schemas
interface QuizGenerationRequest {
  content: string;
  specialty?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  category?: string;
  topic?: string;
  questionCount: number;
  filename?: string;
}

/**
 * Validates quiz generation request
 */
function validateRequest(data: any): { valid: boolean; errors: string[]; data?: QuizGenerationRequest } {
  const errors: string[] = [];

  // Validate content
  const content = validation.sanitizeString(data.content, 50000);
  if (!content || content.length < 100) {
    errors.push('Content must be at least 100 characters long');
  }

  // Validate question count
  if (!validation.isValidNumber(data.questionCount, 1, 25)) {
    errors.push('Question count must be between 1 and 25');
  }

  // Validate optional fields
  const specialty = data.specialty ? validation.sanitizeString(data.specialty, 100) || undefined : undefined;
  const difficulty = data.difficulty && ['Easy', 'Medium', 'Hard'].includes(data.difficulty) ? data.difficulty : undefined;
  const category = data.category ? validation.sanitizeString(data.category, 100) || undefined : undefined;
  const topic = data.topic ? validation.sanitizeString(data.topic, 200) || undefined : undefined;
  const filename = data.filename ? validation.sanitizeString(data.filename, 255) || undefined : undefined;

  if (errors.length === 0) {
    return {
      valid: true,
      errors: [],
      data: {
        content: content!,
        specialty,
        difficulty,
        category,
        topic,
        questionCount: data.questionCount,
        filename
      }
    };
  }

  return { valid: false, errors };
}

/**
 * Validates OpenAI API response
 */
function validateAIResponse(response: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!response.questions || !Array.isArray(response.questions)) {
    errors.push('Invalid response structure: questions array missing');
    return { valid: false, errors };
  }

  if (response.questions.length === 0) {
    errors.push('No questions generated');
    return { valid: false, errors };
  }

  // Validate each question
  for (let i = 0; i < response.questions.length; i++) {
    const q = response.questions[i];
    
    if (!q.question || typeof q.question !== 'string' || q.question.length < 10) {
      errors.push(`Question ${i + 1}: Invalid question text`);
    }
    
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      errors.push(`Question ${i + 1}: Must have exactly 4 options`);
    }
    
    if (!validation.isValidNumber(q.correctAnswer, 0, 3)) {
      errors.push(`Question ${i + 1}: Invalid correct answer index`);
    }
    
    if (!q.explanation || typeof q.explanation !== 'string' || q.explanation.length < 20) {
      errors.push(`Question ${i + 1}: Invalid explanation`);
    }
    
    // Validate options
    if (Array.isArray(q.options)) {
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j] || typeof q.options[j] !== 'string' || q.options[j].length < 2) {
          errors.push(`Question ${i + 1}, Option ${j + 1}: Invalid option text`);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Handle CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return addCorsHeaders(addSecurityHeaders(new NextResponse(null, { status: 200 })));
}

/**
 * Main POST handler with security middleware
 */
export async function POST(request: NextRequest) {
  try {
    // Apply security middleware
    const middlewareResult = await apiMiddleware(request, {
      requireAuth: true,
      requireEmailVerified: true,
      rateLimit: RATE_LIMIT
    });

    // If middleware returned a response (error), return it
    if (middlewareResult instanceof NextResponse) {
      return addCorsHeaders(middlewareResult);
    }

    const { user } = middlewareResult;

    // Validate OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OpenAI API key not configured');
      return addCorsHeaders(addSecurityHeaders(
        NextResponse.json(
          { error: 'Service temporarily unavailable', code: 'SERVICE_UNAVAILABLE' },
          { status: 503 }
        )
      ));
    }

    // Parse and validate request
    let requestData: any;
    try {
      requestData = await request.json();
    } catch (parseError) {
      return addCorsHeaders(addSecurityHeaders(
        NextResponse.json(
          { error: 'Invalid JSON format', code: 'INVALID_JSON' },
          { status: 400 }
        )
      ));
    }

    // Validate request data
    const validationResult = validateRequest(requestData);
    if (!validationResult.valid) {
      return addCorsHeaders(addSecurityHeaders(
        NextResponse.json(
          { 
            error: 'Validation failed', 
            code: 'VALIDATION_ERROR',
            details: validationResult.errors 
          },
          { status: 400 }
        )
      ));
    }

    const {
      content,
      specialty,
      difficulty,
      category,
      topic,
      questionCount,
      filename
    } = validationResult.data!;

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey });

    // Create secure system prompt
    const systemPrompt = `You are a medical education expert creating USMLE-style questions. Create exactly ${questionCount} multiple choice questions and return ONLY valid JSON in this exact format:
    {
      "questions": [
        {
          "question": "Question text here?",
          "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
          "correctAnswer": 0,
          "explanation": "Detailed explanation of why the answer is correct.",
          "topic": "Specific medical topic"
        }
      ]
    }
    
    Important rules:
    - correctAnswer should be the index (0, 1, 2, or 3) of the correct option
    - Each question must be high-quality and clinically relevant for ${difficulty || 'Medium'} level
    - Questions should focus on ${category || 'Medical Knowledge'} aspects
    - Options should be plausible distractors
    - Explanations should be educational and detailed
    - All content must be medically accurate and appropriate
    - Do not include any harmful, biased, or inappropriate content`;

    const userPrompt = `Create ${questionCount} high-quality ${specialty || 'medical'} questions from this content.
    
    Specifications:
    - Specialty: ${specialty || 'General Medicine'}
    - Difficulty Level: ${difficulty || 'Medium'}
    - Category Focus: ${category || 'Medical Knowledge'}
    ${topic ? `- Specific Topic: ${topic}` : ''}
    
    Content to base questions on:
    ${content.substring(0, 3000)}`;

    // Make OpenAI API call with timeout and error handling
    let completion: any;
    try {
      completion = await Promise.race([
        openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('OpenAI API timeout')), 30000)
        )
      ]);
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      return addCorsHeaders(addSecurityHeaders(
        NextResponse.json(
          { 
            error: 'AI service temporarily unavailable', 
            code: 'AI_SERVICE_ERROR'
          },
          { status: 503 }
        )
      ));
    }

    // Parse and validate AI response
    let result: any;
    try {
      const rawContent = completion.choices[0]?.message?.content;
      if (!rawContent) {
        throw new Error('Empty response from AI service');
      }

      result = JSON.parse(rawContent);
      
      // Validate AI response structure
      const aiValidation = validateAIResponse(result);
      if (!aiValidation.valid) {
        console.error('AI response validation failed:', aiValidation.errors);
        return addCorsHeaders(addSecurityHeaders(
          NextResponse.json(
            { 
              error: 'Invalid AI response', 
              code: 'AI_RESPONSE_INVALID',
              details: aiValidation.errors 
            },
            { status: 500 }
          )
        ));
      }

    } catch (parseError) {
      console.error('AI response parsing error:', parseError);
      return addCorsHeaders(addSecurityHeaders(
        NextResponse.json(
          { 
            error: 'Failed to parse AI response', 
            code: 'AI_PARSE_ERROR'
          },
          { status: 500 }
        )
      ));
    }

    // Save questions to database with proper error handling
    let savedToBank = false;
    let bankMessage = 'Questions generated successfully';

    if (result.questions && result.questions.length > 0) {
      try {
        const savePromises = result.questions.map(async (question: any) => {
          const questionDoc = {
            // Sanitized question content
            question: validation.sanitizeString(question.question, 2000)!,
            options: question.options.map((opt: string) => validation.sanitizeString(opt, 500)).filter(Boolean),
            correctAnswer: question.correctAnswer,
            explanation: validation.sanitizeString(question.explanation, 2000)!,
            topic: validation.sanitizeString(question.topic || topic || 'General', 200)!,
            
            // Metadata
            specialty: specialty || 'General Medicine',
            difficulty: difficulty || 'Medium',
            category: category || 'Medical Knowledge',
            sourceContent: filename || 'AI Generated',
            
            // Tracking and security
            createdBy: user!.uid,
            createdAt: serverTimestamp(),
            timesUsed: 0,
            qualityScore: 8.0,
            lastUsed: null,
            
            // Tags for searchability
            tags: [
              specialty?.toLowerCase(),
              difficulty?.toLowerCase(),
              category?.toLowerCase(),
              question.topic?.toLowerCase(),
              topic?.toLowerCase()
            ].filter(Boolean),
            
            // Verification and voting
            verified: false,
            upvotes: 0,
            downvotes: 0,
            reportCount: 0,
            
            // AI metadata
            aiGenerated: true,
            generationModel: 'gpt-4',
            generatedAt: new Date().toISOString()
          };

          return addDoc(collection(db, "questionBank"), questionDoc);
        });

        await Promise.all(savePromises);
        savedToBank = true;
        bankMessage = `${result.questions.length} questions saved to community question bank`;

      } catch (saveError) {
        console.error('Error saving questions to bank:', saveError);
        bankMessage = 'Questions generated but failed to save to database';
      }
    }

    // Prepare secure response
    const response = {
      success: true,
      questions: result.questions,
      savedToBank,
      bankMessage,
      metadata: {
        specialty: specialty || 'General Medicine',
        difficulty: difficulty || 'Medium',
        category: category || 'Medical Knowledge',
        topic: topic || 'General',
        questionCount: result.questions.length,
        userId: user!.uid
      }
    };

    return addCorsHeaders(addSecurityHeaders(
      NextResponse.json(response, { status: 200 })
    ));

  } catch (error) {
    console.error('Quiz generation error:', error);
    
    // Don't expose internal error details
    return addCorsHeaders(addSecurityHeaders(
      NextResponse.json(
        { 
          error: 'Internal server error', 
          code: 'INTERNAL_ERROR'
        },
        { status: 500 }
      )
    ));
  }
}