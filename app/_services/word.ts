'use server';
import { prisma } from '@/utils/db';
import { Word } from '@prisma/client';

export const saveWordInDatabase = async (data: Partial<Word>) => {
  try {
    await prisma.word.create({
      data,
    });
  } catch (error) {
    console.error('Couldnt save New Word: ', error);
  }
};
