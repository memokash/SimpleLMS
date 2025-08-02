import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { content, filename } = await request.json();

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

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error analyzing content:', error);
    return NextResponse.json({ error: 'Failed to analyze content' }, { status: 500 });
  }
}