import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

// 🧠 Helper function to construct the AI prompt
function buildETutorPrompt(
  userName: string,
  quizTitle: string,
  notes: Record<string, string>,
  incorrectAnswers: { question: string; explanation?: string }[]
): string {
  let prompt = `Create a personalized tutoring session titled "eTutor on ${quizTitle}" for the student ${userName}. The session should:

1. Start with a friendly welcome, normalize making mistakes, and give general study tips.
2. Summarize each incorrect question and teach the correct answer using analogies, humor, and memory tricks.
3. Incorporate the student's notes into the relevant sections.
4. Finish with a signature: "— Dr. MemoKash"

Here are the student's notes per question:\n`;

  Object.entries(notes).forEach(([questionId, note], index) => {
    prompt += `\nNote ${index + 1}:\n${note}`;
  });

  if (incorrectAnswers?.length > 0) {
    prompt += `\n\nIncorrectly answered questions:\n`;
    incorrectAnswers.forEach((q, i) => {
      prompt += `\n${i + 1}. Q: ${q.question}\n${q.explanation ? `Explanation: ${q.explanation}` : ''}`;
    });
  }

  return prompt;
}

export async function POST(req: Request) {
  try {
    console.log('🚀 Generate eTutor API called');
    
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
      requestData = await req.json();
      console.log('📝 Request data received:', {
        hasUserName: !!requestData.userName,
        hasQuizTitle: !!requestData.quizTitle,
        hasNotes: !!requestData.notes,
        incorrectAnswersCount: requestData.incorrectAnswers?.length || 0
      });
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request' }, { status: 400 });
    }

    const { userName, quizTitle, notes, incorrectAnswers } = requestData;

    // Validate required fields
    if (!userName || !quizTitle || !notes) {
      console.error('❌ Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Initialize OpenAI client inside function
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

    const prompt = buildETutorPrompt(userName, quizTitle, notes, incorrectAnswers);

    console.log('🤖 Making OpenAI API call...');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a knowledgeable and humorous medical tutor named Dr. MemoKash. Write in a warm, friendly, and inspiring tone.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    console.log('✅ OpenAI API call successful');

    const tutoringContent = completion.choices[0]?.message?.content;

    if (!tutoringContent) {
      console.error('❌ No content generated');
      return NextResponse.json({ error: 'No content generated' }, { status: 500 });
    }

    console.log('🎉 Returning successful eTutor content');
    return NextResponse.json({ content: tutoringContent });
    
  } catch (error) {
    console.error('💥 Generate eTutor error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error.message 
    }, { status: 500 });
  }
}