# Quick Start Guide - SRS System

## ✅ All Issues Fixed!

The "Server Actions must be async functions" error has been resolved, and the system now uses **Server Functions** instead of API routes for better performance.

## 🚀 Get Started in 3 Steps

### Step 1: Run Database Migration

**On Windows:**
```bash
.\migrate-srs.bat
```

**Or manually:**
```bash
npx prisma migrate dev --name add_srs_fields
npx prisma generate
```

### Step 2: Start Your Application

```bash
npm run dev
```

### Step 3: Use the SRS System

1. Navigate to the **Learn** page at `/learn`
2. The system will automatically load words due for review
3. Rate each word: **Again** | **Hard** | **Medium** | **Easy**
4. Watch your progress and vocabulary grow!

## 📝 Key Changes from Original Implementation

### 1. Server Functions (Not API Routes)

**Before:**
```typescript
// Had to use fetch
const response = await fetch('/api/review');
const data = await response.json();
```

**Now:**
```typescript
// Direct function call - faster and simpler!
import { getReviewDeck } from '@/app/_services/srs';
const data = await getReviewDeck(20);
```

### 2. Fixed Server Actions Error

All exported functions in `srs.ts` are now properly async. Helper functions like `calculateSRS` are internal and don't need to be async. Types and constants are in a separate file.

### 3. Difficulty Levels

```typescript
import { DifficultyLevels } from '@/app/_services/srs-types';

// Use these constants:
DifficultyLevels.AGAIN  // 3 - Couldn't remember
DifficultyLevels.HARD   // 0 - Difficult
DifficultyLevels.MEDIUM // 1 - Normal
DifficultyLevels.EASY   // 2 - Easy to recall
```

## 🎯 How to Add Words to Review

Words are added to your review deck when you mark them as "New" in the flashcard interface. The system will then schedule them for review based on the SRS algorithm.

## 📊 Understanding the Algorithm

- **First Review**: 1 day after adding
- **Second Review**: 6 days after first review
- **Subsequent Reviews**: Interval based on your performance
  - Click **Easy** → Longer intervals (you know it well)
  - Click **Medium** → Standard progression
  - Click **Hard** → Shorter intervals (needs more practice)
  - Click **Again** → Starts over from day 1

## 🔧 Technical Details

### Server Functions Available

```typescript
// Get words due for review
const { words, count } = await getReviewDeck(limit);

// Update after reviewing a word
await updateWordReview(userWordId, difficulty);

// Get vocabulary statistics
const { total, dueCount, masteredCount, learning } = await getUserVocabStats();
```

### Authentication

All server functions automatically handle authentication using Clerk. You don't need to pass `userId` - it's extracted automatically from the session.

## 📁 Files Modified

- ✅ `app/_services/srs.ts` - Enhanced with server functions
- ✅ `app/(dashboard)/learn/page.tsx` - Now uses server functions directly
- ✅ `app/_components/flashcard.tsx` - Added ReviewFlashCardOptions
- ✅ `prisma/schema.prisma` - Enhanced UsersWord model
- ✅ `app/api/review/route.ts` - Updated (optional, for compatibility)
- ✅ `app/api/review/stats/route.ts` - Updated (optional, for compatibility)

## ❓ Common Questions

**Q: Do I need to use the API routes?**
A: No! The learn page uses server functions directly. API routes are there for compatibility if needed.

**Q: What happens if I haven't migrated the database yet?**
A: The app won't work until you run the Prisma migration. Run `.\migrate-srs.bat` first.

**Q: Can I customize the review intervals?**
A: Yes! Edit the `calculateSRS` function in `app/_services/srs.ts` to adjust the algorithm.

**Q: How do I see my progress?**
A: The learn page shows your stats at the top, and a completion screen appears after each session.

## 🎉 You're Ready!

Run the migration and start learning! The system will optimize your review schedule based on how well you remember each word.

For detailed documentation, see:
- `SRS_SYSTEM_README.md` - Complete system documentation
- `MIGRATION_FIXED.md` - Technical changes and fixes

Happy learning! 📚

