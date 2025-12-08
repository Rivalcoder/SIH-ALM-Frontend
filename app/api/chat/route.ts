import { NextRequest, NextResponse } from 'next/server';

interface ChatRequest {
  audioData: any; // Full audio processed response
  prompt: string; // User's question/prompt
  systemInstruction?: string; // System instructions
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { audioData, prompt, systemInstruction } = body;

    // Validate required fields
    if (!audioData) {
      return NextResponse.json(
        { error: 'Audio data is required' },
        { status: 400 }
      );
    }

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Get model URL from environment variable
    const modelUrl = process.env.MODEL_API_URL || process.env.NEXT_PUBLIC_MODEL_API_URL;
    
    if (!modelUrl) {
      return NextResponse.json(
        { error: 'Model API URL is not configured. Please set MODEL_API_URL or NEXT_PUBLIC_MODEL_API_URL environment variable.' },
        { status: 500 }
      );
    }

    // Default system instruction if not provided
    const defaultSystemInstruction = `You are an AI assistant specialized in analyzing audio transcriptions and providing insights. 
You have access to detailed audio analysis data including:
- Transcription (original and English translation)
- Speaker diarization
- Emotion analysis
- Paralinguistic features (gender, pauses, energy)
- Audio events

Provide clear, concise, and helpful responses based on the audio analysis data provided.`;

    // Prepare the request payload for the hosted model
    const modelPayload = {
      audio_data: audioData,
      prompt: prompt.trim(),
      system_instruction: systemInstruction || defaultSystemInstruction,
    };

    // Send request to the hosted model
    const response = await fetch(modelUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any required headers for your model API
        ...(process.env.MODEL_API_KEY && {
          'Authorization': `Bearer ${process.env.MODEL_API_KEY}`,
        }),
        ...(process.env.MODEL_API_HEADER && JSON.parse(process.env.MODEL_API_HEADER)),
      },
      body: JSON.stringify(modelPayload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      console.error('Model API error:', response.status, errorText);
      return NextResponse.json(
        { 
          error: 'Failed to get response from model',
          details: `Status ${response.status}: ${errorText}` 
        },
        { status: response.status || 500 }
      );
    }

    const modelResponse = await response.json();

    // Extract the answer from the model response
    // Adjust this based on your model's response format
    const answer = modelResponse.answer || 
                   modelResponse.response || 
                   modelResponse.text || 
                   modelResponse.content ||
                   JSON.stringify(modelResponse);

    return NextResponse.json({
      answer,
      model_used: modelResponse.model || modelResponse.model_used || 'hosted-model',
      error: null,
    });

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
