# 🚀 Content Reader Setup Guide

## Quick Setup (5 minutes)

### Step 1: Get ElevenLabs API Key

1. Visit [https://elevenlabs.io](https://elevenlabs.io)
2. Sign up for a free account
3. Go to **Profile Settings** → **API Keys**
4. Click "Create API Key"
5. Copy your API key

### Step 2: Add to Environment Variables

Add this to your `.env` file:

```bash
# ElevenLabs API for audio generation (Required)
ELEVENLABS_API_KEY=your_api_key_here

# Optional: Custom voice IDs for each language
# (If not provided, sensible defaults are used)
CHINESE_ELEVEN_LABS_ID=21m00Tcm4TlvDq8ikWAM
JAPANESE_ELEVEN_LABS_ID=AZnzlk1XvdvUeBnXmlld
KOREAN_ELEVEN_LABS_ID=EXAVITQu4vr4xnSDxMaL
GREEK_ELEVEN_LABS_ID=21m00Tcm4TlvDq8ikWAM
SPANISH_ELEVEN_LABS_ID=ErXwobaYiN019PkySvjV
FRENCH_ELEVEN_LABS_ID=MF3mGyEYCl7XYWbV9V6O
RUSSIAN_ELEVEN_LABS_ID=21m00Tcm4TlvDq8ikWAM
```

### Step 3: Start Using!

```bash
npm run dev
```

Navigate to: `http://localhost:3000/learn` → Click "Add Content"

## That's It! 🎉

The content reader is now ready to use. Paste any text and start learning!

---

## Optional: Custom Voice Configuration

The system comes with sensible default voices, but you can customize them!

### Default Voices:

- **Chinese**: Rachel (neutral, clear)
- **Japanese**: Domi (warm, expressive)
- **Korean**: Bella (professional, native-like)
- **Greek**: Rachel (clear, articulate)
- **Spanish**: Antoni (native Spanish speaker)
- **French**: Elli (native French speaker)
- **Russian**: Rachel (clear, articulate)

### Using Custom Voices:

**Step 1:** Find your voice ID in [ElevenLabs Voice Lab](https://elevenlabs.io/voice-lab)

**Step 2:** Add to `.env`:
```bash
# Only add the languages you want to customize
GREEK_ELEVEN_LABS_ID=your_custom_voice_id
CHINESE_ELEVEN_LABS_ID=your_custom_voice_id
```

**Step 3:** Restart server:
```bash
npm run dev
```

**That's it!** Your custom voices will now be used automatically.

---

## ElevenLabs Free Tier

- **10,000 characters/month** free
- Perfect for learning with articles and stories
- About 20-30 medium articles worth of audio
- Upgrade for more if needed

---

## Troubleshooting

### "Audio generation service not configured"

**Problem:** ELEVENLABS_API_KEY not set

**Solution:**
```bash
# Add to .env
ELEVENLABS_API_KEY=your_key_here

# Restart server
npm run dev
```

### "Failed to generate audio"

**Possible causes:**
1. Invalid API key → Check key in .env
2. API rate limit reached → Wait or upgrade plan
3. Network issues → Check internet connection

**Check your API usage:**
Visit [https://elevenlabs.io/app/usage](https://elevenlabs.io/app/usage)

### Words not showing as known

**Problem:** Database not migrated

**Solution:**
```bash
npm run migrate-srs.bat
# or
npx prisma migrate dev
npx prisma generate
```

---

## Testing Your Setup

### Test 1: Basic Setup
```
1. Go to /learn/add-content
2. Select "Chinese"
3. Paste: 你好世界
4. Click "Process Text"
```

**Expected Result:**
- 4 clickable characters appear
- Audio player shows at top
- Can click to play audio

### Test 2: Word Addition
```
1. Process some text
2. Click an unknown word
3. Word should get purple background
4. Go to /learn
5. Word should appear in review deck
```

### Test 3: Known Words
```
1. Add a word to your deck
2. Paste text containing that word
3. Process text
```

**Expected Result:**
- Previously added word shows purple background
- Can't click it again (already in deck)

---

## Feature Overview

### What You Can Do:

✅ Paste any text in 6 languages  
✅ Hear native pronunciation  
✅ See which words you know  
✅ Click to add new words to deck  
✅ Words automatically scheduled for SRS review  
✅ Beautiful, interactive reading experience  

### Supported Languages:

- 🇨🇳 Chinese (Simplified/Traditional)
- 🇯🇵 Japanese (Hiragana/Katakana/Kanji)
- 🇰🇷 Korean (Hangul)
- 🇬🇷 Greek
- 🇪🇸 Spanish
- 🇫🇷 French
- 🇷🇺 Russian

**Auto-Detection:** The system automatically selects the language you're currently learning!

---

## Usage Tips

### Best Practices:

1. **Start with short texts** (100-200 words)
2. **Use authentic content** (news, blogs, social media)
3. **Listen first** before adding words
4. **Add words in context** for better memory
5. **Review regularly** for optimal retention

### Content Sources:

**Chinese:**
- 人民日报 (People's Daily)
- 微博 (Weibo posts)
- 知乎 (Zhihu articles)

**Japanese:**
- NHK Easy News
- Twitter/X threads
- Manga dialogue

**Korean:**
- Naver News
- Daum articles
- K-drama subtitles

**Greek:**
- Καθημερινή (newspaper)
- Greek Wikipedia
- Blog posts

**Spanish:**
- El País
- BBC Mundo
- News articles

**French:**
- Le Monde
- Le Figaro
- Blog articles

---

## Next Steps

After setup, check out:

1. **CONTENT_READER_FEATURE.md** - Detailed feature documentation
2. **SRS_SYSTEM_README.md** - How the review system works
3. **QUICK_START.md** - General app usage

---

## Support

### Common Questions:

**Q: How much does this cost?**
A: Free tier is 10,000 characters/month. More than enough for learning!

**Q: Can I use my own TTS service?**
A: Yes! Modify `/app/api/generate-audio/route.ts` to use any TTS API.

**Q: Does audio save/cache?**
A: Currently generates on-demand. Future versions may cache audio.

**Q: Can I import PDFs?**
A: Not yet, but it's on the roadmap! For now, copy/paste text.

**Q: What about other languages?**
A: Easy to add! Just update language selector and voice mapping.

---

## You're Ready! 🎉

Start learning from authentic content in your target language!

```bash
npm run dev
# Navigate to /learn → Add Content
```

Happy learning! 📚✨

