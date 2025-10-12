'use server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/utils/db';
import { extractVideoId } from './youtube-utils';
import { getYouTubeMetadata, downloadAndTranscribeYouTube } from './youtube';
import { analyzeTextContent } from './content';
import { chunkIntoPages } from './book-utils';
import uploadFileToS3 from './s3';
import { v4 as uuid } from 'uuid';

/**
 * Create a book from a YouTube video
 */
export const createBookFromYouTube = async (
  youtubeUrl: string,
  language: string
) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    console.log('Creating book from YouTube:', youtubeUrl);

    // 1. Extract video ID
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    // 2. Get video metadata
    const metadata = await getYouTubeMetadata(videoId);
    if (!metadata) {
      throw new Error('Failed to fetch video metadata');
    }

    console.log(`Video: "${metadata.title}" by ${metadata.channel}`);

    // 3. Download audio and get transcript
    const result = await downloadAndTranscribeYouTube(videoId, language);
    if (!result) {
      throw new Error('Failed to download and transcribe video audio.');
    }

    const { audioBuffer, transcript } = result;
    console.log(`Transcript extracted: ${transcript.length} characters`);
    console.log(`Audio downloaded: ${audioBuffer.length} bytes`);

    // 4. Upload audio to S3 for playback in the book
    const audioFileName = `youtube-${videoId}-${uuid()}.mp3`;
    const audioUrl = await uploadFileToS3(audioBuffer, audioFileName);
    console.log(`Audio uploaded to S3: ${audioUrl}`);

    // 5. Analyze content
    const analysis = await analyzeTextContent(transcript, language);

    // 6. Chunk into pages
    const pages = chunkIntoPages(
      transcript,
      language,
      [metadata.thumbnail], // Use video thumbnail as cover
      1100
    );

    console.log(`Created ${pages.length} pages`);

    // 7. Save to database
    const userContent = await prisma.userContent.create({
      data: {
        userId,
        title: metadata.title,
        text: transcript,
        language,
        summary: analysis?.summary || null,
        sentiment: analysis?.sentiment || null,
        topic: analysis?.topic || null,
        difficulty: analysis?.difficulty || null,
        audioUrl: audioUrl, // Use original YouTube audio!
        hasFullAudio: true, // Full video audio, not partial
        contentType: 'book',
        sourceUrl: youtubeUrl,
        pages: pages as any,
        totalPages: pages.length,
        currentPage: 0,
        coverImage: metadata.thumbnail,
        author: metadata.channel,
      },
    });

    return {
      ...userContent,
      pages,
    };
  } catch (error) {
    console.error('Error creating book from YouTube:', error);
    throw error;
  }
};

