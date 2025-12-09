/**
 * Utility functions for caching AI-generated content
 */

/**
 * Simple hash function that works with Unicode strings
 */
function simpleHash(str: string): string {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  
  // Convert string to array of character codes (handles Unicode)
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to positive hex string
  return Math.abs(hash).toString(36);
}

/**
 * Generate a cache key from analysis data
 */
export function generateAnalysisCacheKey(analysis: any): string {
  // Use transcription + duration + language as the key (unique enough for caching)
  const keyData = {
    transcription: analysis.transcription || '',
    duration: analysis.duration || 0,
    language: analysis.language || '',
    sessionId: (analysis as any).session_id || '',
  };
  
  // Create a hash from the key data using Unicode-safe hashing
  const keyString = JSON.stringify(keyData);
  const hash = simpleHash(keyString);
  
  // Also include a short version of transcription for uniqueness
  const transcriptionHash = simpleHash(keyData.transcription.substring(0, 100));
  
  return `ai_cache_${hash}_${transcriptionHash}`;
}

/**
 * Generate a cache key for translation
 */
export function generateTranslationCacheKey(text: string, targetLanguage: string): string {
  // Use Unicode-safe hashing
  const textHash = simpleHash(text.substring(0, 200)); // Use first 200 chars for hash
  const langHash = simpleHash(targetLanguage);
  return `ai_translation_${textHash}_${langHash}`;
}

/**
 * Get cached AI result
 */
export function getCachedAIResult<T>(cacheKey: string): T | null {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Check if cache is still valid (not expired - 7 days)
      if (parsed.timestamp && Date.now() - parsed.timestamp < 7 * 24 * 60 * 60 * 1000) {
        return parsed.data as T;
      } else {
        // Remove expired cache
        localStorage.removeItem(cacheKey);
      }
    }
  } catch (error) {
    console.error('Error reading from cache:', error);
  }
  return null;
}

/**
 * Set cached AI result
 */
export function setCachedAIResult<T>(cacheKey: string, data: T): void {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error writing to cache:', error);
    // If storage is full, try to clear old cache entries
    try {
      const keys = Object.keys(localStorage);
      const aiCacheKeys = keys.filter(k => k.startsWith('ai_cache_') || k.startsWith('ai_translation_'));
      // Remove oldest 10 entries if storage is full
      if (aiCacheKeys.length > 50) {
        const entries = aiCacheKeys.map(key => ({
          key,
          timestamp: JSON.parse(localStorage.getItem(key) || '{}').timestamp || 0,
        })).sort((a, b) => a.timestamp - b.timestamp);
        
        entries.slice(0, 10).forEach(entry => {
          localStorage.removeItem(entry.key);
        });
      }
      // Retry setting the cache
      localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (retryError) {
      console.error('Failed to cache AI result after cleanup:', retryError);
    }
  }
}

