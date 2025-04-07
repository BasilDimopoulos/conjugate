'use server';
import { prisma } from '@/utils/db';
import { Word } from '@prisma/client';
import {
  createAudioFileFromText,
  generateFromLeonardo,
  getWordDataViaGPT,
} from './ai';
import { addWordToUserSet, getDiff } from './redis';
import { greekMFUKey } from '../_constants/constants';
import { calculateNextReviewTime } from './srs';

export const generateWordsForUser = async (
  number: number,
  userId: string,
  language: string
) => {
  const userKey = `${userId}/${language}`;
  //check if redis key exists
  try {
    const result = await getDiff(greekMFUKey, userKey, number);
    return result;
  } catch (error) {
    console.error('Couldnt get diff: ', error);
  }
};

export const getFlashCardDataForWords = async (
  words: string[],
  language: string
) => {
  const wordPromises = words.map(async (word) => {
    console.log('Getting word information for, ', word);
    return handleWordGenerationRequest(word, language);
  });

  const wordData = await Promise.all(wordPromises);
  console.log('Returning: ', wordData);
  return wordData;
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
    englishTranslation: wordInfo?.englishTranslation
  });
  return newWord;
};

export const handleUserAddingWordToTheirList = async (
  userId: string,
  word: string,
  language: string,
  level: number
) => {
  try {
    console.log("ADDING TO SET")
    await addWordToUserSet(userId, language, word);
    await prisma.usersWord.create({
      data: {
        userId: userId,
        word: word,
        level: level,
        nextReviewTime: calculateNextReviewTime(level),
      },
    });
  } catch (error) {
    console.log('error: ', error);
  }
};
