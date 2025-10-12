'use server';
import { prisma } from '@/utils/db';
import { auth } from '@clerk/nextjs/server';
import { calculateNextReviewTime } from './srs';
import { addWordToUserSet } from './redis';
import { handleWordGenerationRequest } from './word';
import type { Word } from '@prisma/client';
import OpenAI from 'openai';

/**
 * Check which words from a list are already in the user's deck
 */
export const checkWordsInDeck = async (words: string[], userIdParam?: string) => {
  const { userId: authUserId } = await auth();
  const userId = userIdParam || authUserId;
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    // Get all user words
    const userWords = await prisma.usersWord.findMany({
      where: {
        userId,
        word: {
          in: words,
        },
      },
      select: {
        word: true,
      },
    });

    // Create a set of words the user has
    const userWordsSet = new Set(userWords.map(uw => uw.word));

    // Return boolean array matching input words
    return words.map(word => userWordsSet.has(word));
  } catch (error) {
    console.error('Error checking words in deck:', error);
    throw error;
  }
};

/**
 * Add a word to the user's deck from content
 */
export const addWordFromContent = async (
  userIdParam: string,
  word: string,
  language: string
) => {
  const { userId: authUserId } = await auth();
  const userId = userIdParam || authUserId;
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    // Check if word already exists in deck
    const existing = await prisma.usersWord.findFirst({
      where: {
        userId,
        word,
      },
    });

    if (existing) {
      return existing;
    }

    // Add to Redis set
    await addWordToUserSet(userId, language, word);

    // Add to database with initial SRS values
    const nextReview = await calculateNextReviewTime(1);
    
    const userWord = await prisma.usersWord.create({
      data: {
        userId,
        word,
        level: 1,
        repetitions: 0,
        easeFactor: 2.5,
        interval: 1,
        nextReviewTime: nextReview,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return userWord;
  } catch (error) {
    console.error('Error adding word from content:', error);
    throw error;
  }
};

/**
 * Get statistics about words in a text
 */
export const getTextStats = async (words: string[], userIdParam?: string) => {
  const { userId: authUserId } = await auth();
  const userId = userIdParam || authUserId;
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    const wordStatuses = await checkWordsInDeck(words, userId);
    const knownCount = wordStatuses.filter(Boolean).length;
    const unknownCount = words.length - knownCount;
    const knownPercentage = words.length > 0 ? (knownCount / words.length) * 100 : 0;

    return {
      total: words.length,
      known: knownCount,
      unknown: unknownCount,
      knownPercentage: Math.round(knownPercentage),
    };
  } catch (error) {
    console.error('Error getting text stats:', error);
    throw error;
  }
};

/**
 * Get or generate flashcard data for a word
 */
export const getOrCreateWordFlashcard = async (
  word: string,
  language: string
): Promise<Partial<Word> | null> => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    // First, check if word exists in database
    const existingWord = await prisma.word.findFirst({
      where: {
        displayText: word,
      },
    });

    if (existingWord) {
      return existingWord;
    }

    // If not, generate it using the existing word generation service
    console.log(`Generating flashcard for: ${word} in ${language}`);
    const newWord = await handleWordGenerationRequest(word, language);
    
    return newWord || null;
  } catch (error) {
    console.error('Error getting/creating word flashcard:', error);
    throw error;
  }
};

/**
 * Check if user has a word in their deck
 */
export const isWordInUserDeck = async (word: string) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    const userWord = await prisma.usersWord.findFirst({
      where: {
        userId,
        word,
      },
    });

    return !!userWord;
  } catch (error) {
    console.error('Error checking if word in deck:', error);
    return false;
  }
};

/**
 * Check if the image for a word has been uploaded to S3
 * (Used when word has generationId but no imageUrl yet)
 */
export const checkWordImageReady = async (
  wordDisplayText: string
): Promise<string | null> => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    // Fetch the latest word data from database
    // The webhook may have updated it with the imageUrl
    const word = await prisma.word.findFirst({
      where: {
        displayText: wordDisplayText,
      },
      select: {
        imageUrl: true,
        generationId: true,
      },
    });

    // If imageUrl exists, return it
    if (word?.imageUrl) {
      return word.imageUrl;
    }

    // If no imageUrl yet but has generationId, image is still being generated
    if (word?.generationId && !word.imageUrl) {
      return null; // Still processing
    }

    return null;
  } catch (error) {
    console.error('Error checking word image:', error);
    return null;
  }
};

/**
 * Save content to user's library
 */
export const saveContentToLibrary = async (
  text: string,
  language: string,
  analysis: {
    summary: string;
    sentiment: string;
    topic: string;
    difficulty: string;
  } | null,
  audioUrl: string | null
) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    // Generate a title from the summary or first 50 chars
    const title = analysis?.topic || text.substring(0, 50) + (text.length > 50 ? '...' : '');
    
    const userContent = await prisma.userContent.create({
      data: {
        userId,
        title,
        text,
        language,
        summary: analysis?.summary || null,
        sentiment: analysis?.sentiment || null,
        topic: analysis?.topic || null,
        difficulty: analysis?.difficulty || null,
        audioUrl: audioUrl || null,
      },
    });

    return userContent;
  } catch (error) {
    console.error('Error saving content to library:', error);
    throw error;
  }
};

/**
 * Get all saved content for a user
 */
export const getUserContentLibrary = async (limit: number = 50) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    const contents = await prisma.userContent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return contents;
  } catch (error) {
    console.error('Error fetching user content library:', error);
    throw error;
  }
};

/**
 * Get a specific saved content by ID
 */
export const getSavedContent = async (contentId: string) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    const content = await prisma.userContent.findFirst({
      where: {
        id: contentId,
        userId, // Ensure user owns this content
      },
    });

    return content;
  } catch (error) {
    console.error('Error fetching saved content:', error);
    throw error;
  }
};

/**
 * Delete saved content
 */
export const deleteSavedContent = async (contentId: string) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    await prisma.userContent.delete({
      where: {
        id: contentId,
        userId, // Ensure user owns this content
      },
    });

    return true;
  } catch (error) {
    console.error('Error deleting saved content:', error);
    throw error;
  }
};

/**
 * Generate a summary and sentiment analysis of the text using OpenAI
 */
export const analyzeTextContent = async (
  text: string,
  language: string
): Promise<{
  summary: string;
  sentiment: string;
  topic: string;
  difficulty: string;
} | null> => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    const OPENAI_API_KEY = process.env.OPENAI_KEY;
    
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return null;
    }

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    const prompt = `Analyze this text in ${language} and provide:

Text: "${text}"

Please provide a JSON response with:
1. "summary" - A brief 1-2 sentence summary of what this text is about in English
2. "sentiment" - The overall tone/sentiment (e.g., "Informative and educational", "Lighthearted and fun", "Serious and formal")
3. "topic" - The main topic category (e.g., "Travel", "Technology", "Daily Life", "News", "Literature")
4. "difficulty" - Estimated difficulty level (e.g., "Beginner", "Intermediate", "Advanced")

Return ONLY valid JSON, no additional text.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a language learning assistant. Analyze texts and provide helpful summaries for language learners.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      return null;
    }

    const analysis = JSON.parse(content);
    
    return {
      summary: analysis.summary || 'No summary available',
      sentiment: analysis.sentiment || 'Neutral',
      topic: analysis.topic || 'General',
      difficulty: analysis.difficulty || 'Intermediate',
    };
  } catch (error) {
    console.error('Error analyzing text content:', error);
    return null;
  }
};

