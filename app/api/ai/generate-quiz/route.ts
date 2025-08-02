// app/api/ai/generate-quiz/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../lib/firebase'; // Adjust path as needed

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { content, specialty, questionCount, userId, filename } = await request.json();

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
    
    // Save questions to Firestore if userId is provided
    if (userId && result.questions && result.questions.length > 0) {
      try {
        // Save each question to the questionBank collection
        const savePromises = result.questions.map(async (question: any) => {
          const questionDoc = {
            // Question content
            question: question.question,
            options: question.options,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            topic: question.topic,
            
            // Metadata
            specialty: specialty || 'General Medicine',
            difficulty: 'Intermediate',
            sourceContent: filename || 'AI Generated',
            
            // Tracking
            createdBy: userId,
            createdAt: serverTimestamp(),
            timesUsed: 0,
            
            // Tags for searching
            tags: [
              specialty?.toLowerCase(),
              question.topic?.toLowerCase()
            ].filter(Boolean),
            
            // AI generation info
            aiGenerated: true,
            generationModel: 'gpt-4'
          };

          return addDoc(collection(db, "questionBank"), questionDoc);
        });

        await Promise.all(savePromises);
        
        console.log(`Saved ${result.questions.length} questions to question bank`);
        result.savedToBank = true;
        result.bankMessage = `${result.questions.length} questions saved to community question bank!`;
        
      } catch (saveError) {
        console.error('Error saving questions to bank:', saveError);
        result.savedToBank = false;
        result.bankMessage = `Questions generated but failed to save to bank: ${saveError.message}`;
      }
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating quiz:', error);
    return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 });
  }
}