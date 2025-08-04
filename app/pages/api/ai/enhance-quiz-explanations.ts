// pages/api/ai/enhance-quiz-explanations.ts

import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface EnhanceExplanationRequest {
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  currentCorrectExplanation?: string;
  currentIncorrectExplanation?: string;
}

interface EnhanceExplanationResponse {
  correctExplanation: string;
  incorrectExplanation: string;
  confidence: string;
  teachingElements: {
    analogies: string[];
    mnemonics: string[];
    examples: string[];
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EnhanceExplanationResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      question,
      options,
      correctAnswer,
      category,
      currentCorrectExplanation = '',
      currentIncorrectExplanation = ''
    }: EnhanceExplanationRequest = req.body;

    // Validate input
    if (!question || !options || !Array.isArray(options) || typeof correctAnswer !== 'number') {
      return res.status(400).json({ error: 'Invalid question data provided' });
    }

    if (correctAnswer < 0 || correctAnswer >= options.length) {
      return res.status(400).json({ error: 'Invalid correct answer index' });
    }

    console.log('🤖 Generating enhanced explanations for question:', question.substring(0, 50) + '...');

    const correctOption = options[correctAnswer];
    const incorrectOptions = options.filter((_, index) => index !== correctAnswer);

    // Create comprehensive prompt for advanced medical education
    const prompt = `You are an expert medical educator creating comprehensive explanations for medical students and residents. 

QUESTION: ${question}

OPTIONS:
${options.map((option, index) => `${index + 1}. ${option}`).join('\n')}

CORRECT ANSWER: ${correctOption} (Option ${correctAnswer + 1})
MEDICAL SPECIALTY: ${category}

CURRENT EXPLANATIONS (if any):
- Correct: ${currentCorrectExplanation || 'MISSING'}
- Incorrect: ${currentIncorrectExplanation || 'MISSING'}

TASK: Generate comprehensive, educational explanations that serve as teaching material for advanced medical education. Include:

1. **CORRECT ANSWER EXPLANATION**: 
   - Deep dive into WHY this is correct
   - Underlying pathophysiology/mechanism
   - Clinical significance and implications
   - When to apply this knowledge in practice
   - Connection to broader medical concepts

2. **INCORRECT OPTIONS EXPLANATION**:
   - Why each incorrect option is wrong
   - Common misconceptions addressed
   - What conditions/scenarios these might actually apply to
   - Educational value of understanding why they're incorrect

3. **TEACHING ENHANCEMENTS**:
   - Memorable analogies to explain complex concepts
   - Mnemonics for key facts or sequences
   - Clinical examples or case scenarios
   - Connections to other medical conditions/treatments

REQUIREMENTS:
- Write at an advanced level suitable for medical students/residents
- Use precise medical terminology with explanations
- Include pathophysiology where relevant
- Make explanations comprehensive enough to serve as study material
- Focus on understanding principles, not just memorization
- Include practical clinical applications
- Use analogies that are medically relevant and appropriate

FORMAT YOUR RESPONSE AS JSON:
{
  "correctExplanation": "Comprehensive explanation of why the correct answer is right...",
  "incorrectExplanation": "Detailed explanation of why other options are incorrect...",
  "confidence": "high/medium/low",
  "teachingElements": {
    "analogies": ["analogy1", "analogy2"],
    "mnemonics": ["mnemonic1", "mnemonic2"],
    "examples": ["example1", "example2"]
  }
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert medical educator specializing in creating comprehensive, advanced-level teaching explanations for medical questions. Your explanations should be detailed enough to serve as course material and include educational enhancements like analogies, mnemonics, and clinical examples. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    let parsedResponse: EnhanceExplanationResponse;
    try {
      parsedResponse = JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', response);
      
      // Fallback: try to extract explanations from non-JSON response
      const correctMatch = response.match(/correctExplanation["\s]*:["\s]*([^"]+)"/);
      const incorrectMatch = response.match(/incorrectExplanation["\s]*:["\s]*([^"]+)"/);
      
      if (correctMatch && incorrectMatch) {
        parsedResponse = {
          correctExplanation: correctMatch[1],
          incorrectExplanation: incorrectMatch[1],
          confidence: 'medium',
          teachingElements: {
            analogies: [],
            mnemonics: [],
            examples: []
          }
        };
      } else {
        throw new Error('Could not parse OpenAI response');
      }
    }

    // Validate the parsed response
    if (!parsedResponse.correctExplanation || !parsedResponse.incorrectExplanation) {
      throw new Error('Missing required explanations in response');
    }

    // Ensure minimum quality standards
    if (parsedResponse.correctExplanation.length < 100) {
      throw new Error('Correct explanation too short - needs more detail');
    }

    if (parsedResponse.incorrectExplanation.length < 100) {
      throw new Error('Incorrect explanation too short - needs more detail');
    }

    console.log('✅ Generated enhanced explanations successfully');
    console.log(`📝 Correct explanation length: ${parsedResponse.correctExplanation.length} chars`);
    console.log(`❌ Incorrect explanation length: ${parsedResponse.incorrectExplanation.length} chars`);

    res.status(200).json(parsedResponse);

  } catch (error) {
    console.error('❌ Error generating enhanced explanations:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
      } else if (error.message.includes('API key')) {
        res.status(401).json({ error: 'Invalid API key configuration.' });
      } else {
        res.status(500).json({ error: `Enhancement failed: ${error.message}` });
      }
    } else {
      res.status(500).json({ error: 'Unknown error occurred during enhancement' });
    }
  }
}

// Helper function to validate medical content (could be expanded)
function validateMedicalContent(explanation: string): boolean {
  // Basic validation - could be enhanced with medical terminology checks
  const minLength = 100;
  const hasKeyMedicalTerms = /(?:pathophysiology|mechanism|clinical|treatment|diagnosis|symptom|condition|disease|therapy|patient)/i.test(explanation);
  
  return explanation.length >= minLength && hasKeyMedicalTerms;
}

// Helper function to sanitize explanations
function sanitizeExplanation(explanation: string): string {
  // Remove any potentially harmful content and ensure proper formatting
  return explanation
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/\*\*/g, '') // Remove markdown bold
    .trim();
}