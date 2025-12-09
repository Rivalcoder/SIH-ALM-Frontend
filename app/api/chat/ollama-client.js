/**
 * Direct Ollama Chat Client
 * 
 * Connects directly to Ollama API without using the FastAPI backend.
 * Handles audio analysis data formatting and chat interactions.
 */

class OllamaClient {
  /**
   * @param {string} baseUrl - Ollama server URL (e.g., http://localhost:11434, https://untraceable-tiara-fittingly.ngrok-free.dev)
   * @param {string} modelName - Ollama model name (e.g., ministral-3:3b)
   * @param {string} apiPath - API endpoint path (default: /api/chat)
   * @param {Object} customHeaders - Custom headers to include in requests
   */
  constructor(baseUrl = 'http://localhost:11434', modelName = 'ministral-3:3b', apiPath = '/api/chat', customHeaders = {}) {
    // Normalize URL (remove trailing slash)
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.modelName = modelName;
    // Ensure apiPath starts with slash
    this.apiPath = apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
    this.customHeaders = customHeaders;
    this.conversationHistory = [];
  }

  /**
   * Check if Ollama is running and accessible
   */
  async healthCheck() {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...this.customHeaders
      };

      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Ollama returned status ${response.status}`);
      }
      
      const data = await response.json();
      const modelNames = data.models?.map(m => m.name) || [];
      
      return {
        healthy: true,
        availableModels: modelNames,
        modelLoaded: modelNames.some(name => name.includes(this.modelName))
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        message: 'Cannot connect to Ollama. Make sure it is running: ollama serve'
      };
    }
  }

  /**
   * Format audio analysis data for the chat prompt
   * Ensures ALL audio processed fields are included:
   * - audio (metadata: sample_rate, duration, etc.)
   * - transcription (original_text, english_translation, segments, etc.)
   * - diarization (speaker segments)
   * - diarization_with_text (speaker segments with text)
   * - paralinguistics (emotion, gender, pauses, energy)
   * - audio_events (detected audio events)
   */
  formatAudioContext(audioResults) {
    if (!audioResults) return null;
    
    try {
      // Ensure all expected fields are included, even if null
      const fullAudioData = {
        audio: audioResults.audio || null,
        transcription: audioResults.transcription || null,
        diarization: audioResults.diarization || null,
        diarization_with_text: audioResults.diarization_with_text || null,
        paralinguistics: audioResults.paralinguistics || null,
        audio_events: audioResults.audio_events || null,
        // Include any additional fields that might be present
        ...audioResults
      };
      
      return JSON.stringify(fullAudioData, null, 2);
    } catch (error) {
      console.error('Error formatting audio context:', error);
      return null;
    }
  }

  /**
   * Build the system instruction for audio analysis
   */
  getSystemInstruction() {
    return `
You are an Audio Scene Understanding AI with multimodal reasoning. You "hear" the scene through structured metadata (transcription, translation, diarization, paralinguistics, acoustic events, timestamps, confidence).

Behavior:
- Be query-specific and concise. Lead with a natural-sounding 1–2 sentence answer.
- Ground every claim in the provided data. When useful, cite timestamps or confidences.
- Correlate speech, speakers, emotions, pauses, and non-speech events.
- If data is missing, say so briefly.
- Format the reply as Markdown suitable for React Markdown:
  - A short summary line.
  - Bulleted evidence (timestamps, speakers, events, emotions).
  - Optional "How I inferred it" bullet list if reasoning needs clarification.
  - No extra prose, no code fences unless the user explicitly asks.
    `.trim();
  }

  /**
   * Send a chat request to Ollama
   * 
   * @param {string} question - User's question
   * @param {Object} audioResults - Audio analysis results from process_audio
   * @param {Object} options - Additional options (temperature, maxTokens, etc.)
   */
  async chat(question, audioResults = null, options = {}) {
    const {
      temperature = 0.7,
      maxTokens = 512,
      stream = false
    } = options;

    try {
      // Build the user message
      let userContent = `User Question: ${question}`;
      
      if (audioResults) {
        const audioDataJson = this.formatAudioContext(audioResults);
        if (audioDataJson) {
          userContent += `\n\nAUDIO METADATA:\n${audioDataJson}\n\nUSER QUERY:\n${question}`;
          userContent += `\n\nRespond in Markdown only (no code blocks unless requested) with:`;
          userContent += `\n- A short, natural answer (1–2 sentences).`;
          userContent += `\n- Bulleted evidence with timestamps/speakers/events/emotions.`;
          userContent += `\n- Optional 'How I inferred it' bullets if needed.`;
          userContent += `\nIf data is missing, say so briefly.`;
        }
      }

      // Build messages array
      const messages = [
        {
          role: 'system',
          content: this.getSystemInstruction()
        },
        {
          role: 'user',
          content: userContent
        }
      ];

      // Construct endpoint and headers
      const apiUrl = `${this.baseUrl}${this.apiPath}`;
      const headers = {
        'Content-Type': 'application/json',
        ...this.customHeaders
      };

      // Make request to Ollama/FastAPI
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: this.modelName,
          messages: messages,
          stream: stream,
          options: {
            temperature: temperature,
            num_predict: maxTokens
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const answer = data.message?.content?.trim() || '';

      return {
        question: question,
        answer: answer,
        model_used: this.modelName,
        error: null
      };

    } catch (error) {
      console.error('Chat error:', error);
      return {
        question: question,
        answer: '',
        model_used: this.modelName,
        error: error.message
      };
    }
  }

  /**
   * Send a chat request with streaming response
   * 
   * @param {string} question - User's question
   * @param {Object} audioResults - Audio analysis results
   * @param {Function} onChunk - Callback for each streamed chunk
   * @param {Object} options - Additional options
   */
  async chatStream(question, audioResults = null, onChunk, options = {}) {
    const {
      temperature = 0.7,
      maxTokens = 512
    } = options;

    const handleChunk = typeof onChunk === 'function' ? onChunk : () => {};

    try {
      let userContent = `User Question: ${question}`;
      
      if (audioResults) {
        const audioDataJson = this.formatAudioContext(audioResults);
        if (audioDataJson) {
          userContent += `\n\nAUDIO METADATA:\n${audioDataJson}\n\nUSER QUERY:\n${question}`;
          userContent += `\n\nRespond in Markdown only (no code blocks unless requested) with:`;
          userContent += `\n- A short, natural answer (1–2 sentences).`;
          userContent += `\n- Bulleted evidence with timestamps/speakers/events/emotions.`;
          userContent += `\n- Optional 'How I inferred it' bullets if needed.`;
          userContent += `\nIf data is missing, say so briefly.`;
        }
      }

      const messages = [
        {
          role: 'system',
          content: this.getSystemInstruction()
        },
        {
          role: 'user',
          content: userContent
        }
      ];

      const apiUrl = `${this.baseUrl}${this.apiPath}`;
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        ...this.customHeaders
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: this.modelName,
          messages: messages,
          stream: true,
          options: {
            temperature: temperature,
            num_predict: maxTokens
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
      }

      if (!response.body) {
        throw new Error('No response body received from Ollama.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullAnswer = '';
      let buffer = '';

      const extractContent = (obj) =>
        obj?.message?.content ??
        obj?.choices?.[0]?.delta?.content ??
        obj?.choices?.[0]?.message?.content ??
        obj?.response ??
        obj?.text ??
        obj?.content;

      let streamDone = false;

      while (!streamDone) {
        const { done: readerDone, value } = await reader.read();

        if (readerDone) {
          streamDone = true;
        }

        if (value) {
          buffer += decoder.decode(value, { stream: true });
        }

        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || '';

        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line) continue;

          const payload = line.startsWith('data:') ? line.replace(/^data:\s*/, '') : line;

          if (payload === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const obj = JSON.parse(payload);
            const content = extractContent(obj);
            if (content) {
              fullAnswer += content;
              handleChunk(content);
              if (process.env.NODE_ENV === 'development') {
                console.log('[chatStream] chunk:', content.slice(0, 120));
              }
            } else if (payload) {
              // No recognized content field; emit raw payload
              fullAnswer += payload;
              handleChunk(payload);
            }
          } catch {
            // Non-JSON payload (plain text)
            fullAnswer += payload;
            handleChunk(payload);
          }
        }
      }

      // Flush any remaining buffered data
      if (buffer.trim()) {
        const payload = buffer.trim().startsWith('data:')
          ? buffer.trim().replace(/^data:\s*/, '')
          : buffer.trim();
        if (payload !== '[DONE]') {
          try {
            const obj = JSON.parse(payload);
            const content = extractContent(obj);
            if (content) {
              fullAnswer += content;
              handleChunk(content);
            } else {
              fullAnswer += payload;
              handleChunk(payload);
            }
          } catch {
            fullAnswer += payload;
            handleChunk(payload);
          }
        }
      }

      return {
        question: question,
        answer: fullAnswer,
        model_used: this.modelName,
        error: null
      };

    } catch (error) {
      console.error('Chat stream error:', error);
      return {
        question: question,
        answer: '',
        model_used: this.modelName,
        error: error.message
      };
    }
  }

  /**
   * Pull a model from Ollama library
   */
  async pullModel(modelName = null) {
    const model = modelName || this.modelName;
    
    try {
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: model })
      });

      if (!response.ok) {
        throw new Error(`Failed to pull model: ${response.status}`);
      }

      return { success: true, model: model };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Export for use in Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OllamaClient;
}

// Example usage
if (typeof window !== 'undefined') {
  window.OllamaClient = OllamaClient;
}

/* 
 * USAGE EXAMPLES:
 * 
 * // Initialize client
 * const client = new OllamaClient('http://localhost:11434', 'ministral-3:3b');
 * 
 * // Check health
 * const health = await client.healthCheck();
 * console.log(health);
 * 
 * // Chat without audio context
 * const response = await client.chat('Hello, how are you?');
 * console.log(response.answer);
 * 
 * // Chat with audio context
 * const audioResults = { transcription: {...}, diarization: {...} };
 * const response = await client.chat('What is the main topic?', audioResults);
 * console.log(response.answer);
 * 
 * // Streaming chat
 * await client.chatStream(
 *   'Summarize the conversation',
 *   audioResults,
 *   (chunk) => console.log(chunk),
 *   { temperature: 0.7, maxTokens: 1024 }
 * );
 */