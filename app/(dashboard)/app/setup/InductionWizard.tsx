'use client';
import { Skill } from '@prisma/client';
import Image from 'next/image';
import { useState } from 'react';

interface InductionProps {
  skills: Skill[];
  userId: string;
}

interface LanguageFeature {
  selectedLanguage: string;
}

export const InductionWizard = (props: InductionProps) => {
  const skills = props.skills;
  const [page, setPage] = useState('intro');
  const [selectedLanguage, setSelectedLanguage] = useState('');

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
                  setSelectedLanguage(skill?.name);
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
        <LanguageFeature selectedLanguage={selectedLanguage} />
      )}
    </>
  );
};

const LanguageFeature = (props: LanguageFeature) => {
  const greetings = {
    chinese: { language: 'chinese', hello: '你好' },
    japanese: { language: 'japanese', hello: 'こんにちは)' },
    greek: { language: 'greek', hello: 'Γειά σου' },
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className='container max-w-screen-xl flex h-full px-10'>
        <div className="w-[45%] flex flex-col justify-center gap-x-5">
          <p className="italic text-white text-left">
            {greetings[props.selectedLanguage].hello} 👋
          </p>
          <h2 className="text-white font-medium text-2xl capitalize">
            Let's get started with your first {props.selectedLanguage} words
          </h2>
        </div>
        <div className="bg-black w-full h-full"></div>
      </div>
    </div>
  );
};
