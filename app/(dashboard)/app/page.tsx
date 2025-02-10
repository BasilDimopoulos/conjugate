import FlashCard from '@/app/_components/flashcard';
// import { redis } from '@/utils/redis';
export default async function Home() {
  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="text-white font-bold text-4xl capitalize mt-20">
        Lets get started with your few words.
      </h1>
      <p className="text-white font-sans mt-2">
        {' '}
        With these we can begin telling you stories
      </p>
      <FlashCard />
    </div>
  );
}
