import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text, sourceLanguage, targetLanguage } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // If source language is not provided, auto-detect
    const systemPrompt = sourceLanguage 
      ? `You are a professional translator. Translate the given text from ${sourceLanguage} to ${targetLanguage || 'English'}. Provide only the translation, no explanations or additional text. If it's a phrase or sentence, maintain the natural flow and meaning.`
      : `You are a professional translator. Detect the language of the given text and translate it to ${targetLanguage || 'English'}. Provide only the translation, no explanations or additional text. If it's a phrase or sentence, maintain the natural flow and meaning.`;

    console.log('Translation request:', { 
      text: text.substring(0, 50) + '...', 
      sourceLanguage: sourceLanguage || 'auto-detect',
      targetLanguage: targetLanguage || 'English'
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const translation = completion.choices[0]?.message?.content?.trim() || 'Translation unavailable';

    console.log('Translation success:', translation.substring(0, 50) + '...');

    return NextResponse.json({
      translation,
      sourceLanguage: sourceLanguage || 'auto-detected',
      targetLanguage: targetLanguage || 'English',
      originalText: text
    });

  } catch (error) {
    console.error('Translation API error:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Translation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

