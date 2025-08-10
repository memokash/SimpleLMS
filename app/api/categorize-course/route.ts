// app/api/ai/categorize-course/route.ts 
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { doc, setDoc, updateDoc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

// Rate limiting (simple in-memory implementation - use Redis for production)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute

// Category validation
const VALID_CATEGORIES = [
  // Primary Medical Branches
  'Cardiology', 'Pulmonology', 'Neurology', 'Gastroenterology', 'Endocrinology',
  'Nephrology', 'Hematology', 'Oncology', 'Rheumatology', 'Immunology',
  'Dermatology', 'Infectious Disease', 'Emergency Medicine', 'Critical Care',
  
  // Surgical Specialties
  'General Surgery', 'Cardiac Surgery', 'Neurosurgery', 'Orthopedic Surgery',
  'Plastic Surgery', 'Vascular Surgery', 'Thoracic Surgery', 'Transplant Surgery',
  
  // Primary Care & Specialty Medicine
  'Internal Medicine', 'Family Medicine', 'Pediatrics', 'Geriatrics',
  'Obstetrics & Gynecology', 'Psychiatry', 'Physical Medicine & Rehabilitation',
  
  // Diagnostic Specialties
  'Radiology', 'Pathology', 'Laboratory Medicine', 'Nuclear Medicine',
  
  // Procedural Specialties
  'Anesthesiology', 'Pain Medicine', 'Interventional Radiology',
  
  // Organ System Specialties
  'Ophthalmology', 'Otolaryngology', 'Urology', 'Orthopedics',
  
  // Basic Sciences & Foundational
  'Biochemistry', 'Physiology', 'Anatomy', 'Pharmacology', 'Microbiology',
  'Immunology', 'Genetics', 'Molecular Biology', 'Public Health',
  
  // General/Other
  'Medical Knowledge', 'Clinical Skills', 'Medical Ethics', 'Research Methods'
];

// Enhanced system prompt for better categorization
const SYSTEM_PROMPT = `You are a medical education expert with deep knowledge of medical specialties and course content. Your task is to analyze course content and categorize it into the most appropriate medical specialty.

VALID CATEGORIES (choose exactly one):
${VALID_CATEGORIES.join(', ')}

CATEGORIZATION GUIDELINES:
1. Choose the MOST SPECIFIC specialty that best fits the primary focus
2. If content covers multiple areas, identify the PRIMARY medical specialty
3. Use "Medical Knowledge" ONLY for truly general medical content that doesn't fit a specific specialty
4. Consider both explicit specialty mentions and implicit content focus
5. For interdisciplinary content, choose the specialty most relevant to the learning objectives

SPECIALTY DEFINITIONS:
PRIMARY MEDICAL BRANCHES:
- Cardiology: Heart, blood vessels, cardiovascular system, cardiac diseases
- Pulmonology: Lungs, respiratory system, breathing disorders
- Neurology: Brain, nervous system, neurological disorders, CNS diseases
- Gastroenterology: Digestive system, GI tract, liver, pancreas
- Endocrinology: Hormones, endocrine glands, diabetes, metabolic disorders
- Nephrology: Kidneys, renal system, dialysis, fluid/electrolyte balance
- Hematology: Blood disorders, anemia, clotting disorders, blood cancers
- Oncology: Cancer diagnosis, treatment, chemotherapy, tumor biology
- Rheumatology: Autoimmune diseases, arthritis, connective tissue disorders
- Dermatology: Skin, hair, nails, dermatological conditions

SURGICAL SPECIALTIES:
- General Surgery: Abdominal surgery, trauma surgery, basic surgical principles
- Cardiac Surgery: Heart surgery, bypass procedures, valve repair
- Neurosurgery: Brain and spine surgery, CNS surgical procedures
- Orthopedic Surgery: Bone, joint, musculoskeletal surgical procedures

BASIC SCIENCES:
- Biochemistry: Molecular processes, metabolism, enzyme function
- Physiology: Body function, organ systems, homeostasis
- Anatomy: Body structure, anatomical relationships, morphology
- Pharmacology: Drug action, mechanisms, therapeutic principles
- Microbiology: Bacteria, viruses, fungi, infectious agents
- Pathology: Disease mechanisms, tissue analysis, diagnosis

RESPONSE FORMAT:
Return ONLY the category name exactly as listed above. No additional text, explanations, or formatting.`;

interface RequestBody {
  title?: string;
  description?: string;
  courseName?: string;
  questions?: Array<{
    id: string;
    question: string;
    questionTitle?: string;
    category?: string;
    options?: string[];
  }>;
  courseId?: string;
}

interface CategoryResponse {
  category: string;
  confidence: 'high' | 'medium' | 'low' | 'corrected';
  rawResponse?: string;
  processingTime: number;
  savedToFirebase?: boolean;
  fallbackUsed?: boolean;
}

/**
 * Simple rate limiting check
 */
function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  if (!rateLimitMap.has(clientId)) {
    rateLimitMap.set(clientId, []);
  }
  
  const requests = rateLimitMap.get(clientId);
  // Remove old requests outside the window
  const recentRequests = requests.filter((timestamp: number) => timestamp > windowStart);
  
  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitMap.set(clientId, recentRequests);
  return true;
}

/**
 * Validate and sanitize course content
 */
function validateCourseContent(body: RequestBody): {
  isValid: boolean;
  content: string;
  error?: string;
} {
  const { title, description, courseName, questions } = body;
  
  if (!title && !description && !courseName && (!questions || questions.length === 0)) {
    return {
      isValid: false,
      content: '',
      error: 'At least one of title, description, courseName, or questions is required'
    };
  }
  
  // Build content string with proper formatting
  const contentParts = [
    title && title.trim() && `Course Title: ${title.trim()}`,
    courseName && courseName.trim() && `Course Name: ${courseName.trim()}`,
    description && description.trim() && `Course Description: ${description.trim()}`
  ].filter(Boolean);

  // Add questions content for analysis
  if (questions && questions.length > 0) {
    const questionContent = questions
      .slice(0, 5) // Analyze first 5 questions to avoid token limits
      .map((q, index) => {
        const parts = [`Question ${index + 1}: ${q.question.trim()}`];
        if (q.questionTitle) {
          parts.unshift(`Question Title: ${q.questionTitle.trim()}`);
        }
        if (q.options && q.options.length > 0) {
          parts.push(`Options: ${q.options.slice(0, 4).join(', ')}`);
        }
        return parts.join('\n');
      })
      .join('\n\n');
    
    if (questionContent.trim()) {
      contentParts.push(`Sample Questions:\n${questionContent}`);
    }
  }
  
  const content = contentParts.join('\n');
  
  if (content.length < 10) {
    return {
      isValid: false,
      content: '',
      error: 'Course content too short for meaningful analysis'
    };
  }
  
  if (content.length > 4000) {
    // Truncate if too long, keeping the most important parts
    const truncatedContent = contentParts
      .filter((part): part is string => typeof part === 'string')
      .map((part: string) => part.length > 1000 ? part.substring(0, 1000) + '...' : part)
      .join('\n');
    
    return {
      isValid: true,
      content: truncatedContent
    };
  }
  
  return {
    isValid: true,
    content
  };
}

/**
 * Fallback categorization based on keyword matching
 */
function getFallbackCategory(content: string): string {
  const contentLower = content.toLowerCase();
  
  // Simple keyword matching for common specialties
  const keywordMap = {
    'Cardiology': ['heart', 'cardiac', 'cardiovascular', 'ecg', 'ekg', 'arrhythmia'],
    'Neurology': ['brain', 'neurological', 'seizure', 'stroke', 'neurology'],
    'Emergency Medicine': ['emergency', 'trauma', 'acute', 'critical', 'triage'],
    'Surgery': ['surgical', 'operation', 'operative', 'procedure', 'surgery'],
    'Pediatrics': ['pediatric', 'children', 'infant', 'child', 'neonatal'],
    'Psychiatry': ['mental', 'psychiatric', 'depression', 'anxiety', 'behavioral'],
    'Radiology': ['imaging', 'x-ray', 'ct', 'mri', 'ultrasound', 'radiology'],
    'Dermatology': ['skin', 'dermatology', 'rash', 'dermatological'],
    'Pharmacology': ['drug', 'medication', 'pharmaceutical', 'pharmacology']
  };
  
  for (const [category, keywords] of Object.entries(keywordMap)) {
    if (keywords.some(keyword => contentLower.includes(keyword))) {
      return category;
    }
  }
  
  return 'Medical Knowledge';
}

/**
 * Enhanced categorization with multiple validation layers
 */
async function categorizeWithOpenAI(content: string): Promise<{
  category: string;
  confidence: 'high' | 'medium' | 'low' | 'corrected';
  rawResponse?: string;
  fallbackUsed?: boolean;
}> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Categorize this medical course content:\n\n${content}` }
      ],
      temperature: 0.1,
      max_tokens: 50
    });

    const rawCategory = completion.choices[0].message.content?.trim();
    
    if (!rawCategory) {
      throw new Error('No category returned from OpenAI');
    }

    // Validate the category is in our approved list
    const exactMatch = VALID_CATEGORIES.find(cat => cat === rawCategory);
    if (exactMatch) {
      return {
        category: exactMatch,
        confidence: 'high',
        rawResponse: rawCategory
      };
    }

    // Try case-insensitive matching
    const caseInsensitiveMatch = VALID_CATEGORIES.find(cat => 
      cat.toLowerCase() === rawCategory.toLowerCase()
    );
    if (caseInsensitiveMatch) {
      return {
        category: caseInsensitiveMatch,
        confidence: 'medium',
        rawResponse: rawCategory
      };
    }

    // Try partial matching
    const partialMatch = VALID_CATEGORIES.find(cat =>
      cat.toLowerCase().includes(rawCategory.toLowerCase()) ||
      rawCategory.toLowerCase().includes(cat.toLowerCase())
    );
    if (partialMatch) {
      return {
        category: partialMatch,
        confidence: 'low',
        rawResponse: rawCategory
      };
    }

    // If no match found, log the issue and use fallback
    console.warn('Invalid category returned by OpenAI:', rawCategory);
    const fallbackCategory = getFallbackCategory(content);
    
    return {
      category: fallbackCategory,
      confidence: 'corrected',
      rawResponse: rawCategory,
      fallbackUsed: true
    };

  } catch (error) {
    console.error('OpenAI categorization failed:', error);
    
    // Use fallback categorization
    const fallbackCategory = getFallbackCategory(content);
    return {
      category: fallbackCategory,
      confidence: 'low',
      fallbackUsed: true
    };
  }
}

/**
 * Save categorization results to Firebase
 */
async function saveCategoryToFirebase(
  courseId: string, 
  category: string, 
  confidence: string,
  requestData: RequestBody
): Promise<boolean> {
  try {
    console.log(`💾 Saving category "${category}" to Firebase for course ${courseId}`);

    // Update course document with the new category
    const courseRef = doc(db, 'courses', courseId);
    await updateDoc(courseRef, {
      category: category,
      categoryConfidence: confidence,
      categorizedAt: serverTimestamp(),
      categorizedBy: 'OpenAI'
    });

    // Also save to categorization log for analytics
    const categorizationLogRef = collection(db, 'categorization_logs');
    await addDoc(categorizationLogRef, {
      courseId,
      category,
      confidence,
      courseTitle: requestData.title,
      courseName: requestData.courseName,
      questionCount: requestData.questions?.length || 0,
      timestamp: serverTimestamp(),
      method: 'OpenAI-GPT'
    });

    console.log(`✅ Successfully saved category "${category}" to Firebase`);
    return true;
  } catch (error) {
    console.error('❌ Error saving to Firebase:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('🤖 Enhanced course categorization API called');
    
    // Get client identifier for rate limiting
    const clientId = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    // Check rate limiting
    if (!checkRateLimit(clientId)) {
      console.warn(`⚠️ Rate limit exceeded for client: ${clientId}`);
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          details: `Maximum ${RATE_LIMIT_MAX_REQUESTS} requests per minute allowed`
        }, 
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': (Date.now() + RATE_LIMIT_WINDOW).toString()
          }
        }
      );
    }

    // Parse and validate request body
    let requestData: RequestBody;
    try {
      requestData = await request.json();
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' }, 
        { status: 400 }
      );
    }

    // Validate course content
    const validation = validateCourseContent(requestData);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error }, 
        { status: 400 }
      );
    }

    console.log('🔍 Analyzing course content:', {
      hasTitle: !!requestData.title,
      hasCourseName: !!requestData.courseName,
      hasDescription: !!requestData.description,
      contentLength: validation.content.length,
      clientId
    });

    // Perform categorization
    const result = await categorizeWithOpenAI(validation.content);
    const processingTime = Date.now() - startTime;

    console.log('✅ Course categorized successfully:', {
      category: result.category,
      confidence: result.confidence,
      processingTime,
      fallbackUsed: result.fallbackUsed,
      rawResponse: result.rawResponse
    });

    const response: CategoryResponse = {
      category: result.category,
      confidence: result.confidence,
      processingTime,
      ...(result.rawResponse && { rawResponse: result.rawResponse }),
      ...(result.fallbackUsed && { fallbackUsed: result.fallbackUsed })
    };

    // Save to Firebase if courseId is provided
    if (requestData.courseId) {
      const saved = await saveCategoryToFirebase(
        requestData.courseId, 
        result.category, 
        result.confidence, 
        requestData
      );
      response.savedToFirebase = saved;
    }

    return NextResponse.json(response, {
      headers: {
        'X-Processing-Time': processingTime.toString(),
        'X-RateLimit-Remaining': (RATE_LIMIT_MAX_REQUESTS - (rateLimitMap.get(clientId)?.length || 0)).toString()
      }
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('💥 Categorization error:', error);
    
    // Determine error type and appropriate response
    let statusCode = 500;
    let errorMessage = 'Failed to categorize course';
    let errorDetails = error instanceof Error ? error.message : 'Unknown error';
    
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        statusCode = 408;
        errorMessage = 'Request timeout';
      } else if (error.message.includes('API key')) {
        statusCode = 500;
        errorMessage = 'Server configuration error';
        errorDetails = 'API service unavailable';
      } else if (error.message.includes('rate limit')) {
        statusCode = 429;
        errorMessage = 'Service rate limit exceeded';
      }
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: errorDetails,
      processingTime
    }, { 
      status: statusCode,
      headers: {
        'X-Processing-Time': processingTime.toString()
      }
    });
  }
}