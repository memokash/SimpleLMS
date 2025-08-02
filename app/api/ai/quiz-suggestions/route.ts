// app/api/ai/quiz-suggestions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { userId, userStats } = await request.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an AI study advisor for medical students. Based on user performance data, suggest optimal quiz configurations. Return a JSON array of quiz suggestions with this exact format:
          [
            {
              "specialty": "Cardiology",
              "difficulty": "Intermediate",
              "topics": ["Heart Failure", "Arrhythmias"],
              "questionCount": 20,
              "reason": "Focus on cardiology to improve weak areas",
              "priority": "high"
            }
          ]
          
          Analyze weak areas, recommend appropriate difficulty levels, and suggest specific topics that need attention.`
        },
        {
          role: "user",
          content: `Analyze this medical student's performance and suggest 3-5 optimal quiz configurations:
          
          User ID: ${userId}
          Performance Stats: ${JSON.stringify(userStats, null, 2)}
          
          Consider:
          1. Areas with lowest scores for focused improvement
          2. Topics they haven't practiced recently
          3. Appropriate difficulty progression
          4. Balanced specialty coverage
          5. Question count based on available study time`
        }
      ],
      temperature: 0.4,
    });

    const suggestions = JSON.parse(completion.choices[0].message.content || '[]');
    
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Error generating quiz suggestions:', error);
    return NextResponse.json({ error: 'Failed to generate quiz suggestions' }, { status: 500 });
  }
}