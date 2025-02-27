import {
  BiCheckCircle,
  BiCircleHalf,
  BiMinusCircle,
  BiPlusCircle,
  BiSticker,
} from 'react-icons/bi';
import { storeWordInRedis } from '../_services/redis';
import { Word } from '@prisma/client';

interface WordInformation {
  word: Partial<Word>;
  userId: string;
}
export function NewFlashCardOptions(props: WordInformation) {
  return (
    <div className="flex items-center gap-x-5 justify-center w-full mt-10">
      <button
        className="bg-black/40 w-32 h-8 flex items-center justify-between px-3"
        onClick={() =>
          storeWordInRedis(
            props.word.displayText || '',
            props.word.languageId || '',
            0,
            props.userId
          )
        }
      >
        <p className="text-white/80 font-sans text-sm">New</p>
        <BiPlusCircle className="text-red-700" />
      </button>
      <button className="bg-black/40 w-32 h-8 flex items-center justify-between px-3">
        <p className="text-white/80 font-sans text-sm">I know this</p>
        <BiSticker className="text-orange-700" />
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
