// app/api/ai/analyze-content/study-recommendations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Study recommendations API called');
    
    // Check API key first
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('🔍 API Key exists:', !!apiKey);
    console.log('🔍 API Key length:', apiKey?.length);
    console.log('🔍 API Key starts with sk-:', apiKey?.startsWith('sk-'));
    
    if (!apiKey) {
      console.error('❌ OpenAI API key not found');
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // Parse request body
    let requestData;
    try {
      requestData = await request.json();
      console.log('📝 Request data received:', { 
        hasUserProgress: !!requestData.userProgress,
        progressLength: requestData.userProgress ? JSON.stringify(requestData.userProgress).length : 0
      });
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request' }, { status: 400 });
    }

    const { userProgress } = requestData;

    if (!userProgress) {
      console.error('❌ No user progress provided');
      return NextResponse.json({ error: 'User progress is required' }, { status: 400 });
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

    // Make OpenAI API call
    console.log('🤖 Making OpenAI API call...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an AI study advisor for medical students. Based on user performance data, provide 3-5 specific, actionable study recommendations. Return as a JSON array of strings. Each recommendation should be practical and tailored to the user's performance patterns.`
        },
        {
          role: "user",
          content: `Analyze this medical student's progress and provide study recommendations:\n\n${JSON.stringify(userProgress, null, 2)}`
        }
      ],
      temperature: 0.6,
    });

    console.log('✅ OpenAI API call successful');

    // Parse AI response
    let result;
    try {
      result = JSON.parse(completion.choices[0].message.content || '[]');
      console.log('✅ AI response parsed successfully');
      
      // Ensure it's an array
      if (!Array.isArray(result)) {
        console.warn('⚠️ AI response is not an array, wrapping in array');
        result = [result.toString()];
      }
    } catch (aiParseError) {
      console.error('❌ AI response parsing error:', aiParseError);
      console.log('Raw AI response:', completion.choices[0].message.content);
      
      // Fallback response
      result = [
        "Review your weakest performing topics with focused study sessions",
        "Practice more questions in areas where you scored below 70%",
        "Create flashcards for key concepts you missed",
        "Schedule regular review sessions for previously studied material",
        "Focus extra time on high-yield topics that appear frequently in exams"
      ];
    }
    
    console.log('🎉 Returning successful response');
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('💥 Study recommendations error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json({ 
      error: 'Failed to get recommendations',
      details: error.message 
    }, { status: 500 });
  }
}