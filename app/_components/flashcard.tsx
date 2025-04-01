import { Word } from '@prisma/client';
import Image from 'next/image';
import { ReactElement } from 'react';
import { BiPlayCircle } from 'react-icons/bi';

interface FlashCardProps {
  card: Partial<Word>;
  cardOptions: ReactElement;
}

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
        <div className="flex flex-col justify-between py-2">
          <div>
            <div>
              <BiPlayCircle className="text-white -ml-0.5 text-3xl" />
              <div className="flex items-center gap-x-2 mt-2">
                <h1 className="text-white text-4xl font-medium">
                  {card.displayText}{' '}
                </h1>
                <p className="italic font-sans text-white/60 self-end text-sm">
                  {card?.pinyin || card.phoneticTranscription}
                </p>
              </div>
              <p className="text-white/80 font-sans max-w-xl text-left mt-1">
                {card.mnemonic}
              </p>
            </div>
          </div>

          <p className="text-white/80 font-sans italic text-sm text-left mt-1 max-w-sm">
            {card.funFact}
          </p>
        </div>
      </div>
      {props.cardOptions}
    </div>
  );
}
