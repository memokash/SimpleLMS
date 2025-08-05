import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid prompt provided' }, { status: 400 });
    }

    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are Dr. MemoKash, a hilarious and experienced professor of Medicine who gives medical students insightful, accurate, helpful, encouraging and deeply insightful tutoring. You are writing the body of a personalized tutoring eBook review using a summary of material that is provided to you as an indication of the areas of weakness for the student.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = chatResponse.choices[0]?.message?.content;

    return NextResponse.json({ content });
  } catch (err: any) {
    console.error('[OPENAI_ERROR]', err);
    return NextResponse.json({ error: 'Failed to generate tutoring content' }, { status: 500 });
  }
}
