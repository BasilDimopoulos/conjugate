import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/utils/db';
import { generateArticleAudio } from '@/app/_services/ai';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookId, language } = await request.json();

    if (!bookId || !language) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the book content
    const userContent = await prisma.userContent.findFirst({
      where: {
        id: bookId,
        userId,
      },
    });

    if (!userContent || !userContent.text) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    console.log(`Generating full audio for book: ${userContent.title}`);

    // Generate full audio (not just initial)
    const audioUrl = await generateArticleAudio(userContent.text, language, false);

    if (!audioUrl) {
      return NextResponse.json(
        { error: 'Failed to generate audio' },
        { status: 500 }
      );
    }

    // Update the database with the full audio URL and mark as full
    await prisma.userContent.update({
      where: { id: bookId },
      data: { 
        audioUrl,
        hasFullAudio: true,  // Mark that full audio has been generated
      },
    });

    console.log(`Full audio generated and saved: ${audioUrl}`);

    return NextResponse.json({
      success: true,
      audioUrl,
    });

  } catch (error) {
    console.error('Generate full audio API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate audio', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

