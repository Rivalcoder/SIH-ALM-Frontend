import { ProcessAudioResponse, ChatRequest, ChatResponse, HealthCheckResponse, DeleteSessionResponse } from "./types";

const PRIMARY_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://untraceable-tiara-fittingly.ngrok-free.dev";
const SECONDARY_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_SECONDARY || "http://localhost:8000";

/**
 * Get the base URL for API requests
 */
export function getApiBaseUrl(): string {
  return PRIMARY_API_BASE_URL;
}

/**
 * Try multiple URLs in sequence and return the first successful response
 */
async function fetchWithFallback(
  endpoint: string,
  options: RequestInit,
  urls: string[]
): Promise<Response> {
  const errors: Array<{ url: string; error: string }> = [];

  for (const baseUrl of urls) {
    try {
      const url = `${baseUrl}${endpoint}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 100000); // 10 second timeout

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Check if response is ok (status 200-299)
      if (response.ok) {
        return response;
      }

      // If not ok, try next URL
      const errorText = await response.text().catch(() => response.statusText);
      errors.push({ url, error: `Status ${response.status}: ${errorText}` });
    } catch (error: any) {
      const errorMessage = error.name === 'AbortError'
        ? 'Request timeout'
        : error.message || 'Network error';
      errors.push({ url: `${baseUrl}${endpoint}`, error: errorMessage });
    }
  }

  // All URLs failed
  const errorDetails = errors.map(e => `  - ${e.url}: ${e.error}`).join('\n');
  throw new Error(
    `All API endpoints failed:\n${errorDetails}\n\nPlease check your network connection and ensure the API server is running.`
  );
}

/**
 * Health check endpoint
 */
export async function healthCheck(): Promise<HealthCheckResponse> {
  const urls = [PRIMARY_API_BASE_URL, SECONDARY_API_BASE_URL];
  const response = await fetchWithFallback(
    "/health",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
    urls
  );

  return response.json();
}

/**
 * Process audio file
 */
export async function processAudio(file: File): Promise<ProcessAudioResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const urls = [PRIMARY_API_BASE_URL, SECONDARY_API_BASE_URL];
  const response = await fetchWithFallback(
    "/process-audio",
    {
      method: "POST",
      body: formData,
    },
    urls
  );

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

  const urls = [PRIMARY_API_BASE_URL, SECONDARY_API_BASE_URL];
  const response = await fetchWithFallback(
    "/chat",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    },
    urls
  );

  return response.json();
}

/**
 * Stream chat about processed audio (SSE)
 */
export async function chatAboutAudioStream(
  sessionId: string,
  question: string,
  onChunk: (text: string) => void
): Promise<ChatResponse> {
  const requestBody: ChatRequest & { stream?: boolean } = {
    session_id: sessionId,
    question,
    stream: true,
  };

  const urls = [PRIMARY_API_BASE_URL, SECONDARY_API_BASE_URL];
  let lastError: Error | null = null;

  for (const baseUrl of urls) {
    try {
      const response = await fetch(`${baseUrl}/chat?stream=true`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok || !response.body) {
        lastError = new Error(`Stream request failed with status ${response.status}`);
        continue;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullAnswer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;

          try {
            const data = JSON.parse(payload);
            const chunk = data.content || "";
            if (chunk) {
              fullAnswer += chunk;
              onChunk(chunk);
            }
            if (data.done) {
              return {
                question,
                answer: fullAnswer,
                model_used: null,
                error: null,
              };
            }
          } catch (err) {
            console.warn("Failed to parse stream chunk", err);
          }
        }
      }

      // Stream ended without done flag
      return {
        question,
        answer: fullAnswer,
        model_used: null,
        error: null,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown streaming error");
      continue;
    }
  }

  throw lastError || new Error("Failed to stream chat response");
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId: string): Promise<DeleteSessionResponse> {
  const urls = [PRIMARY_API_BASE_URL, SECONDARY_API_BASE_URL];
  const response = await fetchWithFallback(
    `/session/${sessionId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    },
    urls
  );

  return response.json();
}

