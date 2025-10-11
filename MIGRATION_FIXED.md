# SRS System - Fixed and Updated

## Changes Made

### 1. Fixed "Server Actions must be async" Error

**Problem**: In Next.js, when using `'use server'` at the top of a file, all exported functions must be async functions.

**Solution**: 
- Changed `calculateSRS` from an exported function to an internal helper function (not a Server Action)
- Converted `Difficulty` enum to a const object (`DifficultyLevels`) to avoid export issues
- All exported functions in `srs.ts` are now properly async

### 2. Switched from API Routes to Server Functions

**Why**: Server Functions are more efficient in Next.js App Router because they:
- Eliminate the HTTP overhead of API routes
- Execute directly on the server
- Are automatically tree-shaken (only included when used)
- Provide better TypeScript integration
- Are faster and more cost-effective

**Changes**:
- `getReviewDeck()` - Server function to get words due for review
- `updateWordReview()` - Server function to update review status
- `getUserVocabStats()` - Server function to get vocabulary statistics
- All functions include automatic authentication via `auth()` from Clerk
- Learn page now calls these functions directly instead of making fetch requests

### 3. Updated Type System

**Before**:
```typescript
export enum Difficulty {
  HARD = 0,
  MEDIUM = 1,
  EASY = 2,
  AGAIN = 3,
}
```

**After**:
```typescript
export const DifficultyLevels = {
  HARD: 0,
  MEDIUM: 1,
  EASY: 2,
  AGAIN: 3,
} as const;

export type Difficulty = typeof DifficultyLevels[keyof typeof DifficultyLevels];
```

This approach works better with Server Actions and provides the same type safety.

## Usage Examples

### In Client Components

```typescript
'use client';
import { getReviewDeck, updateWordReview } from '@/app/_services/srs';
import { DifficultyLevels } from '@/app/_services/srs-types';

export default function LearnPage() {
  const loadWords = async () => {
    // Directly call server function - no fetch needed!
    const data = await getReviewDeck(20);
    setWords(data.words);
  };

  const handleReview = async (wordId: string) => {
    // Update review directly
    await updateWordReview(wordId, DifficultyLevels.EASY);
  };

  // ...
}
```

### Type Safety

```typescript
import type { Difficulty } from '@/app/_services/srs-types';

// This function only accepts valid difficulty values
function handleReview(userWordId: string, difficulty: Difficulty) {
  // difficulty can only be 0, 1, 2, or 3
}
```

## Benefits of These Changes

1. ✅ **No More Server Action Errors** - All exports are properly async
2. ✅ **Better Performance** - Direct server execution without HTTP overhead
3. ✅ **Cleaner Code** - No need for fetch, headers, JSON parsing
4. ✅ **Type Safety** - Full TypeScript support end-to-end
5. ✅ **Automatic Auth** - Authentication handled automatically in server functions
6. ✅ **Less Code** - Eliminated API route boilerplate

## API Routes Still Available

The API routes (`/api/review`, `/api/review/stats`) are still available if needed for:
- External integrations
- Webhooks
- Non-Next.js clients

They now internally use the same server functions for consistency.

## Migration Complete! 🎉

Your SRS system now:
- Uses server functions by default (faster, more efficient)
- Has no linting or type errors
- Follows Next.js 14+ best practices
- Is production-ready

Run the database migration and start reviewing words!

