import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { content, specialty, questionCount } = await request.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a medical education expert creating USMLE-style questions. Create ${questionCount} multiple choice questions and return ONLY valid JSON in this exact format:
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
          }`
        },
        {
          role: "user",
          content: `Create ${questionCount} high-quality ${specialty} questions from this content:\n\n${content.substring(0, 3000)}`
        }
      ],
      temperature: 0.7,
    });

    const result = JSON.parse(completion.choices[0].message.content || '{"questions": []}');
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating quiz:', error);
    return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 });
  }
}