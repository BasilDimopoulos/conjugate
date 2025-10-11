'use server';
import { prisma } from '@/utils/db';
import { auth } from '@clerk/nextjs/server';
import { DifficultyLevels, type Difficulty, type SRSResult } from './srs-types';

// Note: Cannot re-export constants from 'use server' file
// Import DifficultyLevels and Difficulty directly from './srs-types' in your components

/**
 * Calculate next review time based on the SM-2 algorithm (helper function, not a server action)
 * @param difficulty - How difficult the word was to recall (0=Hard, 1=Medium, 2=Easy, 3=Again)
 * @param repetitions - Current number of successful repetitions
 * @param easeFactor - Current ease factor (difficulty multiplier)
 * @param interval - Current interval in days
 * @returns Updated SRS data
 */
const calculateSRS = (
  difficulty: Difficulty,
  repetitions: number,
  easeFactor: number,
  interval: number
): SRSResult => {
  let newRepetitions = repetitions;
  let newEaseFactor = easeFactor;
  let newInterval = interval;
  let level = 0;

  // If the user marked it as "Again" (couldn't remember), reset progress
  if (difficulty === DifficultyLevels.AGAIN) {
    newRepetitions = 0;
    newInterval = 1;
    level = 0;
  } else {
    // Update ease factor based on difficulty
    // Easy increases ease factor, Hard decreases it
    const easeAdjustment = 0.1 - (2 - difficulty) * 0.08;
    newEaseFactor = Math.max(1.3, easeFactor + easeAdjustment);

    newRepetitions = repetitions + 1;

    // Calculate new interval based on repetition number
    if (newRepetitions === 1) {
      newInterval = 1; // First review after 1 day
      level = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6; // Second review after 6 days
      level = 2;
    } else {
      // Subsequent reviews use the ease factor
      newInterval = Math.round(interval * newEaseFactor);
      level = Math.min(5, Math.floor(newRepetitions / 2) + 2);
    }

    // Apply difficulty modifier to interval
    if (difficulty === DifficultyLevels.HARD) {
      newInterval = Math.max(1, Math.round(newInterval * 0.8));
    } else if (difficulty === DifficultyLevels.EASY) {
      newInterval = Math.round(newInterval * 1.3);
    }
  }

  // Calculate next review date
  const nextReviewTime = new Date();
  nextReviewTime.setDate(nextReviewTime.getDate() + newInterval);

  return {
    repetitions: newRepetitions,
    easeFactor: newEaseFactor,
    interval: newInterval,
    nextReviewTime,
    level,
  };
};

/**
 * Legacy function for backwards compatibility (now async for 'use server' compatibility)
 */
export const calculateNextReviewTime = async (level: number): Promise<Date> => {
  let nextReviewInDays: number;

  switch (level) {
    case 1:
      nextReviewInDays = 1;
      break;
    case 2:
      nextReviewInDays = 3;
      break;
    case 3:
      nextReviewInDays = 7;
      break;
    case 4:
      nextReviewInDays = 14;
      break;
    default:
      nextReviewInDays = 30;
  }

  const nextReviewTime = new Date();
  nextReviewTime.setDate(nextReviewTime.getDate() + nextReviewInDays);

  return nextReviewTime;
};

/**
 * Get all words due for review for a user (server action)
 */
export const getDueWords = async (limit: number = 20) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }
  
  try {
    const now = new Date();
    const dueWords = await prisma.usersWord.findMany({
      where: {
        userId,
        nextReviewTime: {
          lte: now,
        },
      },
      orderBy: {
        nextReviewTime: 'asc',
      },
      take: limit,
    });

    return dueWords;
  } catch (error) {
    console.error('Error fetching due words:', error);
    throw error;
  }
};

/**
 * Get words due for review with full word data (server action)
 */
export const getReviewDeck = async (limit: number = 20) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    const now = new Date();
    const dueUserWords = await prisma.usersWord.findMany({
      where: {
        userId,
        nextReviewTime: {
          lte: now,
        },
      },
      orderBy: {
        nextReviewTime: 'asc',
      },
      take: limit,
    });

    // Import getWordsFromDatabase to avoid circular dependencies
    const { getWordsFromDatabase } = await import('./word');

    // Fetch full word data for each due word
    const wordsWithData = await Promise.all(
      dueUserWords.map(async (userWord) => {
        const wordData = await getWordsFromDatabase(userWord.word);
        // Type assertion for fields that will exist after migration
        const userWordWithSRS = userWord as typeof userWord & {
          repetitions?: number;
          interval?: number;
        };
        return {
          userWordId: userWord.id,
          wordData,
          srsData: {
            level: userWord.level,
            repetitions: userWordWithSRS.repetitions || 0,
            nextReviewTime: userWord.nextReviewTime,
            interval: userWordWithSRS.interval || 0,
          },
        };
      })
    );

    return {
      words: wordsWithData,
      count: wordsWithData.length,
    };
  } catch (error) {
    console.error('Error fetching review deck:', error);
    throw error;
  }
};

/**
 * Update word review status after user rates difficulty (server action)
 */
export const updateWordReview = async (
  userWordId: string,
  difficulty: Difficulty
) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }
  
  try {
    const userWord = await prisma.usersWord.findUnique({
      where: { id: userWordId },
    });

    if (!userWord) {
      throw new Error('User word not found');
    }

    // Type assertion for new fields that will exist after migration
    const userWordWithSRS = userWord as typeof userWord & {
      repetitions: number;
      easeFactor: number;
      interval: number;
    };

    const srsResult = calculateSRS(
      difficulty,
      userWordWithSRS.repetitions || 0,
      userWordWithSRS.easeFactor || 2.5,
      userWordWithSRS.interval || 0
    );

    // Using raw query to update all fields including those not yet in Prisma types
    await prisma.$executeRaw`
      UPDATE "UsersWord" 
      SET 
        "level" = ${srsResult.level},
        "repetitions" = ${srsResult.repetitions},
        "easeFactor" = ${srsResult.easeFactor},
        "interval" = ${srsResult.interval},
        "nextReviewTime" = ${srsResult.nextReviewTime},
        "lastReviewed" = ${new Date()},
        "updatedAt" = ${new Date()}
      WHERE "id" = ${userWordId}
    `;

    return await prisma.usersWord.findUnique({
      where: { id: userWordId },
    });
  } catch (error) {
    console.error('Error updating word review:', error);
    throw error;
  }
};

/**
 * Get statistics about user's vocabulary (server action)
 */
export const getUserVocabStats = async () => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }
  
  try {
    const now = new Date();
    
    const [total, dueCount, masteredCount] = await Promise.all([
      prisma.usersWord.count({ where: { userId } }),
      prisma.usersWord.count({
        where: {
          userId,
          nextReviewTime: { lte: now },
        },
      }),
      prisma.usersWord.count({
        where: {
          userId,
          level: { gte: 4 },
        },
      }),
    ]);

    return {
      total,
      dueCount,
      masteredCount,
      learning: total - masteredCount,
    };
  } catch (error) {
    console.error('Error fetching vocab stats:', error);
    throw error;
  }
};
