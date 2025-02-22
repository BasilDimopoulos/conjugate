'use client';

import { BiNote, BiSolidFile } from 'react-icons/bi';
import { useState } from 'react';
import AiAssistant from '@/app/_components/AiAssistant';

export default function Home() {
  const [wizardState, setWizardState] = useState('setup');

  const loadWithoutTemplate = () => {
    // set draft object to empty
    setWizardState('wizard');
  };

  const loadReview = () => {
    setWizardState('review');
  };

  const returnToWizard = () => {
    setWizardState('wizard');
  };

  if (wizardState === 'setup') {
    // return <WizardIntroduction _noTemplate={loadWithoutTemplate} />; 
    return <AiAssistant />
  }
  // } else if (wizardState === "wizard") {
  //   return <CampaignWizard _loadReview={loadReview} />;
  // } else {
  //   return <ReviewCampaign _return={returnToWizard} />;
}

const WizardIntroduction = (props: any) => {
  return (
    <div className="flex w-full flex-col items-center bg-white font-sans h-screen">
      <div className="w-3/5 xl:w-2/5">
        <h2 className="my-20 text-center text-3xl">
          Create your campaign from scratch or use a professionally designed
          template
        </h2>
        <div className="flex justify-center gap-x-32">
          <div className="w-40 text-center flex flex-col items-center">
            <p className="font-semibold">Start From Scratch</p>
            <BiNote
              className=" pt-2 text-8xl font-thin text-blue-900"
              onClick={() => props?.loadWithoutTemplate()}
            />
            <p className="text-xs font-light">
              Create a one-of-a-kind campaign from the ground up, tailoring
              every detail to your unique needs
            </p>
          </div>
          <div className="w-40 text-center flex flex-col items-center">
            <p className="font-semibold">Use a Template</p>
            <BiSolidFile className=" pt-2 text-8xl font-thin text-blue-900" />
            <p className="text-xs font-light">
              Effortlessly customise and deploy tried-and-true campaigns that
              have delivered results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
