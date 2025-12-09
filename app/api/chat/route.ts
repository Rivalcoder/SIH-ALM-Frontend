"use server";

import { NextRequest, NextResponse } from 'next/server';
import OllamaClient from './ollama-client.js';

/**
 * Resolve Ollama base URL
 * Supports env: OLLAMA_URL, NEXT_PUBLIC_OLLAMA_URL
 * Accepts URLs like http://localhost:11434 or https://untraceable-tiara-fittingly.ngrok-free.dev
 */
function getOllamaUrl(): string {
  const url =
    process.env.OLLAMA_URL ||
    process.env.NEXT_PUBLIC_OLLAMA_URL ||
    'http://localhost:11434';
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

/**
 * Resolve Ollama model
 */
function getOllamaModel(): string {
  return (
    process.env.OLLAMA_MODEL ||
    process.env.NEXT_PUBLIC_OLLAMA_MODEL ||
    'ministral-3:3b'
  );
}

/**
 * Resolve Ollama API path (default /api/chat, can be /chat for alt backends)
 */
function getOllamaApiPath(): string {
  const path =
    process.env.OLLAMA_API_PATH ||
    process.env.NEXT_PUBLIC_OLLAMA_API_PATH ||
    '/api/chat';
  return path.startsWith('/') ? path : `/${path}`;
}

/**
 * Resolve headers (adds ngrok skip header automatically)
 */
function getOllamaHeaders(): Record<string, string> {
  const url = getOllamaUrl();
  const base: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(url.includes('ngrok') ? { 'ngrok-skip-browser-warning': 'true' } : {})
  };

  const custom =
    process.env.OLLAMA_HEADERS || process.env.NEXT_PUBLIC_OLLAMA_HEADERS;

  if (!custom) return base;
  try {
    return { ...base, ...JSON.parse(custom) };
  } catch {
    console.warn('Failed to parse OLLAMA_HEADERS, using defaults');
    return base;
  }
}

const client = new OllamaClient(
  getOllamaUrl(),
  getOllamaModel(),
  getOllamaApiPath(),
  getOllamaHeaders()
);

interface ChatRequestBody {
  audioResults?: any; // Full audio processed response (results object)
  audioData?: any; // Alternative name for audioResults
  prompt?: string;
  question?: string; // Alternative name for prompt
  stream?: boolean; // Whether to stream the response
}

/**
 * Extract all audio processed data from the request
 * Handles both audioResults and audioData, and ensures all fields are included
 */
function extractAudioData(body: ChatRequestBody): any {
  // Try audioResults first, then audioData
  const audioData = body.audioResults || body.audioData;
  
  if (!audioData) {
    return null;
  }

  // If audioData is the full ProcessAudioResponse structure with 'results' field
  if (audioData.results) {
    return audioData.results;
  }

  // If audioData is already the results object, return it as is
  // Ensure it contains all expected fields
  const fullAudioData = {
    audio: audioData.audio || null,
    transcription: audioData.transcription || null,
    diarization: audioData.diarization || null,
    diarization_with_text: audioData.diarization_with_text || null,
    paralinguistics: audioData.paralinguistics || null,
    audio_events: audioData.audio_events || null,
    // Include any other fields that might be present
    ...audioData
  };

  return fullAudioData;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequestBody = await request.json();
    const prompt = body.prompt || body.question;
    
    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Prompt or question is required' },
        { status: 400 }
      );
    }

    // Extract all audio processed data - ensures all fields are included
    const audioResults = extractAudioData(body);

    if (!audioResults) {
      return NextResponse.json(
        { error: 'Audio results or audio data is required' },
        { status: 400 }
      );
    }

    // Check if streaming is requested
    const url = new URL(request.url);
    const streamParam = url.searchParams.get('stream');
    const shouldStream = streamParam === 'true' || body.stream === true;

    if (shouldStream) {
      // Handle streaming response
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          
          try {
            // Use the chatStream method from OllamaClient
            // This passes ALL audio data (transcription, diarization, paralinguistics, audio_events)
            await client.chatStream(
              prompt.trim(),
              audioResults,
              (chunk: string) => {
                // Send each chunk as it arrives in SSE format
                if (process.env.NODE_ENV === 'development') {
                  console.log('[chat stream] chunk ->', chunk.slice(0, 120));
                }
                const data = JSON.stringify({ content: chunk, done: false });
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              },
              {
                temperature: 0.7,
                maxTokens: 512
              }
            );
            
            // Send final message
            const finalData = JSON.stringify({ content: '', done: true });
            controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
            controller.close();
          } catch (error) {
            const errorData = JSON.stringify({
              error: error instanceof Error ? error.message : 'Unknown error',
              done: true
            });
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
            controller.close();
          }
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      });
    } else {
      // Handle non-streaming response
      // Pass ALL audio data to the chatbot (transcription, diarization, paralinguistics, audio_events)
      const response = await client.chat(prompt.trim(), audioResults);
      
      return NextResponse.json(response);
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}