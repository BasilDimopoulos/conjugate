import Image from 'next/image';

export default async function Home() {
  return (
    <>
      <div className="relative h-screen bg-[url('/images/hero_background.webp')] bg-cover bg-center before:absolute before:inset-0 before:bg-black before:bg-opacity-20 before:content-['']">
        <div className="w-full flex container mx-auto items-center justify-center h-2/3 relative z-10">
          <div className="flex flex-col items-center gap-y-1 mt-[8%]">
            <div className="bg-indigo-700/30 rounded-full px-2 py-1 my-1">
              <p className="text-white font-sans text-sm">
                🦄 The best language learning app
              </p>
            </div>
            <h1 className="text-7xl font-bold text-white font-serif text-center max-w-6xl mt-1">
              A Little Bit of Magic, for Serious Language Learners
            </h1>
            <p className="text-white my-5 font-sans text-lg text-center max-w-3xl">
              Learn your target language the most fun and effective way with AI
              assisted comprehensible input.
            </p>
            <div className="flex items-center gap-x-5 rounded-full bg-indigo-800/30 px-12 py-1 mt-2">
              <Image
                src="/images/china_flag.svg"
                width={34}
                height={34}
                alt="china flag"
              />
              <Image
                src="/images/japan_flag.svg"
                width={34}
                height={34}
                alt="china flag"
              />
              <Image
                src="/images/korea_flag.svg"
                width={34}
                height={34}
                alt="china flag"
              />
            </div>
          </div>
        </div>
        <div className="w-full left-[23rem] absolute z-0"></div>
      </div>
    </>
  );
}
