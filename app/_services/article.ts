import { prisma } from '@/utils/db';
import {
  extractReferences,
  extractTitleFromMarkdown,
  generateContentList,
} from './markdown';
import { createArticleNodeWithReferences } from './neo4j';
import { convertPdfToMarkdown, getArticleName } from './pdf';
import { searchPaperByTitle } from './semanticScholar';

export type Reference = {
  Date: string | null; // The year of publication
  Title: string | null; // The title of the article
  Authors: string[] | null; // An array of authors
  Journal: string | null; // The journal where the article was published
  abstract: string | null;
};

export type ArticleNode = {
  journal: string | null;
  authors: string[];
  publication_date: string | null;
  pdf_url: string | null;
  abstract: string | null;
  title: string | null;
  display_name: string;
  references: Reference[];
};

export const createArticle = async (data: {
  markdownUrl?: string;
  pdfUrl?: string;
  title?: string;
  mapId?: string;
  authors?: string[];
  creating?: boolean;
  references?: Reference[];
  abstract?: string;
  analysis?: {
    connect: { id: string };
  };
  userArticleRelationships?: {
    connect: { id: string }[];
  };
}) => {
  try {
    const article = await prisma.article.create({
      data: {
        markdownUrl: data.markdownUrl,
        pdfUrl: data.pdfUrl,
        title: data.title,
        references: data.references || [],
      },
    });
    return article;
  } catch (error) {
    console.error('Error creating article:', error);
    throw error;
  }
};

export const updateArticle = async (
  id: string,
  data: {
    markdownUrl?: string;
    pdfUrl?: string;
    title?: string;
    mapId?: string;
    creating?: boolean;
    authors?: string[];
    abstract?: string;
    references?: Reference[];
    analysis?: {
      connect: { id: string };
    };
    userArticleRelationships?: {
      connect?: { id: string }[];
      disconnect?: { id: string }[];
    };
  }
) => {
  console.log('Updating Article with data ', data?.mapId);
  console.log('Updating Article with data ', data?.authors);
  console.log('Updating Article with data ', data?.abstract);

  try {
    const article = await prisma.article.update({
      where: { id },
      data: {
        markdownUrl: data.markdownUrl,
        pdfUrl: data.pdfUrl,
        title: data.title,
        mapId: data.mapId,
        creating: data.creating,
        authors: data?.authors,
        abstract: data?.abstract,
        references: data.references,
        analysis: data.analysis,
        UserArticleRelationship: {
          connect: data.userArticleRelationships?.connect,
          disconnect: data.userArticleRelationships?.disconnect,
        },
      },
    });
    return article;
  } catch (error) {
    console.error('Error updating article:', error);
    throw error;
  }
};

export const createArticleNodes = async (
  pdfBuffer: Buffer,
  markdown: string,
  articleId: string,
  userId: string
) => {
  console.log('Updating article: ', articleId);
  const markdownContentList = generateContentList(markdown);
  const extractedReferences = extractReferences(markdownContentList);
  //   console.log(markdownContentList);

  createArticleNodeWithReferences({
    journal: 'Journal Entry',
    authors: ['Author 1', 'Author 2'],
    publication_date: '2023',
    pdf_url: 'pdf url',
    abstract: 'Abstract here',
    title: 'title here',
    display_name: 'Cena, V',
    references: references,
  });

  //   console.log('Updated Article: ', updatedArticle);
};

export async function createUserArticleRelationship(data: {
  userId?: string;
  articleId?: string;
}) {
  try {
    const newRelationship = await prisma.userArticleRelationship.create({
      data: {
        userId: data.userId,
        articleId: data.articleId,
      },
    });
    return newRelationship;
  } catch (error) {
    console.error('Error creating UserArticleRelationship:', error);
    throw error;
  }
}

export async function updateUserArticleRelationship(
  id: string,
  data: {
    userId?: string;
    articleId?: string;
  }
) {
  try {
    const updatedRelationship = await prisma.userArticleRelationship.update({
      where: { id },
      data,
    });
    return updatedRelationship;
  } catch (error) {
    console.error('Error updating UserArticleRelationship:', error);
    throw error;
  }
}

export const getPdfArticleName = (
  pdfBuffer: ArrayBufferLike,
  fileName?: string
) => {
  console.log('File Name: ', fileName);
  getArticleName(pdfBuffer);
};

export const retrieveArticleInformation = async (
  buffer: Buffer<ArrayBufferLike>,
  fileName: string
) => {
  const markdownFile = await convertPdfToMarkdown(buffer);
  const contentList = generateContentList(markdownFile);
  const markdownTitle = extractTitleFromMarkdown(contentList);
  // Check if Article is alredy in the db
  //TODO

  // Check Semantic Scholar
  const paperDetails = await searchPaperByTitle(markdownTitle || fileName);
  if (paperDetails) {
    return paperDetails;
  }
  //TODO
  // Use Chat GPT to get the references
  //   const references = await parseReferencesViaGPT(
  //     JSON.stringify(extractedReferences)
  //   );
  // Use perplexity to find any missing information
};
