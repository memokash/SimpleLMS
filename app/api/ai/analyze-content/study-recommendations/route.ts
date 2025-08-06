import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userProgress } = await request.json();
    
    const mockRecommendations = [
      "Review your weakest performing topics with focused study sessions",
      "Practice more questions in areas where you scored below 70%",
      "Create flashcards for key concepts you missed"
    ];
    
    return NextResponse.json(mockRecommendations);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 });
  }
}