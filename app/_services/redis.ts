'use server';
import { redis } from '@/utils/redis';

export const storeWordInRedis = async (
  word: string,
  language: string,
  level: number,
  userId: string
) => {
  try {
    const key = `${userId}/${language}`;
    console.log('key: ', key);
    console.log('userId: ', userId);
    // await redis.client.set(key, word, level);
  } catch (err: unknown) {
    console.log(err);
  }
};

export const getDiff = async (
  commonWordsKey: string,
  usersWordsKey: string
) => {
  try {
    // const usersWords = await redis.client.hGetAll(usersWordsKey)
    const usersWords = await redis.client.lRange("test", 0, -1)
    console.log("UsersWords: ", usersWords)
    // Fetch the words the user doesn't know
    const unknownWords = await redis.client.sDiff([
      commonWordsKey,
      usersWordsKey,
    ]);

    console.log("Unkown Words: ", unknownWords)
    // If we have at least 10 words, return 10 random words from the common words set
    if (unknownWords.length >= 10) {
      return unknownWords.slice(0, 10);
    } else {
      return unknownWords;
    }
  } catch (error) {
    console.error('Error fetching unknown words:', error);
    return [];
  }
};
