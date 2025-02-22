export default async function Home() {
  return (
    <>
      <div className="relative h-screen bg-black">
        <div className="w-full flex container mx-auto items-center justify-center h-2/3 relative z-10">
          <div className="flex flex-col items-center gap-y-1 mt-[8%]">
            <div className="bg-indigo-700/30 rounded-full px-2 py-1 my-1">
            </div>
            <h1 className="text-7xl font-bold text-white font-sans text-center max-w-6xl mt-1">
              Bring your clients their best ads yet
            </h1>
            <p className="text-white my-5 font-sans text-lg text-center max-w-3xl">
              Learn your target language the most fun and effective way with AI
              assisted comprehensible input.
            </p>
          </div>
        </div>
        <div className="w-full left-[23rem] absolute z-0"></div>
      </div>
    </>
  );
}
