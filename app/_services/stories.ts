'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getStories = async () => {
  try {
    const stories = await prisma.story.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return stories;
  } catch (error) {
    console.error('❌ Error fetching stories:', error);
    throw new Error('Failed to fetch stories');
  }
};

//starting new story
// make database entry for UserStory
// Initialise Story Log
// Send Ai to create first chapter structure
// Initialise Chapter with that structure 
// Create first scene