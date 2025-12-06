import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, systemPrompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Check for API key
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error('GOOGLE_GENERATIVE_AI_API_KEY is not set');
      return NextResponse.json(
        { error: 'AI service not configured. Please set GOOGLE_GENERATIVE_AI_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    const { text } = await generateText({
      model: google('gemini-2.5-flash-lite'), // Using Gemini Flash model (gemini-2.5-flash-lite may not be available yet)
      system: systemPrompt || 'You are a helpful AI assistant that provides clear and concise responses.',
      prompt: prompt,
    });

    return NextResponse.json({ text });
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate text', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

