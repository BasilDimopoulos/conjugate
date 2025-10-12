// Book utilities - Helper functions (no 'use server' needed)

export interface BookPage {
  pageNumber: number;
  content: string;
  words: string[];
  imageUrl?: string;
  audioUrl?: string;
}

/**
 * Chunk content into pages (pure function, not a server action)
 * Improved to wrap content like an ebook reader - breaking at natural points
 * Estimates based on character count for consistent page heights
 * Accounts for image height when calculating text space
 */
export const chunkIntoPages = (
  text: string,
  language: string,
  images: string[] = [],
  baseCharsPerPage: number = 1100  // Base limit for pages without images
): BookPage[] => {
  const pages: BookPage[] = [];
  const isCJK = ['chinese', 'japanese', 'korean'].includes(language.toLowerCase());
  
  // Split into sentences for better breaking
  const sentences = text.split(/([.!?。！？]\s+)/).filter(s => s.trim());
  
  let currentPageContent: string = '';
  let currentCharCount = 0;
  let imageIndex = 0;
  let nextPageHasImage = images.length > 0; // First page gets first image if available

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const sentenceChars = sentence.length;

    // Calculate character limit for this page
    // If page has an image (h-40 = 160px), reduce available text space
    // Image: 160px, Margins: ~80px, Page number: 30px = 270px used
    // Available for text: 800px - 270px = 530px (with image) vs 720px (without)
    // Ratio: 530/720 ≈ 0.65
    const pageCharLimit = nextPageHasImage 
      ? Math.floor(baseCharsPerPage * 0.65)  // ~715 chars with image (160px image + margins)
      : baseCharsPerPage;  // ~1100 chars without image

    // Check if adding this sentence would exceed page limit
    if (currentCharCount + sentenceChars > pageCharLimit && currentCharCount > 0) {
      // Create a new page
      const pageContent = currentPageContent.trim();
      const pageWords = isCJK
        ? pageContent.split('').filter(c => c.trim())
        : pageContent.split(/\s+/).filter(w => w.trim());

      if (pageContent) {
        pages.push({
          pageNumber: pages.length + 1,
          content: pageContent,
          words: pageWords,
          imageUrl: nextPageHasImage ? (images[imageIndex] || undefined) : undefined,
        });

        // Move to next image if this page used one
        if (nextPageHasImage && imageIndex < images.length - 1) {
          imageIndex++;
        }

        // Determine if next page should have an image
        // Distribute images evenly across the book
        const remainingPages = Math.ceil((text.length - (text.indexOf(currentPageContent) + currentPageContent.length)) / baseCharsPerPage);
        const remainingImages = images.length - imageIndex - 1;
        nextPageHasImage = remainingImages > 0 && remainingPages > 0 && (pages.length % Math.ceil(remainingPages / Math.max(remainingImages, 1)) === 0);
      }

      // Start new page with current sentence
      currentPageContent = sentence;
      currentCharCount = sentenceChars;
    } else {
      // Add sentence to current page
      currentPageContent += sentence;
      currentCharCount += sentenceChars;
    }
  }

  // Add final page
  if (currentPageContent.trim()) {
    const pageContent = currentPageContent.trim();
    const pageWords = isCJK
      ? pageContent.split('').filter(c => c.trim())
      : pageContent.split(/\s+/).filter(w => w.trim());

    pages.push({
      pageNumber: pages.length + 1,
      content: pageContent,
      words: pageWords,
      imageUrl: nextPageHasImage ? (images[imageIndex] || undefined) : undefined,
    });
  }

  return pages;
};

