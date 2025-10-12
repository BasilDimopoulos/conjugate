# 🔑 RapidAPI Setup for YouTube Audio Download

## Why RapidAPI?

**Free services (cobalt, yt1s, loader.to):**
- ❌ Unreliable (APIs change frequently)
- ❌ Rate limited
- ❌ Often blocked or down
- ❌ No support

**RapidAPI:**
- ✅ Reliable and stable
- ✅ Free tier available (500 requests/month)
- ✅ Professional service
- ✅ Multiple fallback APIs
- ✅ Support available

---

## 📝 How to Get RapidAPI Key (5 minutes)

### Step 1: Sign Up

**Visit:** https://rapidapi.com/

**Click:** "Sign Up" (top right)

**Options:**
- Sign up with Google
- Sign up with GitHub
- Sign up with email

**Choose** any option → **Free!**

---

### Step 2: Subscribe to YouTube Downloader API

**IMPORTANT:** Subscribe to this specific API:

**Visit:** https://rapidapi.com/ytjar/api/youtube-mp36

**Click:** "Subscribe to Test" button (or "Pricing" tab)

**Select:** "Basic" plan (FREE)
- ✅ 500 requests/month
- ✅ $0/month
- ✅ Perfect for personal use
- ✅ No credit card required

**Click:** "Subscribe"

**⚠️ Make sure you subscribe to the API!** The 403 error means you haven't subscribed yet.

---

### Step 3: Get Your API Key

**On the API page:**
1. Look for "Code Snippets" section
2. You'll see your API key in the headers:
   ```
   'x-rapidapi-key': 'YOUR-KEY-HERE-xxxxxxxxxxxxx'
   ```
3. **Copy this key!**

---

### Step 4: Add to `.env`

**Open:** `C:\Users\TechFast Australia\dev\conjugate\.env`

**Add this line:**
```env
RAPIDAPI_KEY=your-key-from-step-3
```

**Example:**
```env
# Existing keys
YOUTUBE_API_KEY=AIzaSy...
OPENAI_KEY=sk-...
ELEVENLABS_API_KEY=...

# NEW: RapidAPI for YouTube audio
RAPIDAPI_KEY=1234567890abcdefxxxxxxxxxxxxxx
```

---

### Step 5: Restart Server

```bash
# Stop server (Ctrl+C)
# Start server
npm run dev
```

---

## ✅ Test It!

### Try the YouTube feature:

1. **Go to:** Add Content → 📺 YouTube
2. **Paste:** https://www.youtube.com/watch?v=M-obwHFLGSs
3. **Select:** Greek
4. **Click:** "Create Book from Video"
5. **Watch the logs:**
   ```
   Fetching audio download URL from RapidAPI...
   Audio URL obtained from RapidAPI
   Audio downloaded: 8234567 bytes
   Transcribing with OpenAI Whisper...
   Transcription complete: ...
   Audio uploaded to S3: https://...
   YouTube book created!
   ```

---

## 💰 Free Tier Details:

### RapidAPI Basic Plan:
- **Cost:** $0/month
- **Requests:** 500/month
- **= 500 YouTube videos per month**
- **~16 videos per day**

### If You Need More:
- **Pro Plan:** $9.99/month
- **Requests:** 10,000/month
- **= 333 videos per day**

### For Most Users:
**Free tier is plenty!** 📚

---

## 🎯 Alternative: Use Captions (No API Key)

If you don't want to use RapidAPI, I can switch back to using YouTube's automatic captions instead of downloading audio. 

**Pros:**
- ✅ No extra API key needed
- ✅ Faster processing
- ✅ Free

**Cons:**
- ❌ Only works if video has captions
- ❌ No original audio in book
- ❌ Less reliable

**Let me know if you want this alternative!**

---

## 🔧 Current Setup Requirements:

```env
# Required for YouTube feature:
YOUTUBE_API_KEY=...        # Free (10k/day)
RAPIDAPI_KEY=...           # Free tier (500/month)
OPENAI_KEY=...             # For Whisper transcription
```

---

## 📊 Comparison:

### Free Services (cobalt, yt1s, etc.):
```
✅ No API key
❌ Unreliable
❌ Often broken
❌ No support
```

### RapidAPI:
```
✅ Reliable
✅ Stable API
✅ Free tier (500/mo)
✅ Professional
❌ Requires API key
```

---

## 🚀 Once Set Up:

**You can:**
- Create 500 YouTube books/month (free!)
- Original audio + AI transcript
- Works with any public video
- Reliable and fast

**Perfect for:**
- Music videos (learn lyrics!)
- Podcasts (read instead of listen)
- Lectures (study material)
- Interviews (learn conversations)

---

## 💡 Quick Links:

**Sign up:** https://rapidapi.com/

**YouTube Downloader API:** https://rapidapi.com/ytjar/api/youtube-mp3-downloader2

**After setup, just paste YouTube URLs and create books!** 📺→📖✨

