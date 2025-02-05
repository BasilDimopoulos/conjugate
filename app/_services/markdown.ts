type ContentItem = {
  type: 'text';
  text: string;
  text_level?: number;
  page_idx?: number;
};

/**
 * Generate a content list from a Markdown string
 * @param markdown - The input Markdown content
 * @param pageIndices - (Optional) Array of page indices for each line in the Markdown
 * @returns A list of content items
 */
export const generateContentList = (
  markdown: string,
  pageIndices?: number[]
): ContentItem[] => {
  const lines = markdown.split('\n');
  const contentList: ContentItem[] = [];

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    if (trimmedLine) {
      let textLevel: number | undefined;

      // Determine the heading level (if any)
      if (trimmedLine.startsWith('#')) {
        textLevel = trimmedLine.split(' ')[0].length; // Count the number of `#` characters
      }

      // Add the content item
      contentList.push({
        type: 'text',
        text: trimmedLine.replace(/^#+\s*/, ''), // Remove heading markers
        text_level: textLevel,
        page_idx: pageIndices ? pageIndices[index] : undefined, // Optional page index
      });
    }
  });

  return contentList;
};

/**
 * Extract references from a context list.
 * @param contextList - The array of content items.
 * @returns An array of strings representing the references.
 */
export const extractReferences = (contextList: ContentItem[]): string[] => {
  const references: string[] = [];
  const referenceKeywords = [
    'references',
    'reference',
    'source',
    'sources',
    'bibliography',
  ];
  let isReferenceSection = false;

  for (const item of contextList) {
    if (item.type === 'text') {
      const text = item.text.trim().toLowerCase();

      // Check if we're entering the references section
      if (referenceKeywords.includes(text)) {
        isReferenceSection = true;
        continue; // Skip the section title itself
      }

      // Stop collecting if another section or unrelated content is found
      if (
        isReferenceSection &&
        (item.text_level || text === '' || text.includes('tables'))
      ) {
        break;
      }

      // Collect text if it's part of the references section
      if (isReferenceSection && text) {
        references.push(item.text.trim());
      }
    }
  }
  return references;
};

export const extractTitleFromMarkdown = (
  contentList: ContentItem[]
): string => {
  console.log('First Content Item:', contentList[0]);
  console.log('Second Content Item:', contentList[1]);

  const firstText = contentList[0]?.text;
  const secondText = contentList[1]?.text;
  console.log(
    'Found: ',
    firstText && firstText !== '0' ? firstText : secondText || ''
  );

  return firstText && firstText !== '0' ? firstText : secondText || '';
};
