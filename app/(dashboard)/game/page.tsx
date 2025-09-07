'use client';
import { Dialogue, PlayerChoice, Scene } from '@/app/models/game';
import Image from 'next/image';
import { useState } from 'react';

type SceneProps = {
  scene: any; // ideally type this properly
  numberOfDialogueOptions: number;
  onSceneFinished: () => void;
};

type PlayerChoicesProps = {
  choices: PlayerChoice[];
  onChoiceSelected: () => void;
};

const firstScenario = {
  id: 'louis_intro',
  title: 'A New Beginning at Hogwarts',
  startSceneId: 'scene1',
  scenes: [
    {
      id: 'scene1',
      dialogues: [
        {
          id: 'd1',
          type: 'dialogue', // normal character dialogue
          character: {
            id: 'louis_dimos',
            name: 'Louis Dimos',
            imageUrl:
              'https://conjugate-filestore.s3.ap-southeast-2.amazonaws.com/characters/louisD.png',
          },
          text: 'The castle feels different at night… quieter, yet heavy with secrets. I must find where I belong before anyone notices me.',
        },
        {
          id: 'd2',
          type: 'dialogue',
          character: {
            id: 'npc_1',
            name: 'Mysterious Voice',
            imageUrl:
              'https://conjugate-filestore.s3.ap-southeast-2.amazonaws.com/characters/shadowy_figure.png',
          },
          text: 'Louis Dimos… you are not like the others. Some truths are better left undiscovered, yet you will seek them anyway.',
        },
        {
          id: 'd3',
          type: 'player_choice',
          text: 'Who are you? Show yourself!',
          nextSceneId: 'scene2',
        },
        {
          id: 'd4',
          type: 'player_choice',
          text: 'Ignore it and continue to the common room.',
          nextSceneId: 'scene3',
        },
      ],
      imageUrl:
        'https://conjugate-filestore.s3.ap-southeast-2.amazonaws.com/scene/hogwarts.png',
    },
    {
      id: 'scene2',
      dialogues: [
        {
          id: 'd5',
          type: 'dialogue',
          character: {
            id: 'npc_1',
            name: 'Mysterious Voice',
            imageUrl:
              'https://conjugate-filestore.s3.ap-southeast-2.amazonaws.com/characters/shadowy_figure.png',
          },
          text: 'Patience, Louis. The answers you seek will come… but not all are ready for them.',
        },
        {
          id: 'd6',
          type: 'player_choice',
          text: 'I will wait… but I will learn.',
          nextSceneId: 'scene4',
        },
      ],
      imageUrl:
        'https://conjugate-filestore.s3.ap-southeast-2.amazonaws.com/scene/hogwarts.png',
    },
    {
      id: 'scene3',
      dialogues: [
        {
          id: 'd7',
          type: 'dialogue',
          character: {
            id: 'louis_dimos',
            name: 'Louis Dimos',
            imageUrl:
              'https://conjugate-filestore.s3.ap-southeast-2.amazonaws.com/characters/louisD.png',
          },
          text: 'Best not to draw attention… for now. The common room will provide some answers in time.',
        },
        {
          id: 'd8',
          type: 'player_choice',
          text: 'Head to the common room quietly.',
          nextSceneId: 'scene4',
        },
      ],
      imageUrl:
        'https://conjugate-filestore.s3.ap-southeast-2.amazonaws.com/scene/hogwarts.png',
    },
    {
      id: 'scene4',
      dialogues: [
        {
          id: 'd9',
          type: 'dialogue',
          character: {
            id: 'npc_2',
            name: 'Slytherin Prefect',
            imageUrl:
              'https://conjugate-filestore.s3.ap-southeast-2.amazonaws.com/characters/slytherin_prefect.png',
          },
          text: "You're late, Dimos. First-year duties are no joke, especially for someone… special.",
        },
        {
          id: 'd10',
          type: 'player_choice',
          text: 'Apologize and follow instructions.',
          nextSceneId: 'scene5',
        },
        {
          id: 'd11',
          type: 'player_choice',
          text: 'Smile knowingly and proceed anyway.',
          nextSceneId: 'scene6',
        },
      ],
      imageUrl:
        'https://conjugate-filestore.s3.ap-southeast-2.amazonaws.com/scene/hogwarts.png',
    },
  ],
};

export default function Game() {
  const [currentScene, setCurrentScene] = useState(0);
  const scene = firstScenario.scenes[currentScene];
  console.log(scene);
  return (
    <div className="w-full h-full mt-5">
      <SceneWindow
        scene={scene}
        onSceneFinished={() => setCurrentScene(currentScene + 1)}
        numberOfDialogueOptions={scene.dialogues.length}
      />
    </div>
  );
}

function SceneWindow(props: SceneProps) {
  const [currentDialogue, setCurrentDialogue] = useState(0);

  const dialogue = props.scene?.dialogues?.[currentDialogue];

  if (!dialogue) return null;

  const handleNext = () => {
    if (currentDialogue + 1 < props.numberOfDialogueOptions) {
      setCurrentDialogue(currentDialogue + 1);
    } else {
      setCurrentDialogue(0);
      props.onSceneFinished();
    }
  };

  return (
    <div
      className="h-full bg-cover bg-center"
      style={{ backgroundImage: `url(${props.scene.imageUrl})` }}
    >
      {dialogue.type === 'dialogue' ? ( //fix this
        <div onClick={handleNext}>
          <DialogueWindow dialogue={dialogue} />
        </div>
      ) : dialogue.type === 'player_choice' ? (
        <PlayerChoices
          choices={props.scene.dialogues.filter( //lol fix this garbage
            (d) => d.type === 'player_choice'
          )}
          onChoiceSelected={() => {handleNext()}}
        />
      ) : null}
    </div>
  );
}

function DialogueWindow({ dialogue }: { dialogue: Dialogue }) {
  return (
    <div className="fixed bottom-16 left-0 w-full flex justify-center items-end pointer-events-none">
      <Image
        src={dialogue.character.imageUrl}
        alt="Character Portrait"
        width={192 * 3} // 48 * 4 for scaling
        height={384 * 3} // adjust for proper aspect ratio
        objectFit="contain"
        priority
      />
      {/* Dialogue window */}
      <div className="relative -ml-10">
        <div className="bg-black w-32 text-white text-lg px-3 py-2 mb-1">
          <p>{dialogue.character.name}</p>
        </div>
        {/* Dialogue text */}
        <div className="flex-1 w-[800px] h-32 bg-black bg-opacity-80 p-4 flex items-center pointer-events-auto z-10">
          <p className="text-white text-xl">{dialogue.text}</p>
        </div>

        <div className="w-24 h-24 ml-4 relative z-20"></div>
      </div>
    </div>
  );
}

const PlayerChoices: React.FC<PlayerChoicesProps> = ({
  choices,
  onChoiceSelected
}) => {
  return (
    <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 flex flex-col gap-4 z-50">
      {choices.map((choice, index) => (
        <button
          key={choice.id || index}
          onClick={() => onChoiceSelected()}
          className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors w-64 text-left shadow-lg"
        >
          {choice.text}
        </button>
      ))}
    </div>
  );
};
