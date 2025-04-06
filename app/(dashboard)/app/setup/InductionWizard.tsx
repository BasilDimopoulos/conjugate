'use client';
import { Skill } from '@prisma/client';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  BiArrowBack,
  BiArrowToLeft,
  BiCheckCircle,
  BiChevronLeft,
  BiChevronRight,
  BiCircle,
  BiSolidCircle,
} from 'react-icons/bi';

interface InductionProps {
  skills: Skill[];
  userId: string;
}

interface LanguageFeature {
  selectedLanguage: string;
  goBack: () => void;
  skillId: string;
  userId: string;
  router: AppRouterInstance;
}

interface LanguageFeatureRow {
  text: string;
  blockColor: string;
}

export const InductionWizard = (props: InductionProps) => {
  const skills = props.skills;
  const [page, setPage] = useState('intro');
  const [selectedLanguage, setSelectedLanguage] = useState({});
  const router = useRouter();

  return (
    <>
      {page === 'intro' && (
        <div className="text-white flex flex-col items-center text-center">
          <h1 className="text-white font-medium text-4xl capitalize mt-20">
            Select a language you want to learn
          </h1>
          <p className="text-white font-sans mt-5 font-light">
            Select your first language and we can get started on your new
            magical journey
          </p>
          <div className="flex items-center justify-center gap-x-10 mt-8 hover:cursor-pointer">
            {skills?.map((skill: Skill) => (
              <div
                key={skill.id}
                onClick={() => {
                  setSelectedLanguage(skill);
                  setPage('languageFeature');
                }}
              >
                <Image
                  src={`/images/${skill.imageName}`} // ✅ Added `/` to ensure correct path
                  width={40}
                  height={40}
                  alt={skill.name}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      {page === 'languageFeature' && (
        <LanguageFeature
          selectedLanguage={selectedLanguage?.name}
          goBack={() => setPage('intro')}
          skillId={selectedLanguage?.id || ''}
          userId={props.userId}
          router={router}
        />
      )}
    </>
  );
};

const LanguageFeature = (props: LanguageFeature) => {
  const reasons = [
    'Travel',
    'New Connections',
    'Career',
    'Food and Culture',
    'Love',
    'History',
    'Literature',
    'Movies and TV Shows',
  ];
  const [userReasons, setUserReasons] = useState<string[]>([]);
  const [currentPage, setPage] = useState('page1');
  const greetings = {
    chinese: { language: 'chinese', hello: '你好' },
    japanese: { language: 'japanese', hello: 'こんにちは)' },
    greek: {
      language: 'greek',
      hello: 'Γειά σου',
      textBlocks: [
        'Make Flashcards',
        'Generate stories with those flashcards',
        'Make new flashcards based on the new words',
      ],
      blockColor: '#05A9E8',
      buttonColor: '#D5BCF5',
    },
  };

  async function addSkills(userId: string, skills: string[], userReasons: string[]) {
    console.log('UserId: ', userId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/skills`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, skills, reasons: userReasons }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add skills');
      }

      props.router.push('/app');
      window.location.reload();

      console.log('Skills added successfully:', data);
      return data;
    } catch (error) {
      console.error('Error adding skills:', error);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="container max-w-screen-xl flex h-full pt-10">
        <div className="w-[75%] flex flex-col justify-center gap-x-5 relative">
          {/* <BiArrowBack
            className="text-white text-lg mb-3 cursor-pointer absolute top-10"
            onClick={() => props.goBack()}
          /> */}
          {currentPage === 'page1' && (
            <>
              <p className="italic text-white text-left font-light pb-1 text-sm">
                {greetings[props.selectedLanguage].hello} 👋
              </p>
              <h2 className="text-white font-medium text-3xl capitalize pr-10">
                Tell us a bit more about why you want to learn
              </h2>
              <div className="flex flex-wrap gap-5 mt-5">
                {reasons.map((reason, index) => (
                  <div
                    className="w-[40%] text-white bg-[#3B353C] px-3 py-2 flex items-center justify-between"
                    key={index}
                    onClick={() => {
                      if (userReasons.includes(reason)) {
                        setUserReasons(userReasons.filter((r) => r !== reason));
                      } else {
                        setUserReasons([...userReasons, reason]);
                      }
                    }}
                  >
                    <p className="font-sans text-sm">{reason}</p>
                    {userReasons.includes(reason) ? (
                      <BiCheckCircle />
                    ) : (
                      <BiCircle />
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setPage('page2')}
                className="bg-white absolute bottom-10 right-20 px-6 py-1.5 font-sans font-medium text-black/85 flex items-center justify-center gap-x-1"
                style={{
                  backgroundColor:
                    greetings[props.selectedLanguage]?.buttonColor || 'white',
                }}
              >
                <p>Next</p>
                <BiChevronRight size={20} />
              </button>
            </>
          )}
          {currentPage === 'page2' && (
            <>
              <p className="italic text-white text-left font-light pb-1 text-sm">
                {greetings[props.selectedLanguage].hello} 👋
              </p>
              <h2 className="text-white font-medium text-3xl capitalize pr-10">
                Let&apos;s get started with your first {props.selectedLanguage}{' '}
                words
              </h2>
              <div className="flex flex-col gap-y-10 mt-10">
                {greetings[props.selectedLanguage].textBlocks?.map(
                  (item, index) => (
                    <LanguageFeatureRow
                      text={item}
                      key={index}
                      blockColor={
                        greetings[props.selectedLanguage]?.blockColor ||
                        '#FFFFFF'
                      }
                    />
                  )
                )}
              </div>
              <button
                onClick={() => addSkills(props.userId, [props.skillId], userReasons)}
                className="bg-white absolute bottom-10 right-20 px-6 py-1.5 font-sans font-medium text-black/85 flex items-center justify-center gap-x-1"
                style={{
                  backgroundColor:
                    greetings[props.selectedLanguage]?.buttonColor || 'white',
                }}
              >
                <p>Lets Go</p>
                <BiChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        <div
          className="w-full h-full"
          style={{
            backgroundImage: "url('/images/greece_intro.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        ></div>
      </div>
    </div>
  );
};

const LanguageFeatureRow = (props: LanguageFeatureRow) => {
  const blockColor = props.blockColor;
  return (
    <div className="flex gap-x-14">
      <BiSolidCircle className="size-6" style={{ fill: blockColor }} />
      <p className="text-white/85 font-sans font-medium">{props.text}</p>
    </div>
  );
};
