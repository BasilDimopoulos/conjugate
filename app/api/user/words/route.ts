/* eslint-disable @typescript-eslint/no-explicit-any */
import { calculateNextReviewTime } from '@/app/_services/srs';
import { redis } from '@/utils/redis';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const requestData = req.nextUrl.searchParams;
  const userId = requestData.get('userId');
  const subject = requestData.get('subject');

  if (!userId || !subject) {
    return NextResponse.json('Invalid Input', { status: 400 });
  }

  //TO-DO check if over a certain limit, e.g 1000 words
  const usersSet = await redis.client.hGetAll(`${userId}/${subject}`);
  return NextResponse.json(usersSet, { status: 200 });
}

export async function POST(req: NextRequest) {
  const { userId, words } = await req.json();

  if (!userId || !words || !Array.isArray(words)) {
    return NextResponse.json('Invalid Input', { status: 400 });
  }

  // Prepare the Redis sorted set key
  const sortedSetKey = `${userId}/words_due`;

  try {
    // Loop over words and add them to the sorted set with the review time as score
    for (const word of words) {
      const { wordText, level } = word;

      if (!wordText || !level) {
        return NextResponse.json('Missing word data', { status: 400 });
      }

      // Calculate the next review time based on the word's level
      const nextReviewTime = calculateNextReviewTime(level);

      // Convert the nextReviewTime to a Unix timestamp for the score
      const score = nextReviewTime.getTime();

      // Add the word to the sorted set
      await redis.client.zAdd(sortedSetKey, {
        score,
        value: wordText,
      });
    }

    // Respond with a success message
    return NextResponse.json({ message: 'Words updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating words:', error);
    return NextResponse.json('Internal Server Error', { status: 500 });
  }
}

