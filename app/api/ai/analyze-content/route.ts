import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { userProgress } = await request.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an AI study advisor for medical students. Based on user performance data, provide 3-5 specific, actionable study recommendations. Return as a JSON array of strings.`
        },
        {
          role: "user",
          content: `Analyze this medical student's progress and provide study recommendations:\n\n${JSON.stringify(userProgress, null, 2)}`
        }
      ],
      temperature: 0.6,
    });

    const recommendations = JSON.parse(completion.choices[0].message.content || '[]');

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 });
  }
}

