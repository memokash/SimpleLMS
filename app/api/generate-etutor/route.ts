import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { userName, quizTitle, notes, incorrectAnswers } = await req.json();

    if (!userName || !quizTitle || !notes) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const prompt = buildETutorPrompt(userName, quizTitle, notes, incorrectAnswers);

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

    const tutoringContent = completion.choices[0]?.message?.content;

    if (!tutoringContent) {
      return NextResponse.json({ error: 'No content generated' }, { status: 500 });
    }

    return NextResponse.json({ content: tutoringContent });
  } catch (error) {
    console.error('❌ Error generating eTutor:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

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
