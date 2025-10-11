'use client';
import { Dialogue, PlayerChoice } from '@/app/models/game';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

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
  id: '4bdfb1b0-e88d-4d9f-9b74-45a028e2942a',
  chapterId: '988f43c1-1d47-4e89-b3d8-71f5ca551a4e',
  location: "Serpent's Study - Hidden chamber beneath Hogwarts",
  imageUrl:
    'https://conjugate-filestore.s3.ap-southeast-2.amazonaws.com/scene/serpents_study.jpg',
  isFinalScene: false,
  dialogues: [
    {
      id: 'dlg1',
      character: {
        id: 'louis_dimos',
        name: 'Louis Dimos',
        imageUrl:
          'https://conjugate-filestore.s3.ap-southeast-2.amazonaws.com/characters/dimoslouis.png',
      },
      text: "This chamber... it flows with ancient power. The relics from my ancestors resonate with my Parseltongue. It's as if my very blood calls out to them.",
      audioUrl:
        'https://conjugate-filestore.s3.ap-southeast-2.amazonaws.com/audio/2025-09-08T02_50_19_Nathaniel+C+-+Suspense%2C+British+calm+_pvc_sp104_s5_sb44_se80_b_m2.mp3',
    },
    {
      id: 'dlg2',
      character: {
        id: 'selwyn_drakonis',
        name: 'Professor Selwyn Drakonis',
        imageUrl:
          'https://conjugate-filestore.s3.ap-southeast-2.amazonaws.com/characters/selwyn.png',
      },
      text: "Louis, the Order watches carefully. Your family's legacy is more than just history—it's a battleground. The Silver Serpent aims to awaken those dormant powers, not always with noble intent.",
      audioUrl:
        'https://conjugate-filestore.s3.ap-southeast-2.amazonaws.com/audio/ElevenLabs_2025-09-08T03_25_54_Tarquin+-+Posh+%26+English+RP_pvc_sp100_s50_sb75_se66_b_m2.mp3',
    },
    {
      id: 'dlg3',
      character: {
        id: 'louis_dimos',
        name: 'Louis Dimos',
        imageUrl:
          'https://conjugate-filestore.s3.ap-southeast-2.amazonaws.com/characters/dimoslouis.png',
      },
      text: "I have no choice but to master the secrets here. But I also need allies I can trust. Mira's insight and Cassius's cunning might be the support I need—if they can handle the weight of this knowledge.",
      audioUrl:
        'https://conjugate-filestore.s3.ap-southeast-2.amazonaws.com/audio/ElevenLabs_2025-09-08T03_27_38_Nathaniel+C+-+Suspense%2C+British+calm+_pvc_sp112_s5_sb44_se80_b_m2.mp3',
    },
    {
      id: 'dlg4',
      character: {
        id: 'mira_althaea',
        name: 'Mira Althaea',
        imageUrl:
          'https://conjugate-filestore.s3.ap-southeast-2.amazonaws.com/characters/mira.png',
      },
      text: "Louis, the aura around these artifacts is thick with both promise and peril. The Order's reach extends far, but so do the secrets the Circle of Eternal Study whispers about. We must tread carefully.",
      audioUrl:
        'https://conjugate-filestore.s3.ap-southeast-2.amazonaws.com/audio/ElevenLabs_2025-09-08T03_34_45_Emma+Taylor_pvc_sp107_s29_sb7_se81_b_m2.mp3',
    },
    {
      id: 'dlg5',
      character: {
        id: 'cassius_veyra',
        name: 'Cassius Veyra',
        imageUrl:
          'https://conjugate-filestore.s3.ap-southeast-2.amazonaws.com/characters/cassius-veyra.png',
      },
      text: "I don't trust any secret society, but if playing their game buys us time to unlock your family’s power, then so be it. Just remember—it’s a dangerous dance. One mistake, and they’ll bury us.",
      audioUrl:
        'https://conjugate-filestore.s3.ap-southeast-2.amazonaws.com/audio/ElevenLabs_2025-09-08T03_37_04_Theos_pvc_sp109_s9_sb6_se88_b_m2.mp3',
    },
    {
      id: 'dlg6',
      character: {
        id: 'selwyn_drakonis',
        name: 'Professor Selwyn Drakonis',
        imageUrl:
          'https://conjugate-filestore.s3.ap-southeast-2.amazonaws.com/characters/selwyn.png',
      },
      text: "I will continue to guide you, but my warnings are clear: the Order of Silver Serpent is not merely academic—it's an extremist faction with their own prophecies. Your mysterious ring may hold keys... and traps.",
      audioUrl:
        'https://conjugate-filestore.s3.ap-southeast-2.amazonaws.com/audio/ElevenLabs_2025-09-08T03_37_57_Tarquin+-+Posh+%26+English+RP_pvc_sp100_s50_sb75_se66_b_m2.mp3',
    },
    {
      id: 'louis_dimos',
      name: 'Louis Dimos',
      character: {
        id: 'louis_dimos',
        name: 'Louis Dimos',
        imageUrl:
          'https://conjugate-filestore.s3.ap-southeast-2.amazonaws.com/characters/dimoslouis.png',
      },
      text: 'Every discovery feels like walking a razor’s edge. But I won’t let my family’s legacy fall into the wrong hands. I have to decide soon—betray secrecy for allies... or risk facing the Order alone.',
      audioUrl:
        'https://conjugate-filestore.s3.ap-southeast-2.amazonaws.com/audio/ElevenLabs_2025-09-08T03_38_54_Nathaniel+C+-+Suspense%2C+British+calm+_pvc_sp112_s5_sb44_se80_b_m2.mp3',
    },

    // {
    //   id: 'playerChoice',
    //   character: { id: 'player', name: 'Player', imageUrl: '' },
    //   text: '',
    //   audioUrl: '',
    //   options: [
    //     'Seek out Mira and Cassius to form a secret pact',
    //     "Confront the Order of Silver Serpent through Professor Drakonis's mentorship",
    //     'Decide my own action...',
    //   ],
    // },
  ],
};

export default function Game() {
  const [currentScene, setCurrentScene] = useState(0);
  const scene = firstScenario;
  console.log(scene);
  return (
    <div className="w-full h-full mt-5">
      <SceneWindow
        scene={scene}
        onSceneFinished={() => setCurrentScene(currentScene + 1)}
        numberOfDialogueOptions={scene.dialogues?.length}
      />
    </div>
  );
}

function SceneWindow(props: SceneProps) {
  const [currentDialogue, setCurrentDialogue] = useState(0);

  const dialogue = props.scene?.dialogues;

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
      <DialogueWindow dialogue={dialogue} />
    </div>
  );
}

function DialogueWindow({ dialogue }: { dialogue: Dialogue[] }) {
  const [currentDialogue, setCurrentDialogue] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audioFile = dialogue[currentDialogue]?.audioUrl;
    if (audioFile) {
      const audio = new Audio(audioFile);
      audioRef.current = audio;
      audio.play();
    }

    // Cleanup if component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [currentDialogue, dialogue]);

  return (
    <div
      className="fixed bottom-16 left-0 w-full flex justify-center items-end pointer-events-none"
      onClick={() => {
        if (currentDialogue < dialogue.length) {
          setCurrentDialogue(currentDialogue + 1);
        }
      }}
    >
      <Image
        src={dialogue[currentDialogue].character.imageUrl}
        alt="Character Portrait"
        width={192 * 3} // 48 * 4 for scaling
        height={384 * 3} // adjust for proper aspect ratio
        objectFit="contain"
        priority
      />
      {/* Dialogue window */}
      <div className="relative -ml-10">
        <div className="bg-black w-60 text-white text-lg px-3 py-2 mb-1">
          <p>{dialogue[currentDialogue].character.name}</p>
        </div>
        {/* Dialogue text */}
        <div className="flex-1 w-[800px] h-32 bg-black bg-opacity-80 p-4 flex items-center pointer-events-auto z-10">
          <p className="text-white text-xl">{dialogue[currentDialogue].text}</p>
        </div>

        <div className="w-24 h-24 ml-4 relative z-20"></div>
      </div>
    </div>
  );
}

const PlayerChoices: React.FC<PlayerChoicesProps> = ({
  choices,
  onChoiceSelected,
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
