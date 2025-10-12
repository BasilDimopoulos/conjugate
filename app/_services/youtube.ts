'use server';
import OpenAI, { toFile } from 'openai';
import { parseDuration, getLanguageCode } from './youtube-utils';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export interface YouTubeVideoData {
  videoId: string;
  title: string;
  description: string;
  duration: number;
  thumbnail: string;
  channel: string;
}

/**
 * Get YouTube video metadata using YouTube Data API
 */
export const getYouTubeMetadata = async (videoId: string): Promise<YouTubeVideoData | null> => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  
  if (!apiKey) {
    console.error('YOUTUBE_API_KEY not set');
    return null;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,contentDetails`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      console.error('YouTube API error:', response.statusText);
      return null;
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      console.error('Video not found');
      return null;
    }

    const video = data.items[0];
    const snippet = video.snippet;
    const contentDetails = video.contentDetails;

    // Parse ISO 8601 duration (PT1H2M3S)
    const duration = parseDuration(contentDetails.duration);

    return {
      videoId,
      title: snippet.title,
      description: snippet.description,
      duration,
      thumbnail: snippet.thumbnails.high.url,
      channel: snippet.channelTitle,
    };
  } catch (error) {
    console.error('Error fetching YouTube metadata:', error);
    return null;
  }
};

/**
 * Download YouTube audio and transcribe using OpenAI Whisper
 * Returns both the audio buffer and transcript
 */
export const downloadAndTranscribeYouTube = async (
  videoId: string,
  language?: string
): Promise<{ audioBuffer: Buffer; transcript: string } | null> => {
  try {
    console.log(`Downloading and transcribing YouTube video: ${videoId}`);

    // Get audio download URL
    const audioUrl = await getYouTubeAudioUrl(videoId);
    
    if (!audioUrl) {
      console.error('Failed to get audio URL');
      return null;
    }

    console.log('Audio URL obtained, downloading...');

    // Download the audio file
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      console.error('Failed to download audio');
      return null;
    }

    const audioArrayBuffer = await audioResponse.arrayBuffer();
    const audioBuffer = Buffer.from(audioArrayBuffer);
    
    console.log(`Audio downloaded: ${audioBuffer.length} bytes`);

    // Convert language name to ISO-639-1 code (e.g., 'greek' → 'el')
    const languageCode = language ? getLanguageCode(language) : undefined;
    console.log(`Language: ${language} → ISO-639-1 code: ${languageCode || 'auto-detect'}`);

    console.log('Transcribing with OpenAI Whisper...');

    // For Node.js, we need to use the toFile method or pass the buffer with proper metadata
    // Create a proper file-like object that OpenAI SDK can handle
    const audioFile = await toFile(audioBuffer, `${videoId}.mp3`, { type: 'audio/mpeg' });

    // Transcribe using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: languageCode,  // Use ISO-639-1 code, not full name
      response_format: 'text',
    });

    console.log(`Transcription complete: ${transcription.substring(0, 100)}...`);
    
    return {
      audioBuffer,
      transcript: transcription,
    };

  } catch (error) {
    console.error('Error downloading/transcribing video:', error);
    return null;
  }
};

/**
 * Get YouTube audio download URL using RapidAPI
 * Tries multiple APIs for reliability
 */
const getYouTubeAudioUrl = async (videoId: string): Promise<string | null> => {
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  
  if (!rapidApiKey) {
    console.error('RAPIDAPI_KEY not set in environment variables');
    throw new Error('RAPIDAPI_KEY not configured. Please add it to your .env file. Get free key at https://rapidapi.com/');
  }

  // Try multiple RapidAPI services for reliability
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const services = [
    {
      name: 'YouTube MP3 Converter',
      url: `https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`,
      host: 'youtube-mp36.p.rapidapi.com',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      extractUrl: (data: any) => data.link
    },
    {
      name: 'YouTube Media Downloader',
      url: `https://youtube-media-downloader.p.rapidapi.com/v2/video/details?videoId=${videoId}`,
      host: 'youtube-media-downloader.p.rapidapi.com',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      extractUrl: (data: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const audioFormats = data.videos?.items?.filter((item: any) => 
          item.type === 'audio' || (item.format && item.format.includes('audio'))
        );
        return audioFormats?.[0]?.url;
      }
    },
    {
      name: 'Social Media Video Downloader',
      url: 'https://social-media-video-downloader.p.rapidapi.com/smvd/get/all',
      host: 'social-media-video-downloader.p.rapidapi.com',
      method: 'POST',
      body: { url: `https://www.youtube.com/watch?v=${videoId}` },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      extractUrl: (data: any) => data.links?.find((l: any) => l.quality === 'audio')?.link
    }
  ];

  for (const service of services) {
    try {
      console.log(`Trying ${service.name}...`);
      
      const options: RequestInit = {
        method: service.method || 'GET',
        headers: {
          'x-rapidapi-key': rapidApiKey,
          'x-rapidapi-host': service.host,
          'Content-Type': 'application/json',
        },
      };

      if (service.body) {
        options.body = JSON.stringify(service.body);
      }

      const response = await fetch(service.url, options);

      if (!response.ok) {
        console.log(`${service.name} returned ${response.status} - trying next...`);
        continue;
      }

      const data = await response.json();
      console.log(`${service.name} response:`, JSON.stringify(data, null, 2));
      
      const audioUrl = service.extractUrl(data);
      
      if (audioUrl) {
        console.log(`✅ Audio URL obtained from ${service.name}: ${audioUrl}`);
        return audioUrl;
      }

      console.log(`${service.name} - no audio URL in response`);
    } catch (error) {
      console.log(`${service.name} failed:`, error);
    }
  }

  // If all RapidAPI services fail, provide helpful error
  console.error('All RapidAPI services failed');
  throw new Error(
    'Could not download audio from YouTube. Please ensure:\n' +
    '1. You have subscribed to the YouTube MP3 API on RapidAPI\n' +
    '2. Your RAPIDAPI_KEY is correct in .env file\n' +
    '3. The video is public and not age-restricted\n\n' +
    'Subscribe here (FREE): https://rapidapi.com/ytjar/api/youtube-mp36\n' +
    'See YOUTUBE_403_FIX.md for detailed instructions.'
  );
};


