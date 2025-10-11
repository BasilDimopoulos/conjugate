'use server';

import { prisma } from "@/utils/db";

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

export const getStoryById = async (id: string) => {
  try {
    const story = await prisma.story.findUnique({
      where: { id },
    });
    return story;
  } catch (error) {
    console.error('❌ Error fetching story:', error);
    throw new Error('Failed to fetch story');
  }
};
