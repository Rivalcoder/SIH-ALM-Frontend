import { ProcessAudioResponse } from "./types";
import { DatasetSample, DiarizationSegment, QuestionAnswer } from "@/lib/datasetSamples";
import { getLanguageName } from "@/lib/languageUtils";

/**
 * Maps backend API response to frontend DatasetSample format
 */
export function mapApiResponseToDatasetSample(
  apiResponse: ProcessAudioResponse,
  originalFileName: string
): DatasetSample {
  const { results, session_id } = apiResponse;
  const placeholderTranscript = results.transcription?.original_text || "";
  const isPlaceholder =
    placeholderTranscript.toLowerCase().includes("api is offline") ||
    placeholderTranscript.toLowerCase().includes("placeholder analysis") ||
    (session_id || "").startsWith("dummy_session_");

  // Map diarization segments
  const diarization: DiarizationSegment[] = (results.diarization?.segments || []).map((seg) => ({
    speaker: seg.speaker || "unknown",
    start: seg.start || 0,
    end: seg.end || 0,
  }));

  // Extract audio event from audio_events (skip "Speech" and get the first background event)
  // Debug: Log the audio_events structure to see what backend is sending
  console.log("Audio events from backend:", JSON.stringify(results.audio_events, null, 2));
  
  // Define speech keywords once (used for filtering)
  const speechKeywords = ['speech', 'speaker', 'voice', 'narration', 'monologue', 'synthesizer'];
  
  // Handle different possible structures from backend
  let eventsArray: any[] = [];
  
  // Case 1: events array exists
  if (results.audio_events?.events && Array.isArray(results.audio_events.events)) {
    eventsArray = results.audio_events.events;
  }
  // Case 2: audio_events is directly an array
  else if (Array.isArray(results.audio_events)) {
    eventsArray = results.audio_events;
  }
  
  const allBackgroundEvents: Array<{ name: string; score: number }> = [];
  let topAudioEvent: any = null;
  
  console.log("Processing events array:", eventsArray);
  
  for (const event of eventsArray) {
    // Backend sends: label, probability, class_index, rank
    const eventName = event.label || event.class || event.name || event.event || event.type || event.category || '';
    const eventNameLower = eventName.toLowerCase();
    
    // Extract probability - backend sends it as "probability" property
    // Use hasOwnProperty to check if it exists, as it might be 0 which is falsy
    let probability = 0;
    if (event.hasOwnProperty('probability')) {
      probability = typeof event.probability === 'number' ? event.probability : 0;
    } else if (event.hasOwnProperty('score')) {
      probability = typeof event.score === 'number' ? event.score : 0;
    } else if (event.hasOwnProperty('confidence')) {
      probability = typeof event.confidence === 'number' ? event.confidence : 0;
    }
    
    console.log(`Event: ${eventName}, Has probability property: ${event.hasOwnProperty('probability')}, Raw value: ${event.probability}, Extracted: ${probability}, Percentage: ${(probability * 100).toFixed(2)}%, IsSpeech: ${speechKeywords.some(keyword => eventNameLower.includes(keyword))}`);
    
    // Skip speech-related events
    const isSpeechEvent = speechKeywords.some(keyword => eventNameLower.includes(keyword));
    
    if (!isSpeechEvent && eventName) {
      // Add to all background events with probability (0-1 range)
      allBackgroundEvents.push({
        name: eventName,
        score: probability  // Store probability (0-1), will be converted to percentage in UI
      });
      
      // Set as top audio event if not set yet (first non-speech event)
      if (!topAudioEvent) {
        topAudioEvent = event;
      }
    }
  }
  
  console.log("All background events with probabilities:", allBackgroundEvents.map(e => ({ name: e.name, probability: e.score, percentage: (e.score * 100).toFixed(2) + '%' })));
  
  // Sort by score descending
  allBackgroundEvents.sort((a, b) => b.score - a.score);
  
  console.log("All background events extracted:", allBackgroundEvents);
  
  // If no non-speech event found, fall back to the first event (but still try to get name)
  if (!topAudioEvent && eventsArray.length > 0) {
    topAudioEvent = eventsArray[0];
  }
  
  console.log("Top audio event (background):", topAudioEvent);
  
  // Try multiple possible property names for the event class
  // Backend sends: label, probability, class_index, rank
  let audioEventName: string | undefined;
  if (topAudioEvent) {
    // Try various property names (label is primary for this backend)
    audioEventName = topAudioEvent.label || 
                     topAudioEvent.class || 
                     topAudioEvent.name || 
                     topAudioEvent.event ||
                     topAudioEvent.type ||
                     topAudioEvent.category ||
                     (typeof topAudioEvent === 'string' ? topAudioEvent : undefined);
  }
  
  const audioEvent = audioEventName
    ? String(audioEventName).toLowerCase().replace(/\s+/g, "_")
    : "unknown";
  
  console.log("Mapped audio event:", audioEvent);

  // Map paralinguistics
  const paralinguistics = {
    pitch: {
      mean: results.paralinguistics?.gender?.mean_pitch_hz || 0,
      std: 0, // Not provided by backend
      min: (results.paralinguistics?.gender?.mean_pitch_hz || 0) * 0.8, // Estimate
      max: (results.paralinguistics?.gender?.mean_pitch_hz || 0) * 1.2, // Estimate
    },
    emotions: results.paralinguistics?.emotion?.all_emotions || {},
    dominant_emotion: results.paralinguistics?.emotion?.emotion?.toLowerCase() || "neutral",
    speaking_rate: 0, // Not provided by backend, could be calculated
    energy: {
      mean_energy: results.paralinguistics?.energy?.mean_energy ?? 0,
      energy_db: results.paralinguistics?.energy?.energy_db ?? null,
      min_energy: results.paralinguistics?.energy?.min_energy ?? null,
      max_energy: results.paralinguistics?.energy?.max_energy ?? null,
      energy_variance: results.paralinguistics?.energy?.energy_variance ?? null,
    },
    gender: {
      gender: results.paralinguistics?.gender?.gender || "unknown",
      confidence: results.paralinguistics?.gender?.confidence ?? null,
      all_scores: results.paralinguistics?.gender?.all_scores || {},
    },
    spectral_centroid: 0, // Not provided by backend
    background_events: allBackgroundEvents, // Store all background events with scores
    diarization_with_text: results.diarization_with_text?.segments || [], // Store diarization with text for proper transcript display
  };

  // Generate Q&A pairs from transcription and analysis
  const questionAnswerPair: QuestionAnswer[] = [
    {
      question: "What is the primary language detected?",
      answer: results.transcription?.detected_language
        ? `${getLanguageName(results.transcription.detected_language)} (confidence: ${((results.transcription.language_confidence || 0) * 100).toFixed(1)}%)`
        : "Unknown",
    },
    {
      question: "What is the transcribed text?",
      answer: results.transcription?.original_text || "No transcription available",
    },
    {
      question: "How many speakers were detected?",
      answer: `${results.diarization?.num_speakers || 0} speaker${(results.diarization?.num_speakers || 0) !== 1 ? "s" : ""}`,
    },
    {
      question: "What is the dominant emotion?",
      answer: results.paralinguistics?.emotion?.emotion
        ? `${results.paralinguistics.emotion.emotion} (confidence: ${((results.paralinguistics.emotion.confidence || 0) * 100).toFixed(1)}%)`
        : "Unknown",
    },
    {
      question: "What audio events were detected?",
      answer: (() => {
        let events: any[] = [];
        
        // Handle different structures
        if (results.audio_events?.events && Array.isArray(results.audio_events.events) && results.audio_events.events.length > 0) {
          events = results.audio_events.events;
        } else if (Array.isArray(results.audio_events) && results.audio_events.length > 0) {
          events = results.audio_events;
        }
        
        if (events.length > 0) {
          // Show all events (not just first 3) so they can all be displayed
          return events
            .map((e) => {
              // Backend sends: label, probability, class_index, rank
              const eventName = e.label || e.class || e.name || e.event || e.type || "unknown";
              // Probability is already 0-1, multiply by 100 for percentage
              const probability = e.probability !== undefined ? e.probability : (e.score || e.confidence || 0);
              return `${eventName} (${(probability * 100).toFixed(1)}%)`;
            })
            .join(", ");
        }
        return "No audio events detected";
      })(),
    },
  ];

  // Determine source based on detected language
  const language = results.transcription?.detected_language?.toLowerCase() || "unknown";
  const source = `openslr_${language}+esc50`;

  return {
    audio_id: session_id,
    language: language,
    duration: parseFloat((results.audio?.duration_s || 0).toFixed(2)),
    transcription: results.transcription?.original_text || "",
    is_placeholder: isPlaceholder,
    diarization: diarization,
    audio_event: audioEvent,
    paralinguistics: paralinguistics,
    source: source,
    speech_source: {
      type: `openslr_${language}`,
      original_file: originalFileName,
      utterance_id: originalFileName.replace(/\.[^/.]+$/, ""),
    },
    nonspeech_source: {
      audio_event: audioEvent,
      source: "esc50",
      original_file: `nonspeech-${audioEvent}.wav`,
    },
    mixing_ratios: {
      speech: 0.7, // Default estimate
      nonspeech: 0.3, // Default estimate
    },
    question_answer_pair: questionAnswerPair,
  };
}

