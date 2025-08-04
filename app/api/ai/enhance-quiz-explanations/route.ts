// app/api/ai/enhance-quiz-explanations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, options, correctAnswer, category } = body;

    // Validate input
    if (!question || !options || typeof correctAnswer !== 'number') {
      return NextResponse.json({ error: 'Invalid question data' }, { status: 400 });
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

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    const parsedResponse = JSON.parse(response);
    return NextResponse.json(parsedResponse);

  } catch (error) {
    console.error('❌ Enhancement error:', error);
    return NextResponse.json({ error: 'Enhancement failed' }, { status: 500 });
  }
}