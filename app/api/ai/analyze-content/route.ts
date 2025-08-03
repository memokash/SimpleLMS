// app/api/ai/analyze-content/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Analyze content API called');
    
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
        hasContent: !!requestData.content,
        contentLength: requestData.content?.length,
        filename: requestData.filename 
      });
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request' }, { status: 400 });
    }

    const { content, filename } = requestData;

    if (!content) {
      console.error('❌ No content provided');
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
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
          content: `You are a medical education expert. Analyze the uploaded medical content and provide a JSON response with these exact fields:
          {
            "summary": "A concise 2-3 sentence summary",
            "keyTopics": ["Topic 1", "Topic 2", "Topic 3"],
            "difficulty": "Beginner" | "Intermediate" | "Advanced",
            "specialty": "Medical specialty (Cardiology, Immunology, etc.)",
            "suggestedQuizCount": 10-50 based on content length
          }`
        },
        {
          role: "user",
          content: `Analyze this medical content from file "${filename}":\n\n${content.substring(0, 4000)}`
        }
      ],
      temperature: 0.3,
    });

    console.log('✅ OpenAI API call successful');

    // Parse AI response
    let result;
    try {
      result = JSON.parse(completion.choices[0].message.content || '{}');
      console.log('✅ AI response parsed successfully');
    } catch (aiParseError) {
      console.error('❌ AI response parsing error:', aiParseError);
      console.log('Raw AI response:', completion.choices[0].message.content);
      
      // Fallback response
      result = {
        summary: "Content analysis completed",
        keyTopics: ["General Medicine"],
        difficulty: "Intermediate",
        specialty: "General Medicine",
        suggestedQuizCount: 10
      };
    }
    
    console.log('🎉 Returning successful response');
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('💥 Analyze content error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json({ 
      error: 'Failed to analyze content',
      details: error.message 
    }, { status: 500 });
  }
}