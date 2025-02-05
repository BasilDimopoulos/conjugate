import { ArticleNode, Reference } from './article';

// Define the response types (adjust as needed depending on the information you want)
interface SemanticScholarPaper {
  title: string;
  authors: Array<{ name: string }>;
  abstract: string;
  journal: { name: string };
  year: string;
  references: Array<{
    title: string;
    abstract: string;
    year: string;
    authors: { name: string }[];
    journal: { name: string };
  }>;
}

export const mapSemanticScholarToArticleNode = (
  paper: SemanticScholarPaper,
  pdfUrl: string | null
): ArticleNode => {
  const references: Reference[] = paper.references.map(
    (ref): Reference => ({
      Date: ref.year || null,
      Title: ref.title || null,
      Authors: ref.authors?.map((author) => author.name) || null,
      Journal: ref.journal?.name || null,
      abstract: ref.abstract || null,
    })
  );

  return {
    journal: paper.journal?.name || null,
    authors: paper.authors.map((author) => author.name),
    publication_date: paper.year || null,
    pdf_url: pdfUrl || null,
    abstract: paper.abstract || null,
    title: paper.title || null,
    display_name: paper.title || 'Undefined',
    references,
  };
};

export const searchPaperByTitle = async (
  title: string
): Promise<ArticleNode | null> => {
  // Update the endpoint with the provided fields parameter
  const endpoint = `https://api.semanticscholar.org/graph/v1/paper/search?query=title:("${encodeURIComponent(
    title
  )}")&limit=1&fields=title,authors,abstract,references.title,references.abstract,references.authors`;
  console.log('Feteching From Semantic Scholar: ', title);
  try {
    // Await the fetch request and parse the response
    const response = await fetch(endpoint);

    // Check if the response is successful
    if (!response.ok) {
      throw new Error('Failed to fetch data from Semantic Scholar');
    }

    // Parse the response JSON
    const data = await response.json();

    console.log('Received Data: ', data);

    // Check if any papers are returned
    if (data.data && data.data.length > 0) {
      // Retrieve the first paper from the results
      const paperData = data.data[0];
      console.log('AUTHORS: ', paperData?.authors);
      console.log('abstract: ', paperData?.abstract);

      // Format and return the paper details
      const paper: SemanticScholarPaper = {
        title: paperData.title,
        authors: paperData.authors.map((author: { name: string }) => ({
          name: author.name,
        })),
        abstract: paperData.abstract,
        journal: paperData.journal,
        year: paperData.year,
        references: paperData.references
          ? paperData.references.map(
              (citation: { title: string; abstract: string }) => ({
                title: citation.title,
                abstract: citation.abstract,
              })
            )
          : [],
      };

      return mapSemanticScholarToArticleNode(paper, '');
    } else {
      console.log('No papers found for the given title');
      return null;
    }
  } catch (error) {
    console.error('Error fetching paper data:', error);
    return null;
  }
};
