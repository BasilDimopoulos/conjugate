import neo4j, { Session } from 'neo4j-driver';
import { randomUUID } from 'crypto';
import { ArticleNode } from './article';

const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USERNAME || 'neo4j',
    process.env.NEO4J_PASSWORD || ''
  )
);

export const createArticleNodeWithReferences = async (
  params: ArticleNode | undefined
): Promise<string | null> => {
  const articleId = randomUUID();
  const session = driver.session();

  // Create the main article node
  const createArticleQuery = `
    CREATE (a:Article {
      id: $id,
      journal: $journal,
      authors: $authors,
      publication_date: $publication_date,
      pdf_url: $pdf_url,
      abstract: $abstract,
      title: $title,
      display_name: $display_name
    })
    RETURN a
  `;

  if (!params) {
    return null;
  }

  const articleQueryParams = {
    id: articleId,
    journal: params.journal,
    authors: params.authors,
    publication_date: params.publication_date,
    pdf_url: params.pdf_url,
    abstract: params.abstract,
    title: params.title,
    display_name: params.display_name,
  };

  try {
    // console.log('articleQueryParams: ', articleQueryParams);
    const result = await session.run(createArticleQuery, articleQueryParams);
    const createdArticle = result.records[0]?.get('a');

    // console.log('Main article created:', createdArticle);

    // If there are references, create nodes for them and establish relationships
    if (params?.references && params?.references?.length > 0) {
      console.log('Creating References nodes from: ', params?.references);
      for (const reference of params.references) {
        const referenceTitle = reference.Title;
        const referenceDisplayName = reference?.Authors?.length
          ? reference.Authors[0]
          : '';
        const referenceAbstract = reference?.abstract;
        const createReferenceAndLinkQuery = `
          MERGE (r:Article { title: $referenceTitle }) 
             ON CREATE SET r.display_name = $referenceDisplayName, r.abstract = $referenceAbstract
          MERGE (a:Article { id: $articleId })
          MERGE (a)-[:REFERENCES]->(r)
        `;

        const referenceQueryParams = {
          referenceTitle,
          referenceDisplayName,
          referenceAbstract,
          articleId,
        };

        await session.run(createReferenceAndLinkQuery, referenceQueryParams);
        // console.log(`Reference created and linked: ${referenceTitle}`);
      }
    }
    return articleId;
  } catch (error) {
    console.error('Error creating article or references:', error);
    throw new Error('Failed to create article node with references.');
  }
};
