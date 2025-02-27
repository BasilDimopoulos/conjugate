'use client';
import FlashCard from '@/app/_components/flashcard';
import { NewFlashCardOptions } from '@/app/_components/FlashCardOptions';
import { getUser } from '@/app/_services/user';
import { useEffect, useState } from 'react';

const requestCard = async (word: string, language: string) => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/word?word=${encodeURIComponent(
        word
      )}&language=${encodeURIComponent(language)}`
    );
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const wordData = await response.json();
    console.log(wordData);
    return wordData;
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
};

export default function Home() {
  const [inputWord, setInputWord] = useState('');
  const [generatedCard, setGeneratedCard] = useState(null);
  const [currentUser, setCurrentUser] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUser();
      setCurrentUser(user || '');
    };
    fetchUser();
  }, []);

  let userId;
  const handleGeneration = async () => {
    const flashCard = await requestCard(inputWord, 'chinese');
    userId = await getUser();
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
          <FlashCard
            card={generatedCard}
            imageGenerated={false}
            cardOptions={
              <NewFlashCardOptions word={generatedCard} userId={currentUser} />
            }
          ></FlashCard>
          {/* <button
            onClick={() => saveWordInDatabase(generatedCard)}
            className="mt-20 bg-velvet px-3 py-1"
          >
            Confirm
          </button> */}
        </>
      )}
    </div>
  );
}
