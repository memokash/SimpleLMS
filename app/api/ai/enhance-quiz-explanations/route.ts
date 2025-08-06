// app/api/ai/enhance-quiz-explanations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Enhance quiz explanations API called');
    
    // Check API key first
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('🔍 API Key exists:', !!apiKey);
    
    if (!apiKey) {
      console.error('❌ OpenAI API key not found');
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // Parse request body
    let requestData;
    try {
      requestData = await request.json();
      console.log('📝 Request data received');
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request' }, { status: 400 });
    }

    const { question, options, correctAnswer, category } = requestData;

    // Validate input
    if (!question || !options || typeof correctAnswer !== 'number') {
      console.error('❌ Invalid question data');
      return NextResponse.json({ error: 'Invalid question data' }, { status: 400 });
    }

    // Initialize OpenAI client
    let openai;
    try {
      openai = new OpenAI({
        apiKey: apiKey,
      });
      console.log('✅ OpenAI client initialized');
    } catch (clientError) {
      console.error('❌ OpenAI client initialization error:', clientError);
      return NextResponse.json({ error: 'Failed to initialize OpenAI client' }, { status: 500 });
    }

    const prompt = `You are an expert medical educator. Create comprehensive explanations for this medical question:

QUESTION: ${question}
OPTIONS: ${options.map((opt: string, i: number) => `${i + 1}. ${opt}`).join('\n')}
CORRECT ANSWER: ${options[correctAnswer]}
CATEGORY: ${category}

Provide detailed explanations including pathophysiology, clinical significance, and teaching elements.

Respond in JSON format:
{
  "correctExplanation": "Detailed explanation of why the correct answer is right...",
  "incorrectExplanation": "Explanation of why other options are incorrect...",
  "confidence": "high",
  "teachingElements": {
    "analogies": ["analogy1"],
    "mnemonics": ["mnemonic1"],
    "examples": ["example1"]
  }
}`;

    console.log('🤖 Making OpenAI API call...');

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    console.log('✅ OpenAI API call successful');

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
      console.log('✅ AI response parsed successfully');
    } catch (parseError) {
      console.error('❌ AI response parsing error:', parseError);
      console.log('Raw AI response:', response);
      
      // Fallback response
      parsedResponse = {
        correctExplanation: "The correct answer is based on standard medical knowledge.",
        incorrectExplanation: "Other options do not align with current medical guidelines.",
        confidence: "medium",
        teachingElements: {
          analogies: ["Consider reviewing related concepts"],
          mnemonics: ["Use standard medical mnemonics"],
          examples: ["Review similar clinical cases"]
        }
      };
    }

    console.log('🎉 Returning successful response');
    return NextResponse.json(parsedResponse);

  } catch (error) {
    console.error('💥 Enhancement error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json({ 
      error: 'Enhancement failed',
      details: error.message 
    }, { status: 500 });
  }
}