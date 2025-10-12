import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// ElevenLabs API configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// Voice IDs from environment variables
const LANGUAGE_VOICES: Record<string, string> = {
  chinese: process.env.CHINESE_ELEVEN_LABS_ID || '21m00Tcm4TlvDq8ikWAM',
  japanese: process.env.JAPANESE_ELEVEN_LABS_ID || 'AZnzlk1XvdvUeBnXmlld',
  korean: process.env.KOREAN_ELEVEN_LABS_ID || 'EXAVITQu4vr4xnSDxMaL',
  greek: process.env.GREEK_ELEVEN_LABS_ID || '21m00Tcm4TlvDq8ikWAM',
  spanish: process.env.SPANISH_ELEVEN_LABS_ID || 'ErXwobaYiN019PkySvjV',
  french: process.env.FRENCH_ELEVEN_LABS_ID || 'MF3mGyEYCl7XYWbV9V6O',
  russian: process.env.RUSSIAN_ELEVEN_LABS_ID || '21m00Tcm4TlvDq8ikWAM',
};

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!ELEVENLABS_API_KEY) {
      console.error('ElevenLabs API key not configured');
      return NextResponse.json(
        { error: 'Audio generation service not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { text, language = 'chinese' } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Select voice based on language
    const voiceId = LANGUAGE_VOICES[language] || LANGUAGE_VOICES.chinese;

    // Call ElevenLabs API to generate audio
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2', // Supports multiple languages
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('ElevenLabs API error:', error);
      return NextResponse.json(
        { error: 'Failed to generate audio' },
        { status: response.status }
      );
    }

    // Get audio buffer
    const audioBuffer = await response.arrayBuffer();
    
    // Convert to base64 for easy transmission
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

    // Alternatively, you could save to S3 and return the S3 URL
    // For now, we'll return the data URL

    return NextResponse.json({
      audioUrl,
      success: true,
    });

  } catch (error) {
    console.error('Error generating audio:', error);
    return NextResponse.json(
      { error: 'Failed to generate audio' },
      { status: 500 }
    );
  }
}

