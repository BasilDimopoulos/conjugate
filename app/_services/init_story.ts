'use server';
import { prisma } from '@/utils/db';
import { v4 as uuid } from 'uuid';

interface StoryArcJson {
  arc_id: string;
  arc_name: string;
  focus_character: string;
  themes: string[];
  tone_style: {
    inspiration: string;
    blend: string[];
    ending_feel: string;
  };
  series_context: string;
  synopsis: string;
  acts: {
    act_id: string;
    description: string;
    key_events: string[];
    completed: boolean;
    quests: {
      quest_id: string;
      name: string;
      objective: string;
      reward: string;
    }[];
    powers: {
      power_id: string;
      name: string;
      effect: string;
      risk?: string;
    }[];
    villain_options: {
      name: string;
      description: string;
    }[];
  }[];
  potential_outcomes: {
    outcome_id: string;
    description: string;
  }[];
}

export async function createStoryArcForUser(
  userId: string,
  storyId: string,
  storyArcJson: StoryArcJson
) {
  return await prisma.storyArc.create({
    data: {
      id: uuid(), // prisma will also generate by default, but explicit is fine
      arcId: storyId,
      arcName: storyArcJson.arc_name,
      focusCharacter: storyArcJson.focus_character,
      seriesContext: storyArcJson.series_context,
      synopsis: storyArcJson.synopsis,
      themes: storyArcJson.themes,
      toneInspiration: storyArcJson.tone_style.inspiration,
      toneBlend: storyArcJson.tone_style.blend,
      endingFeel: storyArcJson.tone_style.ending_feel,
      userId,

      acts: {
        create: storyArcJson.acts.map((act) => ({
          actId: act.act_id,
          description: act.description,
          keyEvents: act.key_events,
          completed: act.completed,

          quests: {
            create: act.quests.map((q) => ({
              questId: q.quest_id,
              name: q.name,
              objective: q.objective,
              reward: q.reward,
            })),
          },
          powers: {
            create: act.powers.map((p) => ({
              powerId: p.power_id,
              name: p.name,
              effect: p.effect,
              risk: p.risk,
            })),
          },
          villainOptions: {
            create: act.villain_options.map((v) => ({
              name: v.name,
              description: v.description,
            })),
          },
        })),
      },

      potentialOutcomes: {
        create: storyArcJson.potential_outcomes.map((o) => ({
          outcomeId: o.outcome_id,
          description: o.description,
        })),
      },
    },
  });
}

export async function getStoryArcWithDetails(storyArcId: string) {
  return await prisma.storyArc.findUnique({
    where: { id: storyArcId },
    include: {
      acts: {
        include: {
          quests: true,
          powers: true,
          villainOptions: true,
        },
      },
      potentialOutcomes: true,
    },
  });
}
