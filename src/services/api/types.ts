export interface ProcessAudioResponse {
    audio: {
        original_path: string;
        preprocessed_path: string;
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
        segments: Array<{
            id: number;
            start: number;
            end: number;
            text: string;
            words: Array<{
                word: string;
                start: number;
                end: number;
                probability: number;
            }>;
        }>;
    };
    diarization: {
        num_speakers: number;
        segments: Array<{
            speaker: string;
            start: number;
            end: number;
            duration: number;
            text: string;
        }>;
        speaker_stats: Record<string, {
            total_speaking_time: number;
            num_segments: number;
            speaking_percentage: number;
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
            rank: number;
            label: string;
            class_index: number;
            probability: number;
        }>;
    };
}

export interface ChatRequest {
    session_id?: string;
    question: string;
}

export interface ChatResponse {
    answer: string;
    sources: Array<{
        text: string;
        start: number;
        end: number;
    }>;
}

export interface HealthCheckResponse {
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    version: string;
}

export interface DeleteSessionResponse {
    status: 'success' | 'error';
    message: string;
}
