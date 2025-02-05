/* eslint-disable @typescript-eslint/no-explicit-any */
import neo4j from 'neo4j-driver';
import { NextRequest, NextResponse } from 'next/server';

// Initialize the Neo4j driver
const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USERNAME || 'neo4j',
    process.env.NEO4J_PASSWORD || ''
  )
);

async function getArticlesAndReferencesById(articleId: string) {
  const session = driver.session();
  console.log('Fetching article and references for ID:', articleId);

  try {
    const result = await session.run(
      `
        MATCH (base:Article {id: $articleId})-[r:REFERENCES]->(t:Article)
        RETURN base, t, r
      `,
      { articleId }
    );

    const nodes: any[] = [];
    const links: any[] = [];

    result.records.forEach((record: any, index: number) => {
      console.log(`Processing record #${index + 1}:`, record);

      const baseArticle = record.get('base')?.properties;
      const referencedArticle = record.get('t')?.properties;

      if (!baseArticle || !referencedArticle) {
        console.warn(`Skipping record #${index + 1} due to missing data.`);
        return;
      }

      // Add base article node if not already added
      if (!nodes.find((node) => node.id === baseArticle.id)) {
        nodes.push({
          id: baseArticle.id,
          title: baseArticle.title,
          displayName: baseArticle.display_name || '',
          journal: baseArticle.journal || '',
          publicationDate: baseArticle.publication_date || '',
          pdfUrl: baseArticle.pdf_url || '',
          abstract: baseArticle.abstract || '',
          authors: baseArticle.authors || [],
          group: 1,
          label: 'Article',
        });
      }

      // Add referenced article node if not already added
      if (!nodes.find((node) => node.id === referencedArticle.id)) {
        nodes.push({
          id: referencedArticle.id || referencedArticle.title, // Fallback to title if ID is missing
          title: referencedArticle.title,
          displayName: referencedArticle.display_name || '',
          journal: referencedArticle.journal || '',
          publicationDate: referencedArticle.publication_date || '',
          pdfUrl: referencedArticle.pdf_url || '',
          abstract: referencedArticle.abstract || '',
          authors: referencedArticle.authors || [],
          group: 2,
          label: 'Reference',
        });
      }

      // Add relationship (link)
      if (
        !links.find(
          (link) =>
            link.source === baseArticle.id &&
            link.target === referencedArticle.id
        )
      ) {
        links.push({
          source: baseArticle.id,
          target: referencedArticle.id || referencedArticle.title, // Fallback to title if ID is missing
          type: 'REFERENCES',
        });
      }
    });

    console.log('Nodes:', JSON.stringify(nodes, null, 2));
    console.log('Links:', JSON.stringify(links, null, 2));

    return { nodes, links };
  } catch (error) {
    console.error('Error fetching articles and references by ID:', error);
    throw error;
  } finally {
    await session.close();
  }
}

async function getallArticlesAndReferences() {
  const session = driver.session();
  try {
    const result = await session.run(
      `
        MATCH (base:Article)-[r:REFERENCES]->(t:Article)
        RETURN base, t, r
      `
    );

    const nodes: any[] = [];
    const links: any[] = [];

    result.records.forEach((record: any) => {
      const baseArticle = record.get('base').properties;
      const referencedArticle = record.get('t').properties;

      // Add nodes
      if (!nodes.find((node) => node.id === baseArticle.title)) {
        nodes.push({
          id: baseArticle.title,
          label: 'Article',
          displayName: baseArticle?.display_name,
          group: 1,
        });
      }

      if (!nodes.find((node) => node.id === referencedArticle.title)) {
        nodes.push({
          id: referencedArticle.title,
          displayName: referencedArticle?.display_name,
          label: 'Reference',
          group: 2,
        });
      }

      // Add relationship
      links.push({
        source: baseArticle.title,
        target: referencedArticle.title,
        type: 'REFERENCES',
      });
    });

    return { nodes, links };
  } catch (error) {
    console.error('Error fetching articles by ID:', error);
    throw error;
  } finally {
    await session.close();
  }
}

async function getArticleByName(articleName: string) {
  const session = driver.session();
  console.log('Getting: ', articleName);
  try {
    const result = await session.run(
      `
        MATCH (article:Article {title:$articleName})RETURN article
      `,
      { articleName }
    );
    const article = result.records[0]?.get('article');
    return article;
  } catch (error) {
    console.error('Error fetching articles by its name:', error);
    throw error;
  } finally {
    await session.close();
  }
}

async function getArticleById(articleId: string): Promise<any> {
  const session = driver.session();

  try {
    const result = await session.run(
      `
        MATCH (article:Article {id: $articleId})
        RETURN article
      `,
      { articleId }
    );

    // Check if the article exists
    if (result.records.length === 0) {
      throw new Error(`No article found with ID: ${articleId}`);
    }

    // Get the article's properties
    const articleNode = result.records[0].get('article');
    const articleData = articleNode.properties;

    // Structure the data
    const article = {
      id: articleData.id,
      title: articleData.title,
      displayName: articleData.display_name || '',
      journal: articleData.journal || '',
      publicationDate: articleData.publication_date || '',
      pdfUrl: articleData.pdf_url || '',
      abstract: articleData.abstract || '',
      authors: articleData.authors || [],
    };

    return article;
  } catch (error) {
    console.error('Error fetching article by ID:', error);
    throw error;
  } finally {
    await session.close();
  }
}

export async function GET(req: NextRequest) {
  console.log('Fetching...');
  const searchParams = req.nextUrl.searchParams;
  console.log(searchParams.get('articleId'));

  if (searchParams.get('articleId') === 'none') {
    console.log('Getting all Articles');
    const graphData = await getallArticlesAndReferences();
    return NextResponse.json(graphData, {
      status: 200,
    });
  }

  if (searchParams.has('articleId')) {
    const articleId = searchParams.get('articleId');
    const graphData = await getArticlesAndReferencesById(articleId || '');
    return NextResponse.json(graphData, {
      status: 200,
    });
  } else if (searchParams.has('articleName')) {
    const articleName = searchParams.get('articleName');
    const article = await getArticleByName(articleName || '');
    return NextResponse.json(article, {
      status: 200,
    });
  } else if (searchParams.has('nodeId')) {
    const articleData = await getArticleById(searchParams.get('nodeId') || '');
    return NextResponse.json(articleData, {
      status: 200,
    });
  }
}
