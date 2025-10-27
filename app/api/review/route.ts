import { NextRequest, NextResponse } from 'next/server';
import { getReviewDeck, updateWordReview } from '@/app/_services/srs';
import { DifficultyLevels } from '@/app/_services/srs-types';
import { auth } from '@clerk/nextjs/server';

// GET: Fetch words due for review
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');

    // Use the server function
    const data = await getReviewDeck(limit);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching review words:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review words' },
      { status: 500 }
    );
  }
}

// POST: Update word review status
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userWordId, difficulty } = body;

    if (!userWordId || difficulty === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: userWordId and difficulty' },
        { status: 400 }
      );
    }

    // Validate difficulty value
    const validDifficulties = Object.values(DifficultyLevels);
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty value' },
        { status: 400 }
      );
    }

    const updatedWord = await updateWordReview(userWordId, difficulty);

    return NextResponse.json({
      success: true,
      word: updatedWord,
    });
  } catch (error) {
    console.error('Error updating word review:', error);
    return NextResponse.json(
      { error: 'Failed to update word review' },
      { status: 500 }
    );
  }
}

