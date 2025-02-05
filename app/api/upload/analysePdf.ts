import OpenAI from 'openai';
import pdfParse from 'pdf-parse';
import * as pdfjsLib from 'pdfjs-dist';
import './pdf.worker.mjs';

export const getReferencesFromPdf = async (pdfBuffer: Buffer) => {
  console.log('Getting References....');
  try {
    // Use await to wait for the pdfParse promise to resolve
    const data = await pdfParse(pdfBuffer);
    console.log('data: ', data);
    const text = data.text;
    console.log('text: ', text);

    // Example for extracting references (APA format)
    const references = text.match(/\([A-Za-z]+, \d{4}\)/g); // Simple regex for APA

    console.log('References:', references);
  } catch (err) {
    console.log('Error Occurred: ', err);
  }
};

export const referencePdf = async (url: string) => {
  console.log('Referencing Pdf');
  try {
    // Load the PDF document
    const pdf = await pdfjsLib.getDocument(url).promise;
    let textContent = '';

    const numPages = pdf.numPages;

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const text = await page.getTextContent();

      let pageContent = '';
      text.items.forEach((item) => {
        if ('str' in item) {
          pageContent += item.str + ' ';
        }
      });

      // Keywords to identify reference pages
      const keywords = [
        'Reference',
        'References',
        'Source',
        'Sources',
        'Bibliography',
      ];

      // Check if the page contains any of the keywords (case-sensitive for capitalization)
      const isReferencePage = keywords.some(
        (keyword) =>
          pageContent.includes(keyword) ||
          pageContent.includes(keyword.toUpperCase())
      );

      if (isReferencePage) {
        console.log(`Page ${i} is a reference page. Adding to textContent.`);

        // Add the current page
        textContent += `\n\n--- Page ${i} ---\n${pageContent}`;

        // Add the next two pages, if they exist
        for (let offset = 1; offset <= 5; offset++) {
          if (i + offset <= numPages) {
            const nextPage = await pdf.getPage(i + offset);
            const nextText = await nextPage.getTextContent();

            let nextPageContent = '';
            nextText.items.forEach((item) => {
              if ('str' in item) {
                nextPageContent += item.str + ' ';
              }
            });

            console.log(`Adding Page ${i + offset} to textContent.`);
            textContent += `\n\n--- Page ${i + offset} ---\n${nextPageContent}`;
          }
        }

        // Skip the next two pages as they are already processed
        i += 5;
      }
    }

    console.log(
      'Final Text Content of Reference Pages and Adjacent Pages:',
      textContent
    );
    analyzePdf(textContent);
  } catch (error) {
    console.error('Error occurred:', error);
  }
};

export const analyzePdf = async (fileContent: String) => {
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
    console.log('Receieved PDF, parsing....');
    // Check if the PDF contains text
    if (!fileContent) {
      throw new Error('No readable text found in the PDF document.');
    }

    // Create a prompt for the OpenAI API
    const prompt = `Analyze the following reseach article and provide information in a strict object:
  
      This text is from a research article and contains the references of the article. There may be the continuation of the article or other non relevant information.
      ${fileContent}...
      
      Provide me the a strict array of references in the following JSON schema.
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

    // Remove markdown backticks and extra formatting
    content = content
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    // Parse the response to extract analysis
    const analysisResult = JSON.parse(content);
    // console.info('Analysis Result:', analysisResult);
    return analysisResult;
  } catch (error) {
    console.error('Error in analyzePaper function:', error);
    return { error: 'An error occurred while analyzing the file.' };
  }
};
