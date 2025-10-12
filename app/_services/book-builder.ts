'use server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/utils/db';
import { analyzeTextContent } from './content';
import { chunkIntoPages, type BookPage } from './book-utils';
import { generateArticleAudio } from './ai';

// Re-export types for convenience
export type { BookPage } from './book-utils';

export interface ArticleData {
  title: string;
  content: string;
  author?: string;
  images: string[];
  publishDate?: string;
}

/**
 * Parse markdown to extract clean text and images
 */
const parseMarkdownContent = (markdown: string): { text: string; images: string[] } => {
  const images: string[] = [];
  
  // Extract images from markdown - handle multiple formats
  // Format 1: ![alt](url)
  // Format 2: [![alt](url)](link)
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let cleanText = markdown;
  
  let match;
  while ((match = imageRegex.exec(markdown)) !== null) {
    const imageUrl = match[2];
    // Only keep if it's an actual image URL (not a link)
    if (imageUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)/i)) {
      images.push(imageUrl);
    }
  }
  
  // FIRST: Remove all image markdown completely (including wrapper links)
  // Remove [![alt](image-url)](link-url) patterns
  cleanText = cleanText.replace(/\[!\[[^\]]*\]\([^)]+\)\]\([^)]+\)/g, '');
  // Remove ![alt](url) patterns
  cleanText = cleanText.replace(/!\[[^\]]*\]\([^)]+\)/g, '');
  // Remove any remaining ](url) fragments
  cleanText = cleanText.replace(/\]\([^)]*\)/g, '');
  // Remove stray opening brackets
  cleanText = cleanText.replace(/\[(?![^\]]*\])/g, '');
  
  // Clean up any remaining markdown formatting
  cleanText = cleanText
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links but keep text
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
    .replace(/\*([^*]+)\*/g, '$1') // Remove italic
    .replace(/`([^`]+)`/g, '$1') // Remove code
    .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
    .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered lists
    .replace(/\n{3,}/g, '\n\n') // Normalize whitespace
    // Remove Jina Reader metadata lines
    .replace(/^Title:.*$/gm, '')
    .replace(/^URL Source:.*$/gm, '')
    .replace(/^Published Time:.*$/gm, '')
    .replace(/^Markdown Content:.*$/gm, '')
    .replace(/^Author:.*$/gm, '')
    .replace(/^---+$/gm, '') // Remove separator lines
    .trim();
  
  return { text: cleanText, images };
};

/**
 * Fetch and parse article from URL using Jina Reader API
 */
export const fetchArticleFromURL = async (url: string): Promise<ArticleData | null> => {
  try {
    // Use Jina Reader API for clean article extraction
    const response = await fetch(`https://r.jina.ai/${url}`, {
      headers: {
        'Accept': 'text/markdown',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch article:', response.statusText);
      return null;
    }

    const markdown = await response.text();
    
    // Extract title from Jina Reader metadata BEFORE cleaning
    let title = 'Untitled Article';
    const titleMatch = markdown.match(/^Title:\s*(.+)$/m);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim();
    } else {
      // Fallback: look for first # heading
      const headingMatch = markdown.match(/^#\s+(.+)$/m);
      if (headingMatch && headingMatch[1]) {
        title = headingMatch[1].trim();
      }
    }
    
    // Extract author if available
    let author: string | undefined;
    const authorMatch = markdown.match(/^Author:\s*(.+)$/m);
    if (authorMatch && authorMatch[1]) {
      author = authorMatch[1].trim();
    }
    
    // Parse the markdown to get clean text and images
    const { text, images } = parseMarkdownContent(markdown);
    
    console.log(`Extracted article: "${title}" by ${author || 'Unknown'}`);
    
    return {
      title,
      content: text,
      author,
      images,
      publishDate: undefined,
    };
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
};

/**
 * Create a book from URL
 */
export const createBookFromURL = async (
  url: string,
  language: string
) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    // Fetch article
    const article = await fetchArticleFromURL(url);
    
    if (!article || !article.content) {
      throw new Error('Failed to fetch article content');
    }

    // Analyze content
    const analysis = await analyzeTextContent(article.content, language);

    // Chunk into pages - improved for ebook-like flow
    // Using character count for more consistent page heights
    const pages = chunkIntoPages(
      article.content,
      language,
      article.images,
      1100 // base chars per page (without images) - will be reduced for pages with images
    );

    // Generate audio for the article using ElevenLabs + S3
    console.log('Generating audio for article...');
    const audioUrl = await generateArticleAudio(article.content, language);
    if (audioUrl) {
      console.log('Audio generated successfully!');
    } else {
      console.log('Audio generation failed (continuing without audio)');
    }

    // Save to database
    const userContent = await prisma.userContent.create({
      data: {
        userId,
        title: article.title,
        text: article.content,
        language,
        summary: analysis?.summary || null,
        sentiment: analysis?.sentiment || null,
        topic: analysis?.topic || null,
        difficulty: analysis?.difficulty || null,
        audioUrl: audioUrl,
        contentType: 'book',
        sourceUrl: url,
        pages: pages as any, // Prisma Json type
        totalPages: pages.length,
        currentPage: 0,
        coverImage: article.images[0] || null,
        author: article.author || null,
      },
    });

    return {
      ...userContent,
      pages,
    };
  } catch (error) {
    console.error('Error creating book from URL:', error);
    throw error;
  }
};

/**
 * Update reading progress for a book
 */
export const updateReadingProgress = async (
  contentId: string,
  currentPage: number
) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    await prisma.userContent.update({
      where: {
        id: contentId,
        userId,
      },
      data: {
        currentPage,
        updatedAt: new Date(),
      },
    });

    return true;
  } catch (error) {
    console.error('Error updating reading progress:', error);
    throw error;
  }
};

