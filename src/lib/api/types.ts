// Backend API Response Types

export interface HealthCheckResponse {
  status: "ok" | "healthy";
  message?: string;
  model_loaded: boolean;
  chat_available?: boolean;
}

export interface ProcessAudioResponse {
  session_id: string;
  filename: string;
  results: {
    audio: {
      original_path: string;
      preprocessed_path: string | null;
      sample_rate: number;
      num_samples: number;
      duration_s: number;
    };
    transcription: {
      original_text: string;
      english_translation: string;
      detected_language: string;
      language_confidence: number;
      model_used: string;
      segments?: Array<{
        id: number;
        start: number;
        end: number;
        text: string;
        words?: Array<{
          word: string;
          start: number;
          end: number;
        }>;
      }>;
    };
    diarization: {
      num_speakers: number;
      segments: Array<{
        speaker: string;
        start: number;
        end: number;
      }>;
    };
    diarization_with_text: {
      num_speakers: number;
      segments: Array<{
        speaker: string;
        start: number;
        end: number;
        text: string;
        language?: string;
      }>;
    };
    paralinguistics: {
      audio: {
        sample_rate: number;
        num_samples: number;
        duration_s: number;
      };
      emotion: {
        emotion: string;
        confidence: number;
        all_emotions: Record<string, number>;
      };
      gender: {
        gender: string;
        confidence: number;
        mean_pitch_hz: number;
        all_scores: Record<string, number>;
      };
      pauses: {
        num_pauses: number;
        total_pause_duration: number;
        avg_pause_duration: number;
        pause_segments: Array<{
          start: number;
          end: number;
          duration: number;
        }>;
      };
      energy: {
        mean_energy: number;
        max_energy: number;
        min_energy: number;
        energy_variance: number;
        energy_db: number;
      };
    };
    audio_events: {
      top_k: number;
      events: Array<{
        class: string;
        score: number;
        index: number;
      }>;
    };
  };
}

export interface ChatRequest {
  session_id: string;
  question: string;
}

export interface ChatResponse {
  question: string;
  answer: string;
  model_used: string | null;
  error: string | null;
}

export interface DeleteSessionResponse {
  message: string;
}

