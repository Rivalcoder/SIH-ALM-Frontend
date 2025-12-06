import { ProcessAudioResponse, ChatRequest, ChatResponse, HealthCheckResponse, DeleteSessionResponse } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

/**
 * Get the base URL for API requests
 */
export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

/**
 * Health check endpoint
 */
export async function healthCheck(): Promise<HealthCheckResponse> {
  const response = await fetch(`${API_BASE_URL}/health`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Process audio file
 */
export async function processAudio(file: File): Promise<ProcessAudioResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/process-audio`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Audio processing failed: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Chat about processed audio
 */
export async function chatAboutAudio(sessionId: string, question: string): Promise<ChatResponse> {
  const requestBody: ChatRequest = {
    session_id: sessionId,
    question,
  };

  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Chat request failed: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId: string): Promise<DeleteSessionResponse> {
  const response = await fetch(`${API_BASE_URL}/session/${sessionId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Delete session failed: ${response.status} - ${errorText}`);
  }

  return response.json();
}

