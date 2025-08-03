// app/api/ai/generate-quiz/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Generate quiz API called');
    
    // Check API key first (same structure as analyze)
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('🔍 API Key exists:', !!apiKey);
    console.log('🔍 API Key length:', apiKey?.length);
    console.log('🔍 API Key starts with sk-:', apiKey?.startsWith('sk-'));
    
    if (!apiKey) {
      console.error('❌ OpenAI API key not found');
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // Parse request body (same structure as analyze)
    let requestData;
    try {
      requestData = await request.json();
      console.log('📝 Request data received:', {
        hasContent: !!requestData.content,
        contentLength: requestData.content?.length,
        specialty: requestData.specialty,
        questionCount: requestData.questionCount,
        userId: requestData.userId,
        filename: requestData.filename
      });
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request' }, { status: 400 });
    }

    const { content, specialty, questionCount, userId, filename } = requestData;

    // Validate required fields
    if (!content) {
      console.error('❌ No content provided');
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (!questionCount || questionCount < 1) {
      console.error('❌ Invalid question count');
      return NextResponse.json({ error: 'Question count must be at least 1' }, { status: 400 });
    }

    // Initialize OpenAI (same structure as analyze)
    const openai = new OpenAI({
      apiKey: apiKey,
    });
    console.log('✅ OpenAI client initialized for quiz generation');

    // Make OpenAI API call
    console.log('🤖 Making OpenAI API call for quiz generation...');
    console.log('📊 Generation parameters:', {
      model: 'gpt-4',
      specialty: specialty || 'General Medicine',
      questionCount: questionCount,
      contentPreview: content.substring(0, 100) + '...'
    });
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a medical education expert creating USMLE-style questions. Create exactly ${questionCount} multiple choice questions and return ONLY valid JSON in this exact format:
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
          }
          
          Important rules:
          - correctAnswer should be the index (0, 1, 2, or 3) of the correct option
          - Each question must be high-quality and clinically relevant
          - Options should be plausible distractors
          - Explanations should be educational and detailed`
        },
        {
          role: "user",
          content: `Create ${questionCount} high-quality ${specialty || 'medical'} questions from this content:\n\n${content.substring(0, 3000)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    console.log('✅ OpenAI quiz generation successful');
    console.log('📄 Raw response length:', completion.choices[0].message.content?.length);

    // Parse AI response
    let result;
    try {
      const rawContent = completion.choices[0].message.content || '{"questions": []}';
      console.log('📝 Parsing AI response...');
      
      result = JSON.parse(rawContent);
      console.log('✅ Quiz questions parsed successfully:', {
        questionCount: result.questions?.length,
        hasQuestions: !!result.questions,
        firstQuestionPreview: result.questions?.[0]?.question?.substring(0, 50) + '...'
      });

      // Validate the result structure
      if (!result.questions || !Array.isArray(result.questions)) {
        throw new Error('Invalid response structure: questions array missing');
      }

      if (result.questions.length === 0) {
        throw new Error('No questions generated');
      }

      // Validate each question
      for (let i = 0; i < result.questions.length; i++) {
        const q = result.questions[i];
        if (!q.question || !q.options || !Array.isArray(q.options) || q.options.length !== 4) {
          throw new Error(`Invalid question structure at index ${i}`);
        }
        if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
          throw new Error(`Invalid correctAnswer at index ${i}`);
        }
      }

    } catch (aiParseError) {
      console.error('❌ AI response parsing error:', aiParseError);
      console.log('🔍 Raw AI response:', completion.choices[0].message.content);
      return NextResponse.json({ 
        error: 'Failed to parse AI response', 
        details: aiParseError.message 
      }, { status: 500 });
    }

    // Initialize response flags
    result.savedToBank = false;
    result.bankMessage = 'Questions generated successfully';

    // Save questions to Firestore if userId is provided
    if (userId && result.questions && result.questions.length > 0) {
      try {
        console.log('💾 Attempting to save questions to Firestore...');
        console.log('🔍 Firebase db object exists:', !!db);
        console.log('🔍 User ID:', userId);
        console.log('🔍 Questions to save:', result.questions.length);

        // Save each question to the questionBank collection
        const savePromises = result.questions.map(async (question: any, index: number) => {
          console.log(`📝 Saving question ${index + 1}/${result.questions.length}`);
          
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
            generationModel: 'gpt-4',
            generatedAt: new Date().toISOString()
          };

          return addDoc(collection(db, "questionBank"), questionDoc);
        });

        await Promise.all(savePromises);
        
        console.log(`✅ Successfully saved ${result.questions.length} questions to question bank`);
        result.savedToBank = true;
        result.bankMessage = `${result.questions.length} questions saved to community question bank!`;
        
      } catch (saveError) {
        console.error('❌ Error saving questions to bank:', saveError);
        console.error('🔍 Save error details:', {
          name: saveError.name,
          message: saveError.message,
          code: saveError.code
        });
        
        result.savedToBank = false;
        result.bankMessage = `Questions generated but failed to save to bank: ${saveError.message}`;
      }
    } else {
      console.log('⚠️ Not saving to bank:', {
        hasUserId: !!userId,
        hasQuestions: !!(result.questions && result.questions.length > 0),
        userId: userId,
        questionsCount: result.questions?.length || 0
      });
      
      if (!userId) {
        result.bankMessage = 'Questions generated but not saved (no user ID provided)';
      } else {
        result.bankMessage = 'Questions generated but not saved (no valid questions)';
      }
    }
    
    console.log('🎉 Returning quiz response with', result.questions.length, 'questions');
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('💥 Generate quiz error:', error);
    console.error('🔍 Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.substring(0, 500)
    });
    
    return NextResponse.json({ 
      error: 'Failed to generate quiz',
      details: error.message,
      type: error.name
    }, { status: 500 });
  }
}