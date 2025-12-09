/**
 * Language code to full name mapping
 */
const LANGUAGE_NAMES: Record<string, string> = {
  'hi': 'Hindi',
  'ta': 'Tamil',
  'te': 'Telugu',
  'kn': 'Kannada',
  'en': 'English',
  'bn': 'Bengali',
  'ur': 'Urdu',
  'zh': 'Chinese',
  'ko': 'Korean',
  'ja': 'Japanese',
  'mr': 'Marathi',
  'gu': 'Gujarati',
  'pa': 'Punjabi',
  'or': 'Odia',
  'as': 'Assamese',
  'ml': 'Malayalam',
  'ne': 'Nepali',
  'si': 'Sinhala',
};

/**
 * Get the full language name from a language code
 * @param code Language code (e.g., 'hi', 'ta', 'te')
 * @returns Full language name (e.g., 'Hindi', 'Tamil', 'Telugu')
 */
export function getLanguageName(code: string): string {
  if (!code) return 'Unknown';
  
  const normalizedCode = code.toLowerCase().trim();
  return LANGUAGE_NAMES[normalizedCode] || code.charAt(0).toUpperCase() + code.slice(1);
}

