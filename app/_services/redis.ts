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
    await redis.set(key, word, level);
  } catch (err: unknown) {
    console.log(err);
  }
};
