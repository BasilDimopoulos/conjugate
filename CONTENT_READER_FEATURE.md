# 📖 Interactive Content Reader Feature

## Overview

A powerful new feature that allows users to learn from authentic content in their target language. Paste any text, and the system will:

1. 🎧 Generate native pronunciation audio (via ElevenLabs)
2. 📊 Show which words you already know (purple background)
3. ➕ Click unknown words to add them to your flashcard deck
4. 📚 Display text in an ebook-like, interactive format

## How It Works

### User Flow

1. **Navigate to Add Content**
   - From the learn page, click the "Add Content" button
   - Available when reviewing is complete or when no reviews are due

2. **Paste & Process**
   - Select your target language
   - Paste any text (article, story, dialogue, etc.)
   - Click "Process Text"

3. **Interactive Reading**
   - Words highlight on hover
   - Purple background = already in your deck
   - No background = new word (click to add)
   - Audio player to hear native pronunciation

4. **Build Your Deck**
   - Click any unknown word to add it to your SRS deck
   - Words automatically scheduled for review
   - Visual feedback confirms addition

## Features Implemented

### 1. Add Content Button
**Location:** Learn page (`/learn`)

- Appears after completing reviews
- Appears when no reviews are due
- Blue button with book icon
- Navigates to `/learn/add-content`

### 2. Content Creation Page
**Location:** `/learn/add-content`

**Features:**
- Language selector (Chinese, Japanese, Korean, Greek, Spanish, French)
- Large textarea for pasting content
- Processing indicator
- Back button to return to learning

### 3. Interactive Text Display

**Visual Indicators:**
- **No background**: Word not in deck → Click to add
- **Purple background** (`bg-purple-600/30`): Word already in deck
- **Hover effects**: Unknown words scale up slightly
- **Responsive**: Works on desktop and mobile

**Word Processing:**
- Character-based for CJK languages (Chinese, Japanese, Korean)
- Word-based for European languages (Greek, Spanish, French)
- Punctuation preserved but not added to deck
- Handles mixed punctuation styles

### 4. Audio Generation
**Technology:** ElevenLabs API

**Features:**
- Multi-language support
- High-quality neural TTS
- Native pronunciation
- Plays back directly in browser

**Voices by Language:**
- Chinese: Rachel (21m00Tcm4TlvDq8ikWAM)
- Japanese: Domi (AZnzlk1XvdvUeBnXmlld)
- Korean: Bella (EXAVITQu4vr4xnSDxMaL)
- Greek: Rachel (21m00Tcm4TlvDq8ikWAM)
- Spanish: Antoni (ErXwobaYiN019PkySvjV)
- French: Elli (MF3mGyEYCl7XYWbV9V6O)

### 5. Server Functions

#### `checkWordsInDeck(words, userId)`
- Checks which words from a list are in user's deck
- Returns boolean array matching input
- Efficient batch checking

#### `addWordFromContent(userId, word, language)`
- Adds word to user's SRS deck
- Sets initial SRS values (level 1, interval 1 day)
- Adds to Redis for quick lookup
- Prevents duplicates

#### `getTextStats(words, userId)`
- Calculates comprehension statistics
- Returns: total, known, unknown, percentage

## Files Created/Modified

### Created Files:
```
app/(dashboard)/learn/add-content/page.tsx  - Main content reader page
app/_services/content.ts                    - Server functions for content
app/api/generate-audio/route.ts            - ElevenLabs audio generation
CONTENT_READER_FEATURE.md                  - This documentation
```

### Modified Files:
```
app/(dashboard)/learn/page.tsx              - Added "Add Content" button
```

## Setup Requirements

### Environment Variables

Add to your `.env` file:

```bash
# ElevenLabs API (for audio generation)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM  # Optional: default voice
```

### Getting an ElevenLabs API Key

1. Sign up at [https://elevenlabs.io](https://elevenlabs.io)
2. Navigate to Profile Settings → API Keys
3. Create a new API key
4. Add to your `.env` file

**Free Tier:**
- 10,000 characters/month
- Perfect for testing and light use

## Usage Examples

### Example 1: Learning from News Article

```
1. Copy a paragraph from a Chinese news article
2. Paste into the content reader
3. System shows: "You know 45 out of 120 words (38%)"
4. Click unknown words to add to deck
5. Listen to audio to hear correct pronunciation
6. Return to learning and review new words
```

### Example 2: Children's Story

```
1. Paste a short story in Japanese
2. Most words show no background (new vocabulary)
3. Click through story, adding words as you go
4. Play audio to hear story narrated
5. New words scheduled for SRS review
```

### Example 3: Song Lyrics

```
1. Paste song lyrics in Korean
2. See which words you already know
3. Add new vocabulary from the song
4. Use audio to practice pronunciation
5. Learn language through music!
```

## Technical Details

### Word Segmentation

**CJK Languages (Chinese, Japanese, Korean):**
- Character-by-character splitting
- Each character is clickable
- Preserves compound words

**European Languages (Greek, Spanish, French):**
- Space-delimited word splitting
- Whole words are clickable
- Handles contractions and hyphens

### Punctuation Handling

```typescript
// Cleaned for database lookup
cleanWord = word.replace(/[.,!?;:"""''。，！？；：、]/g, '')

// Preserved for display
displayWord = "你好，" // Keeps comma
```

### SRS Integration

When a word is added from content:
```javascript
{
  level: 1,                  // Beginner level
  repetitions: 0,            // First exposure
  easeFactor: 2.5,          // Standard difficulty
  interval: 1,               // Review in 1 day
  nextReviewTime: tomorrow,  // Scheduled
}
```

## UI/UX Design

### Color Scheme
- **Unknown words**: Transparent background, white border on hover
- **Known words**: `bg-purple-600/30` with `border-purple-500/50`
- **Hover effects**: Scale 1.05, lighter background
- **Audio button**: Blue (`bg-blue-600`)
- **Process button**: Purple (`bg-purple-600`)

### Responsive Design
- Mobile-friendly text wrapping
- Touch-friendly click targets
- Responsive padding and spacing
- Works on all screen sizes

### Accessibility
- Clear visual indicators
- Hover tooltips
- Keyboard navigation support
- High contrast colors

## Performance Considerations

### Optimizations:
1. **Batch word checking**: Single database query for all words
2. **Client-side state**: Immediate visual feedback
3. **Data URLs for audio**: No additional HTTP requests
4. **Efficient rendering**: React memo for word components

### Limitations:
1. **Text length**: Recommended max 500-1000 words for performance
2. **Audio size**: Large texts = larger audio files
3. **API rate limits**: ElevenLabs free tier has limits

## Future Enhancements

### Potential Features:
- [ ] Save reading history
- [ ] Export word lists
- [ ] Difficulty analysis (HSK levels, JLPT levels, etc.)
- [ ] Built-in dictionary lookup
- [ ] Sentence analysis and grammar tips
- [ ] Import from URLs/PDFs
- [ ] Highlight sentences containing target words
- [ ] Reading statistics and progress tracking
- [ ] Multiple voices per language
- [ ] Audio speed control
- [ ] Text-to-speech with highlights (karaoke mode)

## Testing

### Manual Testing Checklist:

- [ ] Can navigate to /learn/add-content
- [ ] Can select language
- [ ] Can paste text
- [ ] Process button works
- [ ] Words display correctly
- [ ] Known words show purple background
- [ ] Unknown words are clickable
- [ ] Clicking word adds to deck
- [ ] Purple background appears after adding
- [ ] Audio generates successfully
- [ ] Audio plays correctly
- [ ] Can return to learn page
- [ ] New words appear in review deck

### Test Cases:

**Test 1: Chinese Text**
```
Input: "我喜欢学习中文。"
Expected: 7 clickable characters
```

**Test 2: Greek Text**
```
Input: "Γεια σου, πώς είσαι;"
Expected: 4 clickable words (punctuation excluded)
```

**Test 3: Already Known Words**
```
Pre-condition: User has "你好" in deck
Input: "你好，朋友！"
Expected: "你" and "好" show purple background
```

## Troubleshooting

### Issue: Audio not generating
**Solution:** Check ELEVENLABS_API_KEY is set in .env

### Issue: Words not showing as known
**Solution:** Run Prisma migration to ensure UsersWord table is updated

### Issue: Can't click words
**Solution:** Check that userId is properly set (user logged in)

### Issue: Punctuation being added to deck
**Solution:** Check cleanWord regex in content.ts

## Success! 🎉

This feature transforms passive reading into active vocabulary building. Users can now learn from:
- News articles
- Blog posts
- Social media
- Song lyrics
- Movie subtitles
- Books and stories
- Any text content!

The combination of visual feedback, audio pronunciation, and SRS integration makes this a powerful language learning tool.

