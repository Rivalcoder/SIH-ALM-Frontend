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
    // const urls = [SECONDARY_API_BASE_URL];
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
    // const urls = [SECONDARY_API_BASE_URL];
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
    // const urls = [SECONDARY_API_BASE_URL];
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
 * Delete a session
 */
export async function deleteSession(sessionId: string): Promise<DeleteSessionResponse> {
    const urls = [PRIMARY_API_BASE_URL, SECONDARY_API_BASE_URL];
    // const urls = [SECONDARY_API_BASE_URL];
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

/**
 * Chat with AI using full audio processed response
 * This sends the complete audio analysis data along with the prompt to a hosted model
 */
export async function chatWithAudioAnalysis(
    audioData: any,
    prompt: string,
    systemInstruction?: string
): Promise<ChatResponse> {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            audioData,
            prompt,
            systemInstruction,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
}
