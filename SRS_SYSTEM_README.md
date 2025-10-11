# Spaced Repetition System (SRS) for Language Learning

This document describes the comprehensive SRS system that has been implemented for your language learning application.

## Overview

A complete spaced repetition system based on the SM-2 algorithm has been implemented to help users effectively learn and retain vocabulary. The system schedules word reviews at optimal intervals based on how well the user remembers each word.

## What Was Implemented

### 1. Database Schema Updates (`prisma/schema.prisma`)

The `UsersWord` model has been enhanced with the following SRS fields:

- **`repetitions`**: Number of successful reviews (default: 0)
- **`easeFactor`**: Difficulty multiplier for scheduling (default: 2.5)
- **`interval`**: Current interval in days between reviews (default: 0)
- **`lastReviewed`**: Timestamp of the last review
- **`createdAt`**: When the word was added
- **`updatedAt`**: Last update timestamp
- **`wordId`**: Optional reference to Word table

### 2. SRS Service (`app/_services/srs.ts`)

Comprehensive SRS functions including:

- **`calculateSRS()`**: SM-2 based algorithm that calculates next review based on difficulty
- **`getDueWords()`**: Fetches words due for review for a user
- **`updateWordReview()`**: Updates word status after user rates difficulty
- **`getUserVocabStats()`**: Gets vocabulary statistics (total, due, mastered, learning)

#### Difficulty Levels

```typescript
enum Difficulty {
  HARD = 0,      // Word was hard to remember (reduces interval by 20%)
  MEDIUM = 1,    // Normal difficulty (standard interval)
  EASY = 2,      // Word was easy to remember (increases interval by 30%)
  AGAIN = 3      // Couldn't remember (resets progress)
}
```

#### How the Algorithm Works

1. **First Review**: Scheduled for 1 day later
2. **Second Review**: Scheduled for 6 days later
3. **Subsequent Reviews**: Interval multiplied by ease factor
4. **Ease Factor**: Adjusted based on user's difficulty rating
   - Easy: Increases ease factor and interval
   - Medium: Standard progression
   - Hard: Decreases ease factor and interval
   - Again: Resets to beginning

### 3. Server Functions (Primary) & API Endpoints (Optional)

The system primarily uses **Server Functions** for better performance and direct server-side execution. API endpoints are also available for compatibility.

#### Server Functions

**`getReviewDeck(limit?: number)`**
Fetches words due for review with full word data.

```typescript
import { getReviewDeck } from '@/app/_services/srs';

const data = await getReviewDeck(20);
// Returns: { words: [...], count: number }
```

**`updateWordReview(userWordId: string, difficulty: Difficulty)`**
Updates word review status after user rates difficulty.

```typescript
import { updateWordReview } from '@/app/_services/srs';
import { DifficultyLevels } from '@/app/_services/srs-types';

await updateWordReview(userWordId, DifficultyLevels.EASY);
```

**`getUserVocabStats()`**
Fetches current user's vocabulary statistics.

```typescript
import { getUserVocabStats } from '@/app/_services/srs';

const stats = await getUserVocabStats();
// Returns: { total, dueCount, masteredCount, learning }
```

#### Difficulty Levels

```typescript
export const DifficultyLevels = {
  HARD: 0,      // Word was hard to remember
  MEDIUM: 1,    // Normal difficulty
  EASY: 2,      // Word was easy to remember
  AGAIN: 3,     // Couldn't remember at all
} as const;
```

#### API Endpoints (Alternative)

API routes are also available at `/api/review` and `/api/review/stats` for external integrations or if you prefer REST endpoints over server functions.

### 4. Review UI Components

#### `ReviewFlashCardOptions` Component
Interactive buttons for rating word difficulty:
- **Again** (red): Couldn't remember - resets progress
- **Hard** (orange): Difficult to recall
- **Medium** (yellow): Standard difficulty
- **Easy** (green): Easy to remember

### 5. Learn Page (`app/(dashboard)/learn/page.tsx`)

Completely redesigned to provide a comprehensive review experience:

**Features:**
- **Progress Bar**: Shows current position in review deck
- **Card Counter**: Displays "Card X of Y"
- **Level Indicator**: Shows current SRS level for each word
- **Stats Display**: Shows due count and total vocabulary
- **Iterable Deck**: Automatically advances to next card after review
- **Completion Screen**: Celebrates review completion with stats
- **Loading States**: Smooth loading and saving indicators
- **Empty State**: Friendly message when no reviews are due

**User Flow:**
1. Page loads and fetches due words automatically
2. User sees first card with word information
3. User rates difficulty by clicking a button
4. System saves review and advances to next card
5. After all cards, shows completion screen with stats
6. User can check for more reviews

## Database Migration Required

**IMPORTANT**: Before using the SRS system, you need to run a Prisma migration to update your database schema.

### Steps to Migrate:

1. **Generate Migration:**
   ```bash
   npx prisma migrate dev --name add_srs_fields
   ```

2. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

3. **Verify Migration:**
   Check that the migration was created in `prisma/migrations/`

### For Production:

```bash
npx prisma migrate deploy
```

## Usage Examples

### Adding a New Word to Review

When a user adds a word (using the existing `NewFlashCardOptions`), it's automatically added to their review deck with:
- Initial level: 1
- First review scheduled for: 1 day later
- Default ease factor: 2.5

### Reviewing Words

Users navigate to the **Learn** page (`/learn`) where:
1. The system automatically loads words due for review
2. Users see flashcards one at a time
3. After viewing each card, they rate how well they remembered it
4. The system calculates the next review time based on their rating
5. Progress is saved and they move to the next card

### Tracking Progress

Users can see their progress through:
- Stats on the learn page (due count, total words)
- Completion screen after reviews (mastered count, learning count)
- Level indicators on each flashcard

## Benefits of This SRS System

1. **Optimized Learning**: Reviews are scheduled at scientifically optimal intervals
2. **Personalized**: Adapts to each user's memory of individual words
3. **Efficient**: Focuses review time on words that need reinforcement
4. **Motivating**: Progress tracking and completion screens encourage continued use
5. **Flexible**: Users can review as many or as few cards as they want

## Future Enhancements

Potential additions to consider:

1. **Daily Goals**: Set target number of reviews per day
2. **Streaks**: Track consecutive days of reviewing
3. **Advanced Statistics**: Graphs showing learning progress over time
4. **Custom Decks**: Allow users to create themed word collections
5. **Mobile Optimization**: Swipe gestures for difficulty rating
6. **Notifications**: Remind users when reviews are due
7. **Export/Import**: Allow users to backup their progress

## Technical Notes

- The system uses raw SQL queries for updates to handle fields that may not be in the Prisma type definitions until migration
- Type assertions are used to maintain type safety while supporting both pre and post-migration states
- All dates are stored in UTC and should be converted to user's timezone in the UI if needed
- The ease factor is capped at a minimum of 1.3 to prevent intervals from becoming too short

## Support

If you encounter any issues with the SRS system:
1. Ensure the Prisma migration has been run successfully
2. Check browser console for any API errors
3. Verify that user authentication is working correctly
4. Ensure words exist in the database before adding them to reviews

