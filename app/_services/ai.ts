import OpenAI from 'openai';
import { ArticleNode } from './article';

export const parseReferencesViaGPT = async (referenceString: string) => {
  let openai;
  const OPENAI_API_KEY = process.env.OPENAI_KEY;

  try {
    if (!OPENAI_API_KEY) {
      throw new Error(
        'OPENAI_API_KEY is not set in the environment variables.'
      );
    }
    openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  } catch (error) {
    console.error('Error initializing OpenAI client:', error);
    return { error: 'Failed to initialize OpenAI client.' };
  }

  try {
    if (!openai) {
      throw new Error('OpenAI client is not properly initialized.');
    }
    console.log('Receieved String, parsing refereces....');
    // Check if the PDF contains text
    if (!referenceString) {
      throw new Error('No readable text found in the PDF document.');
    }

    // Create a prompt for the OpenAI API
    const prompt = `Analyze the following reseach article and provide information in a strict object:
  
      This text is from a research article and contains the references of the article. There may be the continuation of the article or other non relevant information.
      ${referenceString}...
      
      Provide me the a strict array of references in the following JSON schema. Dont give me anything else except this schema.
      Object Schema:
      {
      Author: string[]
      Title: string
      Journal: string
      Date: string
    }`;

    // Send the prompt to OpenAI for processing
    const completion = await openai.chat.completions.create({
      messages: [{ content: prompt, role: 'user' }],
      model: 'gpt-4o-mini',
    });
    let content = completion.choices[0].message.content;

    if (!content) {
      console.error('Failed to generate');
      return [];
    }

    // Remove markdown backticks and extra formatting
    content = content
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    // Parse the response to extract analysis
    const analysisResult = JSON.parse(content);
    console.info('Analysis Result:', analysisResult);
    return analysisResult;
  } catch (error) {
    console.error('Error in analyzePaper function:', error);
    return { error: 'An error occurred while analyzing the file.' };
  }
};

export const parseArticleTitleByMarkdown = (markdown: string) => {};

export const getPresiseArticleDataFromPerplexity = async (
  data: ArticleNode
) => {
  const { references, ...articleInfo } = data;
  console.log('Filling out missing information from: ', articleInfo);
  let openai;
  const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

  try {
    if (!PERPLEXITY_API_KEY) {
      throw new Error(
        'PERPLEXITY_API_KEY is not set in the environment variables.'
      );
    }
    openai = new OpenAI({
      apiKey: PERPLEXITY_API_KEY,
      baseURL: 'https://api.perplexity.ai',
    });
  } catch (error) {
    console.error('Error initializing OpenAI client:', error);
    return { error: 'Failed to initialize OpenAI client.' };
  }

  try {
    if (!openai) {
      throw new Error('OpenAI client is not properly initialized.');
    }
    console.log('Receieved Article, parsing missing information....');
    // Check if the PDF contains text
    if (!data.title) {
      throw new Error('No readable title found in the Article Information.');
    }

    // Create a prompt for the OpenAI API
    const prompt = `Fill out the missing data in this Article object, given the title of ${
      data.title
    }. The article information is as follows, where the certain fields have missing data. 
        ${JSON.stringify(articleInfo)}
      
      Provide me the article filled with the missing information where you can find it, in the following JSON schema. Dont give me anything else except this schema.
      Object Schema:
      type ArticleNode = {
        journal: string | null;
        authors: string[];
        publication_date: string | null;
        pdf_url: string | null;
        abstract: string | null;
        title: string | null;
        display_name: string;
      };
    `;

    // Send the prompt to OpenAI for processing
    const completion = await openai.chat.completions.create({
      messages: [{ content: prompt, role: 'user' }],
      model: 'llama-3.1-sonar-large-128k-online',
    });
    let content = completion.choices[0].message.content;
    console.log('CONTENT GENERATED: ', content);

    if (!content) {
      console.error('Failed to generate');
      return [];
    }

    // Remove markdown backticks and extra formatting
    content = content
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    // Parse the response to extract analysis
    const analysisResult = JSON.parse(content);
    console.info('Analysis Result:', analysisResult);
    return analysisResult;
  } catch (error) {
    console.error('Error in analyzePaper function:', error);
    return { error: 'An error occurred while analyzing the file.' };
  }
};

export const sendArticleForTraining = async (
  userId: string,
  pdfUrl: string
) => {
  const url = 'http://127.0.0.1:8000/process-pdf'; // FastAPI endpoint URL
  const data = {
    userId,
    pdfUrl,
  };

  try {
    const response = await fetch(url, {
      method: 'POST', // Specify the POST method
      headers: {
        'Content-Type': 'application/json', // Set the content type to JSON
      },
      body: JSON.stringify(data), // Convert the data object to JSON format
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json(); // Parse the response JSON
    console.log('Response:', responseData); // Log the response from the server
  } catch (error) {
    console.error('Error:', error); // Log any errors
  }
};

// export const queryTrainingData = (userId: string, query: string) => {

// }
