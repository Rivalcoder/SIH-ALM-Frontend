/**
 * Direct Ollama Chat Client
 * 
 * Connects directly to Ollama API without using the FastAPI backend.
 * Handles audio analysis data formatting and chat interactions.
 */

class OllamaClient {
  constructor(baseUrl = 'http://localhost:11434', modelName = 'ministral-3:3b') {
    this.baseUrl = baseUrl;
    this.modelName = modelName;
    this.conversationHistory = [];
  }

  /**
   * Check if Ollama is running and accessible
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
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
   */
  formatAudioContext(audioResults) {
    if (!audioResults) return null;
    
    try {
      return JSON.stringify(audioResults, null, 2);
    } catch (error) {
      console.error('Error formatting audio context:', error);
      return null;
    }
  }

  /**
   * Build the system instruction for audio analysis
   */
  getSystemInstruction() {
    return `You are an AI assistant that helps users understand audio content. 
You will receive audio analysis results in JSON format containing 
transcription, diarization, paralinguistics (emotion, pauses, energy), 
and audio events. Answer the user's questions based on this data clearly 
and concisely. If the question cannot be answered from the provided data, 
explicitly say that it cannot be determined from the audio analysis.`;
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
          userContent += `\n\nAudio Analysis Data (JSON):\n${audioDataJson}`;
          userContent += `\n\nPlease answer the user's question based only on the audio analysis data provided above.`;
          userContent += `\nIf something is not present in the data, say that it is not available.`;
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

      // Make request to Ollama
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        const errorText = await response.text();
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

    try {
      let userContent = `User Question: ${question}`;
      
      if (audioResults) {
        const audioDataJson = this.formatAudioContext(audioResults);
        if (audioDataJson) {
          userContent += `\n\nAudio Analysis Data (JSON):\n${audioDataJson}`;
          userContent += `\n\nPlease answer the user's question based only on the audio analysis data provided above.`;
          userContent += `\nIf something is not present in the data, say that it is not available.`;
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

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullAnswer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            const content = data.message?.content || '';
            
            if (content) {
              fullAnswer += content;
              onChunk(content);
            }

            if (data.done) {
              return {
                question: question,
                answer: fullAnswer,
                model_used: this.modelName,
                error: null
              };
            }
          } catch (e) {
            console.warn('Error parsing stream chunk:', e);
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