import pdf from 'pdf-parse';
import { PDFDocument } from 'pdf-lib';

/**
 * Convert a PDF byte stream to Markdown format
 * @param pdfBuffer - The buffer or byte stream of the PDF file
 * @returns The Markdown content as a string
 */
export const convertPdfToMarkdown = async (
  pdfBuffer: Buffer
): Promise<string> => {
  try {
    // Parse the PDF content
    const data = await pdf(pdfBuffer);

    // Extract text content and convert to Markdown
    const markdownContent = data.text
      .split('\n')
      .map((line) => {
        if (line.trim().startsWith('#')) {
          return `# ${line.trim()}`; // Headings
        } else if (line.trim()) {
          return line.trim(); // Regular text
        } else {
          return ''; // Empty lines
        }
      })
      .join('\n\n'); // Add spacing between lines for markdown readability

    return markdownContent;
  } catch (error) {
    console.error('Error during conversion:', error);
    throw new Error('Failed to convert PDF to Markdown');
  }
};

export async function getArticleName(
  pdfBuffer: ArrayBufferLike
): Promise<string | null> {
  try {
    // Load the PDF document directly from the ArrayBuffer-like input
    const pdfDoc = await PDFDocument.load(pdfBuffer as ArrayBuffer);

    // Extract metadata from the PDFDocument's info dictionary
    console.log("catalog: ", pdfDoc.catalog.entries);
    console.log("keyowrds: ", pdfDoc.getKeywords());
    console.log('get title: ', pdfDoc.getTitle());
    console.log('header: ', pdfDoc.context.header.toString());
    //   const { info } = pdfDoc;

    // Return the title if available
    //   return info?.Title || null;
    return null;
  } catch (error) {
    console.error('Error extracting title from PDF:', error);
    return null;
  }
}
