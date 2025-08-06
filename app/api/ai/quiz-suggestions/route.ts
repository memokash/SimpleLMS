// app/api/ai/quiz-suggestions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Quiz suggestions API called');
    
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
      console.log('📝 Request data received:', { 
        hasUserId: !!requestData.userId,
        hasUserStats: !!requestData.userStats
      });
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request' }, { status: 400 });
    }

    const { userId, userStats } = requestData;

    if (!userId || !userStats) {
      console.error('❌ Missing required data');
      return NextResponse.json({ error: 'User ID and stats are required' }, { status: 400 });
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

    console.log('🤖 Making OpenAI API call...');

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an intelligent tutoring system for USMLE prep. Given a user's study statistics and past performance, generate a JSON array of 3 quiz topic suggestions that are personalized and relevant.`
        },
        {
          role: "user",
          content: `User ID: ${userId}\n\nStudy Stats:\n${JSON.stringify(userStats, null, 2)}`
        }
      ],
      temperature: 0.5,
    });

    console.log('✅ OpenAI API call successful');

    let suggestions;
    try {
      suggestions = JSON.parse(completion.choices[0].message.content || '[]');
      console.log('✅ AI response parsed successfully');
      
      // Ensure it's an array
      if (!Array.isArray(suggestions)) {
        console.warn('⚠️ AI response is not an array, wrapping in array');
        suggestions = [suggestions.toString()];
      }
    } catch (parseError) {
      console.error('❌ AI response parsing error:', parseError);
      console.log('Raw AI response:', completion.choices[0].message.content);
      
      // Fallback suggestions
      suggestions = [
        "Cardiovascular System Review",
        "Pharmacology Practice Questions", 
        "Pathophysiology Concepts"
      ];
    }

    console.log('🎉 Returning successful suggestions');
    return NextResponse.json(suggestions);
    
  } catch (error) {
    console.error('💥 Quiz suggestions error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json({ 
      error: 'Failed to generate quiz suggestions',
      details: error.message 
    }, { status: 500 });
  }
}