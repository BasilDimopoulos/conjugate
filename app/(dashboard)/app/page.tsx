import { getUser } from '@/app/_services/user';
import { InductionWizard } from './setup/InductionWizard';

async function fetchUserSkills(userId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/user?userId=${userId}`
  );

  console.log("Response: ", response)

  if (!response.ok) {
    throw new Error('Failed to fetch skills');
  }

  const data = await response.json();
  return data;
}

async function fetchAvailableSkills() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/skills`);

  if (!response.ok) {
    throw new Error('Failed to fetch skills');
  }

  const data = await response.json();
  return data;
}

export default async function Home() {
  const userId = await getUser();
  if (!userId) return <p className="text-white">Error no user</p>;
  const skills = await fetchUserSkills(userId);
  console.log('skills: ', skills);

  if (skills?.length === 0) {
    const availableSkills = await fetchAvailableSkills();
    return <InductionWizard skills={availableSkills} userId={userId} />;
  } else return <p>Skills!</p>;
  // <div className="flex flex-col items-center text-center">
  //   <h1 className="text-white font-bold text-4xl capitalize mt-20">
  //     Lets get started with your few words.
  //   </h1>
  //   <p className="text-white font-sans mt-2">
  //     {' '}
  //     With these we can begin telling you stories
  //   </p>
  //   {/* <FlashCard /> */}
  // </div>
}
