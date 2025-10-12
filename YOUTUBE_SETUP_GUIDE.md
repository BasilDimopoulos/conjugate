# 📺 YouTube Analyzer - Quick Setup Guide

## 🎯 Get Started in 3 Steps!

---

## Step 1: Get YouTube API Key (5 minutes)

### Visit Google Cloud Console:
```
https://console.cloud.google.com/
```

### Create or Select Project:
1. Click "Select a project" (top bar)
2. Click "New Project"
3. Name it: "Conjugate YouTube API"
4. Click "Create"

### Enable YouTube Data API:
1. Go to "APIs & Services" → "Enable APIs and Services"
2. Search: "YouTube Data API v3"
3. Click on it
4. Click "Enable"

### Create API Key:
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the key (looks like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXX`)

### Restrict Key (Recommended):
1. Click "Edit API key"
2. Under "API restrictions":
   - Select "Restrict key"
   - Check only "YouTube Data API v3"
3. Save

---

## Step 2: Add to Environment Variables

### Open your `.env` file:
```
C:\Users\TechFast Australia\dev\conjugate\.env
```

### Add this line:
```env
YOUTUBE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXX
```

Replace with your actual key from Step 1.

### Your .env should now have:
```env
# Existing keys
OPENAI_KEY=...
ELEVENLABS_API_KEY=...
GREEK_ELEVEN_LABS_ID=...

# NEW: YouTube API
YOUTUBE_API_KEY=AIzaSy...
```

---

## Step 3: Restart Server

### Stop server:
```
Press Ctrl+C in terminal
```

### Start server:
```
npm run dev
```

Wait for: "Ready in X seconds"

---

## ✅ Test It Out!

### 1. Navigate:
```
Learn → Add Content → Click "📺 YouTube" tab
```

### 2. Paste a video URL:
```
Try this Greek music video:
https://www.youtube.com/watch?v=dQw4w9WgXcQ

Or any video with captions!
```

### 3. Select Language:
```
Choose: Greek (or video's language)
```

### 4. Create Book:
```
Click: "📺 Create Book from Video"
Wait ~5 seconds
```

### 5. Read & Learn:
```
- Book opens with video transcript
- Click words → Learn vocabulary!
- Video thumbnail as cover
- All interactive features work!
```

---

## 🎓 Recommended Test Videos:

### Greek:
```
Search YouTube: "Greek music with lyrics"
Look for: 🎵 icon (means has captions)
```

### Chinese:
```
Search: "Chinese news" or "中文新闻"
Most news videos have captions
```

### Japanese:
```
Search: "Japanese lesson" or "日本語"
Educational content usually has captions
```

---

## 🔍 How to Check if Video Has Captions:

### On YouTube:
1. Open video
2. Look for "CC" button in player
3. If available → Video works! ✅
4. If not → Try another video ❌

### Tips:
- **News videos** → Usually have captions
- **Educational** → Often have captions
- **Music with lyrics** → Sometimes have captions
- **Official channels** → More likely to have captions

---

## 💡 Quota Information:

### Free Tier (YouTube API):
- **10,000 units per day**
- **1 unit per video lookup**
- **= 10,000 videos per day!**

### If You Exceed Quota:
- Wait until next day (resets at midnight PST)
- Or upgrade to paid tier (very cheap)
- Most users never hit this limit!

---

## ❓ Troubleshooting:

### "YOUTUBE_API_KEY not set"
**Fix:** Make sure you added it to `.env` and restarted server

### "Video not found"
**Fix:** Check URL is correct, video is public

### "Failed to get video transcript"
**Fix:** Video must have captions. Try: "CC" button on YouTube

### API Key not working:
**Check:**
1. Key copied correctly (no spaces)
2. YouTube Data API v3 enabled
3. Key not restricted to wrong API
4. Project billing enabled (free tier OK)

---

## ✅ You're Ready!

Once you've completed Steps 1-3, you can:

1. **Convert any captioned YouTube video** into a book
2. **Learn vocabulary** from real content
3. **Save to library** for later review
4. **Build flashcard deck** from video words
5. **Practice reading** at your own pace

**Turn YouTube into your language learning library!** 📺📚✨

---

## 🎯 Quick Reference:

```
Input: YouTube URL
↓
Process: Extract captions (3-5 seconds)
↓
Output: Interactive book
Features:
  ✅ Click words → Flashcards
  ✅ Select text → Translation
  ✅ Dark theme reader
  ✅ Mobile responsive
  ✅ Save to library
```

**Cost:** ~$0.0002 per video (basically free!)

**Happy learning from YouTube!** 🎓✨

