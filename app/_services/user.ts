'use server';

import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/utils/db';

export const getUser = async () => {
  const user = await currentUser();
  console.log('user: ', user?.id);
  return user?.id;
};

/**
 * Get the user's selected language (mostRecentSkill)
 */
export const getUserLanguage = async () => {
  const user = await currentUser();
  if (!user?.id) {
    return null;
  }

  try {
    const userData = await prisma.user.findFirst({
      where: { clerkId: user.id },
      select: { mostRecentSkill: true },
    });

    return userData?.mostRecentSkill || null;
  } catch (error) {
    console.error('Error fetching user language:', error);
    return null;
  }
};
