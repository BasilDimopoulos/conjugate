'use client';

import Image from 'next/image';
import { ReactElement, useState } from 'react';
import { BiPlayCircle } from 'react-icons/bi';
import {
  BiCheckCircle,
  BiCircleHalf,
  BiMinusCircle,
  BiPlusCircle,
  BiSticker,
} from 'react-icons/bi';
import { Word } from '@prisma/client';
import { handleUserAddingWordToTheirList } from '../_services/word';

interface FlashCardProps {
  card: Partial<Word>;
  cardOptions: ReactElement;
}

interface WordInformation {
  word: Partial<Word>;
  userId: string;
  extraActions?: () => void;
}

interface FlashCardHolder {
  userId: string;
  skill: string;
  words: Partial<Word>[];
}

const playSound = (url: string) => {
  const audio = new Audio(url);
  audio.play();
};

export default function FlashCard(props: FlashCardProps) {
  const card = props.card;
  console.log('Card: ', card);
  return (
    <div>
      <div className="flex gap-x-4 mt-10">
        {card.imageUrl ? (
          <Image
            src={card.imageUrl}
            width={320}
            height={480}
            alt="flashcard image"
          />
        ) : (
          <p>Image Loading...</p>
        )}
        <div className="flex flex-col justify-between pt-2">
          <div>
            <div>
              <BiPlayCircle
                className="text-white -ml-0.5 text-3xl cursor-pointer"
                onClick={() => playSound(card.pronunciationUrl)}
              />
              <div className="flex items-center gap-x-2 mt-2">
                <h1 className="text-white text-4xl font-medium">
                  {card.displayText}{' '}
                </h1>
                <p className="italic font-sans text-white/60 self-end text-sm">
                  {card?.pinyin || card.phoneticTranscription}
                </p>
              </div>
              <p className="text-white/80 font-sans max-w-xl text-left mt-1">
                {card.englishTranslation}
              </p>
            </div>
          </div>
          <div>
            <p className="text-white/80 font-sans max-w-xl text-left mb-2">
              {card.mnemonic}
            </p>
            <p className="text-white/80 font-sans italic text-sm text-left max-w-sm">
              {card.funFact}
            </p>
          </div>
        </div>
      </div>
      {props.cardOptions}
    </div>
  );
}

export function NewFlashCardOptions(props: WordInformation) {
  return (
    <div className="flex items-center gap-x-5 justify-center w-full mt-10">
      <button
        className="bg-black/40 w-32 h-8 flex items-center justify-between px-3"
        onClick={() => {
          handleUserAddingWordToTheirList(
            props.userId,
            props.word.displayText,
            props.word.languageId,
            1
          );
          if (props?.extraActions) props.extraActions();
        }}
      >
        <p className="text-white/80 font-sans text-sm">New</p>
        <BiPlusCircle className="text-purple-400" />
      </button>
      <button className="bg-black/40 w-32 h-8 flex items-center justify-between px-3">
        <p className="text-white/80 font-sans text-sm">I know this</p>
        <BiSticker className="text-orange-600" />
      </button>
    </div>
  );
}

export function LearnedFlashCardOptions() {
  return (
    <div className="flex items-center gap-x-5 justify-center w-full mt-10">
      <button className="bg-black/40 w-32 h-8 flex items-center justify-between px-3">
        <p className="text-white/80 font-sans text-sm">Hard</p>
        <BiMinusCircle className="text-red-700" />
      </button>
      <button className="bg-black/40 w-32 h-8 flex items-center justify-between px-3">
        <p className="text-white/80 font-sans text-sm">Medium</p>
        <BiCircleHalf className="text-orange-700" />
      </button>
      <button className="bg-black/40 w-32 h-8 flex items-center justify-between px-3">
        <p className="text-white/80 font-sans text-sm">Easy</p>
        <BiCheckCircle className="text-green-700" />
      </button>
    </div>
  );
}

export const FlashCardHolder = (props: FlashCardHolder) => {
  const cards = [];
  const userId = props.userId;
  const words = props.words;
  const [index, setState] = useState(0);
  console.log('The words to begin learning are: ', words);
  for (const word of words) {
    const options = (
      <NewFlashCardOptions
        word={word}
        userId={userId}
        extraActions={() => setState(index + 1)}
      />
    );
    const flashCard = <FlashCard card={word} cardOptions={options} />;
    cards.push(flashCard);
  }
  return cards[index];
};
