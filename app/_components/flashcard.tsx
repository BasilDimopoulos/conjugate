import Image from 'next/image';
import {
  BiCheckCircle,
  BiCircleHalf,
  BiMinusCircle,
  BiPlayCircle,
} from 'react-icons/bi';

export default function FlashCard() {
  return (
    <div>
      <div className="flex gap-x-4 mt-10">
        <Image
          src="/images/dragon.jpg"
          width={320}
          height={480}
          alt="flashcard image"
        />
        <div className="flex flex-col justify-between py-2">
          <div>
            <div>
              <BiPlayCircle className="text-white -ml-0.5 text-3xl" />
              <div className="flex items-center gap-x-2 mt-2">
                <h1 className="text-white text-4xl font-medium">Dragon</h1>
                <p className="italic font-sans text-white/80 pt-1">Dra.gon</p>
              </div>
              <p className="text-white/80 font-sans max-w-xl text-left mt-1">
                Russian fairy tales nearly saw their extinction in the wake of
                Soviet rule because communist proponents found folklore
                detrimental to furthering their ideals.
              </p>
            </div>
          </div>

          <p className="text-white/80 font-sans italic text-sm max-w-xl text-left mt-1">
            Russian fairy tales nearly saw their extinction in the wake of
            Soviet rule because communist proponents found folklore detrimental
            to furthering their ideals.
          </p>
        </div>
      </div>
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
    </div>
  );
}
