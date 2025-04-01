"use server"
import { prisma } from '@/utils/db';
import { Word } from '@prisma/client';
import {
  createAudioFileFromText,
  generateFromLeonardo,
  getWordDataViaGPT,
} from './ai';
import { getDiff } from './redis';
import { greekMFUKey } from '../_constants/constants';

export const generateWordsForUser = async (
  number: number,
  userId: string,
  language: string
) => {
  const userKey = `${userId}/${language}`;
  //check if redis key exists
  try {
    //   const keyExists = redis.client.exists(userKey)
    //   if(!keyExists) {
    //     redis.client.hSet()
    //   }
    // }
    const result = await getDiff(greekMFUKey, userKey);
    return result;
  } catch (error) {
    console.error('Couldnt get diff: ', error);
  }
};

export const saveWordInDatabase = async (data: Partial<Word>) => {
  try {
    const word = await prisma.word.create({
      data,
    });
    return word;
  } catch (error) {
    console.error('Couldnt save New Word: ', error);
  }
};

export const getWordsFromDatabase = async (word: string) => {
  try {
    const foundWord = await prisma.word.findFirst({
      where: {
        displayText: word,
      },
    });
    const serializedWord = foundWord ? { ...foundWord } : null;
    console.log('Found: ', serializedWord);
    console.log(typeof serializedWord);
    return serializedWord;
  } catch (error: unknown) {
    console.log('Error Occured: ', error);
  }
};

export const handleWordGenerationRequest = async (
  word: string,
  language: string
) => {
  console.log('Handling Server Generation....');
  const wordInDatabase = await getWordsFromDatabase(word);
  console.log('Word In Database: ', wordInDatabase);
  if (wordInDatabase) {
    return wordInDatabase;
  }
  const wordInfo = await getWordDataViaGPT(word, language);
  const imageGenerationId = await generateFromLeonardo(wordInfo.imagePrompt);
  const audioUrl = await createAudioFileFromText(word);
  console.log('Word Info: ', {
    wordInfo,
    imageGenerationId,
    audioUrl,
  });
  const newWord = saveWordInDatabase({
    displayText: word,
    languageId: '9cdde1b6-8f3c-4924-9d2a-167207e7385b',
    pronunciationUrl: audioUrl,
    mnemonic: wordInfo?.mnemonic,
    funFact: wordInfo?.funFact,
    phoneticTranscription: wordInfo?.phoneticTranscription,
    pinyin: wordInfo?.pinyin,
    generationId: imageGenerationId,
  });
  return newWord;
};
