import { generateText } from 'ai';
import { getCachedAIResult, setCachedAIResult, generateAnalysisCacheKey, generateTranslationCacheKey } from './aiCache';

/**
 * Generate text using Vercel AI SDK with Gemini model
 */
export async function generateAIText(prompt: string, systemPrompt?: string, cacheKey?: string): Promise<string> {
  // Check cache first if cache key is provided
  if (cacheKey) {
    const cached = getCachedAIResult<string>(cacheKey);
    if (cached) {
      console.log('Using cached AI result for:', cacheKey);
      return cached;
    }
  }
  try {
    // Call API route that handles AI generation
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        systemPrompt: systemPrompt || 'You are a helpful AI assistant that provides clear and concise responses.',
      }),
    });

    if (!response.ok) {
      throw new Error('AI generation failed');
    }

    const data = await response.json();
    const result = data.text;
    
    // Cache the result if cache key is provided
    if (cacheKey && result) {
      setCachedAIResult(cacheKey, result);
    }
    
    return result;
  } catch (error) {
    console.error('AI text generation failed:', error);
    throw error;
  }
}

/**
 * Generate analysis summary from complete analysis data
 */
export async function generateAnalysisSummary(analysis: any): Promise<string> {
  // Generate cache key for this analysis
  const cacheKey = `${generateAnalysisCacheKey(analysis)}_summary`;
  
  // Check cache first
  const cached = getCachedAIResult<string>(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Count unique speakers
  const uniqueSpeakers = new Set(
    (analysis.diarization || []).map((seg: any) => seg.speaker).filter(Boolean)
  );
  const speakerCount = uniqueSpeakers.size || analysis.diarization?.length || 0;

  // Get language name
  const { getLanguageName } = await import("@/lib/languageUtils");
  const languageName = getLanguageName(analysis.language);

  // Format audio event
  const audioEvent = analysis.audio_event?.replace(/_/g, " ") || "unknown";
  
  // Get background events if available
  const paralinguistics = analysis.paralinguistics as any;
  const backgroundEvents = paralinguistics?.background_events || [];
  const backgroundEventsText = backgroundEvents.length > 0
    ? backgroundEvents.map((e: any) => `${e.name} (${(e.score * 100).toFixed(1)}%)`).join(", ")
    : audioEvent;

  // Get emotion details
  const dominantEmotion = paralinguistics?.dominant_emotion || 'neutral';
  const emotions = paralinguistics?.emotions || {};

  const prompt = `Based on the following complete audio analysis data, create a comprehensive and natural summary in 3-5 sentences:

Complete Audio Analysis:
- Language: ${languageName} (${analysis.language})
- Duration: ${analysis.duration}s
- Unique Speakers: ${speakerCount}
- Transcription: ${analysis.transcription?.substring(0, 500)}${analysis.transcription?.length > 500 ? '...' : ''}
- Background Events: ${backgroundEventsText}
- Non-speech Ratio: ${(analysis.mixing_ratios?.nonspeech * 100).toFixed(0)}%
- Speech Ratio: ${(analysis.mixing_ratios?.speech * 100).toFixed(0)}%
- Dominant Emotion: ${dominantEmotion}
- All Emotions: ${Object.entries(emotions).map(([e, v]: [string, any]) => `${e}: ${(v * 100).toFixed(1)}%`).join(", ")}
- Question-Answer Pairs Generated: ${analysis.question_answer_pair?.length || 0}
${analysis.question_answer_pair?.length > 0 ? `- Sample Q&A: ${analysis.question_answer_pair.slice(0, 2).map((qa: any) => `Q: ${qa.question} A: ${qa.answer}`).join("; ")}` : ''}

Create a natural, flowing, and comprehensive summary that captures all the key aspects of this audio analysis in a professional manner.`;

  const systemPrompt = 'You are a professional writer. You write simple, clear, and concise content. Summarize audio analysis data in a natural, readable format that highlights the most important findings.';

  return generateAIText(prompt, systemPrompt, cacheKey);
}

/**
 * Translate text to target language
 */
export async function translateText(text: string, targetLanguage: string): Promise<string> {
  if (targetLanguage === 'Original') {
    return text;
  }

  // Generate cache key for this translation
  const cacheKey = generateTranslationCacheKey(text, targetLanguage);
  
  // Check cache first
  const cached = getCachedAIResult<string>(cacheKey);
  if (cached) {
    return cached;
  }

  const languageMap: Record<string, string> = {
    'English': 'English',
    'Tamil': 'Tamil',
    'Hindi': 'Hindi',
    'Telugu': 'Telugu',
  };

  const targetLang = languageMap[targetLanguage] || targetLanguage;

  const prompt = `Translate the following text to ${targetLang}. 

IMPORTANT RULES:
1. ONLY provide the translation - NO explanations, NO analysis, NO commentary
2. Preserve ALL speaker labels exactly (e.g., "SPEAKER_00:", "SPEAKER_01:")
3. Keep the EXACT same format and line breaks
4. Translate ONLY the text after the speaker label, keep the speaker label unchanged

Text to translate:
${text}

Provide ONLY the translation with the same format:`;

  const systemPrompt = 'You are a professional translator. Translate text directly without any explanations, analysis, or commentary. Your output must be ONLY the translated text with speaker labels preserved exactly as they appear in the input. Do not add any additional text, explanations, or formatting changes.';

  return generateAIText(prompt, systemPrompt, cacheKey);
}

/**
 * Extract action items from analysis
 */
export async function extractActionItems(analysis: any): Promise<string[]> {
  // Generate cache key for this analysis
  const cacheKey = `${generateAnalysisCacheKey(analysis)}_actionItems`;
  
  // Check cache first
  const cached = getCachedAIResult<string[]>(cacheKey);
  if (cached) {
    return cached;
  }
  
  const prompt = `Analyze the following audio transcription and Q&A pairs to identify action items or tasks mentioned:

Transcription: ${analysis.transcription}

Q&A Pairs:
${analysis.question_answer_pair?.map((qa: any) => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n') || 'None'}

List only specific action items or tasks that were mentioned. Return as a JSON array of strings. If no action items are found, return an empty array.`;

  const systemPrompt = 'You are an AI assistant that extracts action items and tasks from audio transcripts. Return only a JSON array of action items.';

  try {
    const result = await generateAIText(prompt, systemPrompt, cacheKey);
    // Try to parse as JSON, fallback to splitting by lines
    let parsed: string[];
    try {
      parsed = JSON.parse(result);
    } catch {
      parsed = result.split('\n').filter(line => line.trim()).map(line => line.replace(/^[-•*]\s*/, '').trim());
    }
    
    // Cache the result
    setCachedAIResult(cacheKey, parsed);
    return parsed;
  } catch (error) {
    console.error('Failed to extract action items:', error);
    return [];
  }
}

/**
 * Extract key decisions from analysis
 */
export async function extractKeyDecisions(analysis: any): Promise<string[]> {
  // Generate cache key for this analysis
  const cacheKey = `${generateAnalysisCacheKey(analysis)}_keyDecisions`;
  
  // Check cache first
  const cached = getCachedAIResult<string[]>(cacheKey);
  if (cached) {
    return cached;
  }
  
  const prompt = `Analyze the following audio transcription and Q&A pairs to identify key decisions made:

Transcription: ${analysis.transcription}

Q&A Pairs:
${analysis.question_answer_pair?.map((qa: any) => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n') || 'None'}

List only specific decisions that were made or discussed. Return as a JSON array of strings. If no decisions are found, return an empty array.`;

  const systemPrompt = 'You are an AI assistant that extracts key decisions from audio transcripts. Return only a JSON array of decisions.';

  try {
    const result = await generateAIText(prompt, systemPrompt, cacheKey);
    let parsed: string[];
    try {
      parsed = JSON.parse(result);
    } catch {
      parsed = result.split('\n').filter(line => line.trim()).map(line => line.replace(/^[-•*]\s*/, '').trim());
    }
    
    // Cache the result
    setCachedAIResult(cacheKey, parsed);
    return parsed;
  } catch (error) {
    console.error('Failed to extract key decisions:', error);
    return [];
  }
}

/**
 * Extract key topics from analysis
 */
export async function extractKeyTopics(analysis: any): Promise<string[]> {
  // Generate cache key for this analysis
  const cacheKey = `${generateAnalysisCacheKey(analysis)}_keyTopics`;
  
  // Check cache first
  const cached = getCachedAIResult<string[]>(cacheKey);
  if (cached) {
    return cached;
  }
  
  const prompt = `Analyze the following audio transcription and Q&A pairs to identify key topics discussed:

Transcription: ${analysis.transcription}

Q&A Pairs:
${analysis.question_answer_pair?.map((qa: any) => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n') || 'None'}

List the main topics or themes discussed. Return as a JSON array of strings.`;

  const systemPrompt = 'You are an AI assistant that extracts key topics from audio transcripts. Return only a JSON array of topics.';

  try {
    const result = await generateAIText(prompt, systemPrompt, cacheKey);
    let parsed: string[];
    try {
      parsed = JSON.parse(result);
    } catch {
      parsed = result.split('\n').filter(line => line.trim()).map(line => line.replace(/^[-•*]\s*/, '').trim());
    }
    
    // Cache the result
    setCachedAIResult(cacheKey, parsed);
    return parsed;
  } catch (error) {
    console.error('Failed to extract key topics:', error);
    return [];
  }
}

