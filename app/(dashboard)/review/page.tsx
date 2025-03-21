interface WordInfo {
  wordText: string;
  description: string;
  level: number;
}

export default function Review() {
  return (
    <div className="relative h-full">
      <h1 className="text-white text-3xl">Your Learned Words</h1>
      <div className="mt-8 flex flex-wrap gap-6">
        <WordComponent
          wordText="Dragon"
          description="Some description here"
          level={0}
        />
         <WordComponent
          wordText="Dragon"
          description="Some description here"
          level={0}
        />
        <WordComponent
          wordText="Dragon"
          description="Some description here"
          level={0}
        />
        <WordComponent
          wordText="Dragon"
          description="Some description here"
          level={0}
        />
        <WordComponent
          wordText="Dragon"
          description="Some description here"
          level={0}
        />
        <WordComponent
          wordText="Dragon"
          description="Some description here"
          level={0}
        />
        <WordComponent
          wordText="Dragon"
          description="Some description here"
          level={0}
        />
      </div>
      <button className="bg-white font-sans font-bold px-6 py-3 absolute bottom-10 right-10">58 Pending Words</button>
    </div>
  );
}

const WordComponent = (props: WordInfo) => {
  return (
    <div className="bg-black/60 w-64 flex justify-between px-4 py-3">
      <div className="font-sans text-white">
        <h2 className="text-base pb-0.5 font-bold">{props.wordText}</h2>
        <p className="text-xs font-light text-white/90">{props.description}</p>
      </div>
      <div className="w-3 h-3 rounded-full bg-yellow-400 mt-1.5"></div>
    </div>
  );
};
