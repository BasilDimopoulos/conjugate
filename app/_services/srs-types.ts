// SRS Types and Constants
// This file does NOT have 'use server' so we can export constants and types

export const DifficultyLevels = {
  HARD: 0,
  MEDIUM: 1,
  EASY: 2,
  AGAIN: 3,
} as const;

export type Difficulty = typeof DifficultyLevels[keyof typeof DifficultyLevels];

// Interface for SRS calculation result
export interface SRSResult {
  repetitions: number;
  easeFactor: number;
  interval: number;
  nextReviewTime: Date;
  level: number;
}

