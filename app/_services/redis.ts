'use server';
import { redis } from '@/utils/redis';

export const addWordToUserSet = async (
  userId: string,
  language: string,
  word: string
) => {
  console.log("adding word to: ", `${userId}/${language}` )
  const key = `${userId}/${language}`;
  await redis.client.sAdd(key, word);
};

export const getDiff = async (
  commonWordsKey: string,
  usersWordsKey: string,
  number: number
) => {
  try {
    // Fetch the words the user doesn't know
    const unknownWords = await redis.client.sDiff([
      commonWordsKey,
      usersWordsKey,
    ]);

    console.log('Unkown Words: ', unknownWords);
    // If we have at least 10 words, return 10 random words from the common words set
    if (unknownWords.length >= number) {
      return unknownWords.slice(0, number);
    } else {
      return unknownWords;
    }
  } catch (error) {
    console.error('Error fetching unknown words:', error);
    return [];
  }
};
