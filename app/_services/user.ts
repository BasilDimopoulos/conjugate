'use server';

import { currentUser } from '@clerk/nextjs/server';

export const getUser = async () => {
  const user = await currentUser();
  console.log('user: ', user?.id);
  return user?.id;
};
