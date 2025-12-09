import { ProcessAudioResponse } from "./types";

/**
 * Generate dummy ProcessAudioResponse data for fallback when API fails
 */
export function generateDummyAudioResponse(filename: string): ProcessAudioResponse {
  const sessionId = `dummy_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const duration = 30.5; // Default duration in seconds
  const sampleRate = 16000;
  const numSamples = Math.floor(duration * sampleRate);
  const numSpeakers = 2;

  // Generate dummy diarization segments
  const segmentDuration = duration / numSpeakers;
  const diarizationSegments = Array.from({ length: numSpeakers }, (_, i) => ({
    speaker: `spk_${i}`,
    start: i * segmentDuration,
    end: (i + 1) * segmentDuration,
  }));

  // Generate dummy diarization with text
  const diarizationWithText = diarizationSegments.map((seg, i) => ({
    speaker: seg.speaker,
    start: seg.start,
    end: seg.end,
    text: `Speaker ${i + 1} transcript is unavailable while the API is offline.`,
    language: "english",
  }));

  // Generate dummy transcription segments
  const transcriptionSegments = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    start: (i * duration) / 5,
    end: ((i + 1) * duration) / 5,
    text: `Transcript segment ${i + 1} is unavailable while the API is offline.`,
    words: [
      { word: "offline", start: (i * duration) / 5, end: (i * duration) / 5 + 0.8 },
      { word: "placeholder", start: (i * duration) / 5 + 0.8, end: (i * duration) / 5 + 1.6 },
    ],
  }));

  // Generate dummy audio events (using label and probability as preferred by mapper)
  const audioEvents = [
    { label: "speech", probability: 0.95, class: "speech", score: 0.95, index: 0, class_index: 0, rank: 1 },
    { label: "background_music", probability: 0.65, class: "background_music", score: 0.65, index: 1, class_index: 1, rank: 2 },
    { label: "crowd_noise", probability: 0.45, class: "crowd_noise", score: 0.45, index: 2, class_index: 2, rank: 3 },
    { label: "air_conditioning", probability: 0.35, class: "air_conditioning", score: 0.35, index: 3, class_index: 3, rank: 4 },
    { label: "footsteps", probability: 0.25, class: "footsteps", score: 0.25, index: 4, class_index: 4, rank: 5 },
  ];

  // Generate dummy emotions
  const allEmotions: Record<string, number> = {
    neutral: 0.4,
    happy: 0.3,
    calm: 0.15,
    sad: 0.1,
    angry: 0.05,
  };

  // Generate dummy pause segments
  const pauseSegments = [
    { start: 5.0, end: 5.8, duration: 0.8 },
    { start: 12.5, end: 13.2, duration: 0.7 },
    { start: 20.0, end: 20.6, duration: 0.6 },
    { start: 25.5, end: 26.0, duration: 0.5 },
  ];

  const placeholderTranscript =
    "Transcription unavailable because the API is offline. Try again once connectivity is restored.";

  return {
    session_id: sessionId,
    filename: filename,
    results: {
      audio: {
        original_path: `/audio/${filename}`,
        preprocessed_path: `/audio/preprocessed_${filename}`,
        sample_rate: sampleRate,
        num_samples: numSamples,
        duration_s: duration,
      },
      transcription: {
        original_text: placeholderTranscript,
        english_translation: placeholderTranscript,
        detected_language: "english",
        language_confidence: 0.92,
        model_used: "whisper-large-v3",
        segments: transcriptionSegments,
      },
      diarization: {
        num_speakers: numSpeakers,
        segments: diarizationSegments,
      },
      diarization_with_text: {
        num_speakers: numSpeakers,
        segments: diarizationWithText,
      },
      paralinguistics: {
        audio: {
          sample_rate: sampleRate,
          num_samples: numSamples,
          duration_s: duration,
        },
        emotion: {
          emotion: "neutral",
          confidence: 0.85,
          all_emotions: allEmotions,
        },
        gender: {
          gender: "mixed",
          confidence: 0.75,
          mean_pitch_hz: 180.5,
          all_scores: {
            male: 0.45,
            female: 0.55,
          },
        },
        pauses: {
          num_pauses: pauseSegments.length,
          total_pause_duration: pauseSegments.reduce((sum, seg) => sum + seg.duration, 0),
          avg_pause_duration: pauseSegments.reduce((sum, seg) => sum + seg.duration, 0) / pauseSegments.length,
          pause_segments: pauseSegments,
        },
        energy: {
          mean_energy: 0.65,
          max_energy: 0.95,
          min_energy: 0.15,
          energy_variance: 0.12,
          energy_db: -12.5,
        },
      },
      audio_events: {
        top_k: 5,
        events: audioEvents,
      },
    },
  };
}
