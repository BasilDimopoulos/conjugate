import { prisma } from '@/utils/db';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const createNewUser = async () => {
  const clerkUser = await currentUser();
  console.log('Current User Is: ', clerkUser);
  if (!clerkUser) return;
  const match = await prisma.user.findUnique({
    where: {
      clerkId: clerkUser.id as string,
    },
  });
  console.log('Match: ', match);

  if (!match) {
    await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0].emailAddress,
      },
    });
  }

  redirect('/app');
};
const NewUser = async () => {
  await createNewUser();
  return <div>Hi...</div>;
};

export default NewUser;
