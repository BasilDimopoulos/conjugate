import { NextResponse } from 'next/server';
import { getUserVocabStats } from '@/app/_services/srs';
import { auth } from '@clerk/nextjs/server';

// GET: Fetch user's vocabulary statistics
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use the server function
    const stats = await getUserVocabStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching vocab stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vocabulary statistics' },
      { status: 500 }
    );
  }
}

