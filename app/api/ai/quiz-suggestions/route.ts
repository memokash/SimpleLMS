import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { userId, userStats } = await request.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

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

    const suggestions = JSON.parse(completion.choices[0].message.content || '[]');

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Error generating quiz suggestions:', error);
    return NextResponse.json({ error: 'Failed to generate quiz suggestions' }, { status: 500 });
  }
}
