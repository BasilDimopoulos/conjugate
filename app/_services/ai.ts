'use server';

import OpenAI from 'openai';
import { Leonardo } from '@leonardo-ai/sdk';
import { ElevenLabsClient } from 'elevenlabs';
import { v4 as uuid } from 'uuid';
import uploadFileToS3 from './s3';
import { getStreamAsBuffer } from 'get-stream';

export const getWordDataViaGPT = async (word: string, language: string) => {
  let openai;
  const OPENAI_API_KEY = process.env.OPENAI_KEY;
  console.log('Getting Data from OpenAi');
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
    // Check if the PDF contains text
    if (!word) {
      throw new Error('No readable text found in the PDF document.');
    }

    // Create a prompt for the OpenAI API
    const prompt = `With the following word in ${language}, generate me the following information:
  
      This text is from a research article and contains the references of the article. There may be the continuation of the article or other non relevant information.
      ${word}...
      
      Provide me the a strict array of references in the following JSON schema. Don't give me anything else except this schema. 
      The mnemonic should be a simple sentence to help remember the word in an optimal human way. Use the pronunciation sound in a way that makes it memorable. Or compare it to an existing word in english.
      The fun fact is anything throughout history or literature where the word was used in an interesting way.
      The phoneticTranscription is the pronunciation of the word in the phonetic alphabet.
      If the word is being translated from Chinese, Cantonese or any other language that uses pinyin, provide the pinyin. Otherwise use null.
      The imagePrompt should be a description of the mnemonic in a way that aids the user in remembering the mnemonic. e.g "Bold acrylic painting, vibrant colors and textured brushstrokes. Character shouts Wo amidst exploding fireworks, surrounded by colorful swirls. Dynamic, energetic style, expressive pose, celebratory scene."
      Object Schema:
      {
      mnemonic: string
      funFact: string
      englishTranslation: string
      phoneticTranscription : string
      pinyin : string
      imagePrompt : string
    }`;

    // Send the prompt to OpenAI for processing
    const completion = await openai.chat.completions.create({
      messages: [{ content: prompt, role: 'user' }],
      model: 'gpt-4o-mini',
    });
    let content = completion.choices[0].message.content;
    console.log('content: ', content);

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
export const generateFromLeonardo = async (prompt: string) => {
  const apiKey = process.env.LEONARDO_API_KEY;
  // const leonardo = new LeonardoCore({
  //   bearerAuth: `Bearer ${apiKey}`,
  // });
  const url = 'https://cloud.leonardo.ai/api/rest/v1/generations';

  const requestBody = {
    modelId: '6b645e3a-d64f-4341-a6d8-7a3690fbf042',
    contrast: 3.5,
    prompt: prompt,
    num_images: 2,
    width: 832,
    height: 1248,
    alchemy: false,
    styleUUID: '111dc692-d470-4eec-b791-3475abac4c46',
    enhancePrompt: false,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    const res = await response.json();
    console.log('Received Data: ', res);

    if (!res) {
      console.error('Error:', res);
    } else {
      return res?.sdGenerationJob?.generationId || '';
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
};

export const retrieveImageFromLeonardo = async (imageId: string) => {
  const leonardo = new Leonardo({
    bearerAuth: process.env.LEONARDO_API_KEY,
  });

  const data = await leonardo.image.getGenerationById(imageId);
  return data?.object?.generationsByPk?.generatedImages?.[0];
};

export const generateVoiceFromElevenLabs = async (
  text: string,
  language: string
) => {
  console.log('Generating Voice for language: ', language);
  const client = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
  });
  const audio = await client.textToSpeech.convert('4VZIsMPtgggwNg7OXbPY', {
    text,
    model_id: 'eleven_multilingual_v2',
    output_format: 'mp3_44100_128',
  });
  console.log('audio: ', audio);
};

export const createAudioFileFromText = async (
  text: string
): Promise<string> => {
  console.log('Generating Voice for:', text);

  const client = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
  });
  console.log('Generated Client');

  try {
    const audioStream = await client.generate({
      voice: '4VZIsMPtgggwNg7OXbPY',
      model_id: 'eleven_turbo_v2_5',
      text,
    });

    const fileName = `${uuid()}.mp3`;
    console.log('FileName: ', fileName);
    const audioBuffer = await streamToBuffer(audioStream);
    console.log('Received File Buffer: ', audioBuffer);
    const url = await uploadFileToS3(audioBuffer, fileName);
    console.log('Received Url: ', url);
    return url;
  } catch (error) {
    console.error('Error generating audio file:', error);
    throw new Error('Failed to generate and upload audio file.');
  }
};

const streamToBuffer = async (
  stream: NodeJS.ReadableStream
): Promise<Buffer> => {
  try {
    console.log('Getting Stream...');
    return await getStreamAsBuffer(stream);
  } catch (error) {
    console.error('Error converting stream to buffer:', error);
    throw error;
  }
};

// export const parseArticleTitleByMarkdown = (markdown: string) => {};

// export const getPresiseArticleDataFromPerplexity = async (
//   data: ArticleNode
// ) => {
//   const { references, ...articleInfo } = data;
//   console.log('Filling out missing information from: ', articleInfo);
//   let openai;
//   const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

//   try {
//     if (!PERPLEXITY_API_KEY) {
//       throw new Error(
//         'PERPLEXITY_API_KEY is not set in the environment variables.'
//       );
//     }
//     openai = new OpenAI({
//       apiKey: PERPLEXITY_API_KEY,
//       baseURL: 'https://api.perplexity.ai',
//     });
//   } catch (error) {
//     console.error('Error initializing OpenAI client:', error);
//     return { error: 'Failed to initialize OpenAI client.' };
//   }

//   try {
//     if (!openai) {
//       throw new Error('OpenAI client is not properly initialized.');
//     }
//     console.log('Receieved Article, parsing missing information....');
//     // Check if the PDF contains text
//     if (!data.title) {
//       throw new Error('No readable title found in the Article Information.');
//     }

//     // Create a prompt for the OpenAI API
//     const prompt = `Fill out the missing data in this Article object, given the title of ${
//       data.title
//     }. The article information is as follows, where the certain fields have missing data.
//         ${JSON.stringify(articleInfo)}

//       Provide me the article filled with the missing information where you can find it, in the following JSON schema. Dont give me anything else except this schema.
//       Object Schema:
//       type ArticleNode = {
//         journal: string | null;
//         authors: string[];
//         publication_date: string | null;
//         pdf_url: string | null;
//         abstract: string | null;
//         title: string | null;
//         display_name: string;
//       };
//     `;

//     // Send the prompt to OpenAI for processing
//     const completion = await openai.chat.completions.create({
//       messages: [{ content: prompt, role: 'user' }],
//       model: 'llama-3.1-sonar-large-128k-online',
//     });
//     let content = completion.choices[0].message.content;
//     console.log('CONTENT GENERATED: ', content);

//     if (!content) {
//       console.error('Failed to generate');
//       return [];
//     }

//     // Remove markdown backticks and extra formatting
//     content = content
//       .replace(/```json/g, '')
//       .replace(/```/g, '')
//       .trim();

//     // Parse the response to extract analysis
//     const analysisResult = JSON.parse(content);
//     console.info('Analysis Result:', analysisResult);
//     return analysisResult;
//   } catch (error) {
//     console.error('Error in analyzePaper function:', error);
//     return { error: 'An error occurred while analyzing the file.' };
//   }
// };
