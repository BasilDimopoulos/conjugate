import { getUser } from '@/app/_services/user';
import { prisma } from '@/utils/db';
import {
  generateWordsForUser,
  getFlashCardDataForWords,
} from '@/app/_services/word';
import { FlashCardHolder } from '@/app/_components/flashcard';
import { Suspense } from 'react';

interface HomeComponent {
  userId: string;
  skill: string | null;
}

// async function fetchUserSkills(userId: string) {
//   const response = await fetch(
//     `${process.env.NEXT_PUBLIC_BACKEND_URL}/user?userId=${userId}`
//   );

//   console.log('Response: ', response);

//   if (!response.ok) {
//     throw new Error('Failed to fetch skills');
//   }

//   const data = await response.json();
//   return data;
// }

async function fetchAvailableSkills() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/skills`);

  if (!response.ok) {
    throw new Error('Failed to fetch skills');
  }

  const data = await response.json();
  return data;
}

export default async function Home() {
  const clerkId = await getUser();
  if (!clerkId) return <p className="text-white">Error no user</p>;
  const userData = await prisma.user.findFirst({
    where: { clerkId: clerkId },
    include: { skills: true },
  });

  if (!userData?.skills.length || userData?.skills.length < 1) {
    await fetchAvailableSkills();
    // return <InductionWizard skills={availableSkills} userId={userData.id} />;
  } else
    return (
      <HomeComponent userId={userData.id} skill={userData.mostRecentSkill} />
    );
}

const HomeComponent = async (props: HomeComponent) => {
  return (
    // if words are less than 10
    <div className="flex flex-col items-center text-center">
      <h1 className="text-white font-bold text-4xl capitalize mt-20">
        Lets get started with your few words.
      </h1>
      <p className="text-white font-sans mt-2">
        {' '}
        With these we can begin telling you stories
      </p>
      <Suspense fallback={<p className="text-white mt-10">Loading flashcards...</p>}>
        <FlashCardLoader {...props} />
      </Suspense>
    </div>
  );
};

const FlashCardLoader = async ({ userId, skill }: { userId: string; skill: string | null }) => {
  const unknownWords = await generateWordsForUser(3, userId, skill || 'greek');
  if (!unknownWords) {
    return <p className="text-white mt-10">No words available</p>;
  }
  const words = await getFlashCardDataForWords(unknownWords, 'greek');
  if (!words) {
    return <p className="text-white mt-10">No flashcard data available</p>;
  }

  // Filter out undefined values
  const validWords = words.filter((word): word is NonNullable<typeof word> => word !== undefined);

  return <FlashCardHolder userId={userId} skill={skill || 'greek'} words={validWords} />;
};