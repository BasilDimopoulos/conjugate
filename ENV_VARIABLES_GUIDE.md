# Environment Variables Guide

## Required Environment Variables

### Database
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

### Authentication (Clerk)
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### AI Services

#### OpenAI (Required for word generation)
```bash
OPENAI_KEY=sk-...
```

#### ElevenLabs (Required for audio generation in content reader)
```bash
# Main API Key
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Language-specific Voice IDs (Optional - defaults provided)
CHINESE_ELEVEN_LABS_ID=21m00Tcm4TlvDq8ikWAM
JAPANESE_ELEVEN_LABS_ID=AZnzlk1XvdvUeBnXmlld
KOREAN_ELEVEN_LABS_ID=EXAVITQu4vr4xnSDxMaL
GREEK_ELEVEN_LABS_ID=21m00Tcm4TlvDq8ikWAM
SPANISH_ELEVEN_LABS_ID=ErXwobaYiN019PkySvjV
FRENCH_ELEVEN_LABS_ID=MF3mGyEYCl7XYWbV9V6O
RUSSIAN_ELEVEN_LABS_ID=21m00Tcm4TlvDq8ikWAM
```

#### Leonardo AI (For image generation)
```bash
LEONARDO_API_KEY=your_leonardo_api_key
```

### AWS S3 (For file storage)
```bash
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-bucket-name
```

### Redis (For caching and word sets)
```bash
REDIS_URL=redis://localhost:6379
```

### Neo4j (For word relationships)
```bash
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password
```

## ElevenLabs Voice Configuration

### Default Voices

The system comes with pre-configured default voices for each language:

| Language | Default Voice ID | Character |
|----------|------------------|-----------|
| Chinese  | 21m00Tcm4TlvDq8ikWAM | Rachel (neutral, clear) |
| Japanese | AZnzlk1XvdvUeBnXmlld | Domi (warm, expressive) |
| Korean   | EXAVITQu4vr4xnSDxMaL | Bella (professional) |
| Greek    | 21m00Tcm4TlvDq8ikWAM | Rachel (clear) |
| Spanish  | ErXwobaYiN019PkySvjV | Antoni (native) |
| French   | MF3mGyEYCl7XYWbV9V6O | Elli (native) |
| Russian  | 21m00Tcm4TlvDq8ikWAM | Rachel (clear) |

### Custom Voice Configuration

To use custom voices for specific languages:

1. **Find Your Voice ID:**
   - Go to [ElevenLabs Voice Lab](https://elevenlabs.io/voice-lab)
   - Select or create a voice
   - Copy the Voice ID from the URL or voice details

2. **Add to Environment:**
   ```bash
   # Example: Custom Greek voice
   GREEK_ELEVEN_LABS_ID=your_custom_voice_id_here
   ```

3. **Restart Server:**
   ```bash
   npm run dev
   ```

### Voice Selection Priority

The system selects voices in this order:
1. Language-specific environment variable (e.g., `GREEK_ELEVEN_LABS_ID`)
2. Default voice for that language
3. Rachel as fallback

## Setup Instructions

### 1. Create `.env` file

In your project root:

```bash
touch .env
```

### 2. Add Required Variables

**Minimum Required:**
```bash
DATABASE_URL="your_database_url"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
OPENAI_KEY=sk-...
ELEVENLABS_API_KEY=your_key_here
```

### 3. Optional: Add Custom Voices

Only add if you want different voices than defaults:

```bash
# Only add the languages you want to customize
GREEK_ELEVEN_LABS_ID=custom_voice_id
CHINESE_ELEVEN_LABS_ID=custom_voice_id
```

### 4. Restart Development Server

```bash
npm run dev
```

## Getting API Keys

### ElevenLabs
1. Visit [https://elevenlabs.io](https://elevenlabs.io)
2. Sign up (free tier: 10,000 characters/month)
3. Go to Profile → API Keys
4. Create new API key
5. Copy to `.env`

### Clerk (Authentication)
1. Visit [https://clerk.com](https://clerk.com)
2. Create new application
3. Copy keys from Dashboard → API Keys

### OpenAI
1. Visit [https://platform.openai.com](https://platform.openai.com)
2. Go to API Keys section
3. Create new secret key
4. Copy to `.env`

### Leonardo AI
1. Visit [https://leonardo.ai](https://leonardo.ai)
2. Sign up and get API access
3. Copy API key to `.env`

## Security Best Practices

### ✅ DO:
- Keep `.env` file local (never commit)
- Use different keys for dev/production
- Rotate keys regularly
- Use environment-specific keys
- Monitor API usage

### ❌ DON'T:
- Commit `.env` to version control
- Share keys publicly
- Use production keys in development
- Hard-code keys in source files
- Leave unused keys active

## Troubleshooting

### "Audio generation service not configured"
**Problem:** `ELEVENLABS_API_KEY` not set

**Solution:**
```bash
# Add to .env
ELEVENLABS_API_KEY=your_key_here

# Restart server
npm run dev
```

### "Invalid voice ID"
**Problem:** Custom voice ID is incorrect

**Solution:**
1. Check voice ID in ElevenLabs dashboard
2. Ensure no extra spaces in `.env`
3. Remove custom ID to use default
4. Restart server

### Language not detected
**Problem:** `mostRecentSkill` not set for user

**Solution:**
1. User needs to select language in onboarding
2. Or manually set in database
3. System will default to Chinese if not set

### Environment variables not loading
**Problem:** Changes to `.env` not taking effect

**Solution:**
1. Stop the server (Ctrl+C)
2. Restart: `npm run dev`
3. Clear Next.js cache: `rm -rf .next`
4. Check file is named exactly `.env`

## Example Complete .env File

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/conjugate"

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# AI Services
OPENAI_KEY=sk-...
ELEVENLABS_API_KEY=sk_...
LEONARDO_API_KEY=...

# ElevenLabs Custom Voices (optional)
GREEK_ELEVEN_LABS_ID=custom_voice_id
CHINESE_ELEVEN_LABS_ID=custom_voice_id

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_BUCKET_NAME=conjugate-media

# Redis
REDIS_URL=redis://localhost:6379

# Neo4j
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password
```

## Deployment

### Vercel/Railway/etc.

Add environment variables in your hosting platform's dashboard:

1. Go to Project Settings → Environment Variables
2. Add each variable from your `.env`
3. Deploy/redeploy

### Production Considerations

- Use production-grade API keys
- Enable API key restrictions
- Set up monitoring for usage
- Configure rate limiting
- Use secrets management service

## Support

If you need help with environment variables:
1. Check this guide
2. Verify all required keys are set
3. Ensure no typos in variable names
4. Restart server after changes
5. Check API provider dashboards for issues

