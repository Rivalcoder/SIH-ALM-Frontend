"use server";

import { NextRequest, NextResponse } from 'next/server';
import OllamaClient from './ollama-client.js'; // adjust path

const client = new OllamaClient(
  process.env.OLLAMA_URL || 'http://localhost:11434',
  process.env.OLLAMA_MODEL || 'ministral-3:3b'
);

export async function POST(request: NextRequest) {
  const { audioResults, prompt } = await request.json();
  const response = await client.chat(prompt, audioResults);
  return NextResponse.json(response);
}