'use client';
import FlashCard from '@/app/_components/flashcard';
import {
  createAudioFileFromText,
  generateFromLeonardo,
  getWordDataViaGPT,
  // retrieveImageFromLeonardo,
} from '@/app/_services/ai';
import { saveWordInDatabase } from '@/app/_services/word';
import { useState } from 'react';

const generateCard = async (word: string, language: string) => {
  console.log('Getting Data...');
  const wordInfo = await getFlashCardData(word, language);
  const imageGenerationId = await generateImage(wordInfo.imagePrompt);
  // const imageUrl = await retrieveImageFromLeonardo(imageGenerationId);
  const audioUrl = await createAudioFileFromText(word);
  console.log('Word Info: ', {
    wordInfo,
    imageGenerationId,
    audioUrl,
  });
  const id = saveWordInDatabase({
    displayText: word,
    languageId: '9cdde1b6-8f3c-4924-9d2a-167207e7385b',
    pronunciationUrl: audioUrl,
    mnemonic: wordInfo?.mnemonic,
    funFact: wordInfo?.funFact,
    phoneticTranscription: wordInfo?.phoneticTranscription,
    pinyin: wordInfo?.pinyin,
    generationId: imageGenerationId,
  });
  return {
    id,
    displayText: word,
    languageId: '9cdde1b6-8f3c-4924-9d2a-167207e7385b',
    pronunciationUrl: audioUrl,
    mnemonic: wordInfo?.mnemonic,
    funFact: wordInfo?.funFact,
    phoneticTranscription: wordInfo?.phoneticTranscription,
    pinyin: wordInfo?.pinyin,
    generationId: imageGenerationId,
  };
};

const getFlashCardData = async (word: string, language: string) => {
  const wordInformation = await getWordDataViaGPT(word, language);
  return wordInformation;
};

const generateImage = async (imagePrompt: string) => {
  console.log('Getting Image From Leonardo');
  const imageId = await generateFromLeonardo(imagePrompt);
  console.log('images: ', imageId);
  return imageId;
};

export default function Home() {
  const [inputWord, setInputWord] = useState('');
  const [generatedCard, setGeneratedCard] = useState(null);
  const handleGeneration = async () => {
    const flashCard = await generateCard(inputWord, 'chinese');
    setGeneratedCard(flashCard);
  };
  return (
    <div className="flex flex-col items-center text-center text-white/80">
      <label className="mt-20">Word</label>
      <input
        onChange={(e) => setInputWord(e.target.value)}
        value={inputWord}
        className="mt-1 text-black px-1"
      ></input>

      <button
        onClick={() => handleGeneration()}
        className="mt-20 bg-velvet px-3 py-1"
      >
        Generate Data
      </button>
      {generatedCard && (
        <>
          <FlashCard card={generatedCard} imageGenerated={false}></FlashCard>
          <button
            onClick={() => saveWordInDatabase(generatedCard)}
            className="mt-20 bg-velvet px-3 py-1"
          >
            Confirm
          </button>
        </>
      )}
    </div>
  );
}
