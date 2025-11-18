/**
 * Universal language detection based on Unicode character ranges
 */

import { Language } from "@/lib/constants";

/**
 * Detects the language/script of the input text based on Unicode ranges
 * @param text - The text to analyze
 * @returns The detected language
 */
export function detectLanguage(text: string): Language {
  if (!text || text.trim().length === 0) {
    return Language.ENGLISH; // Default to English for empty input
  }

  // Get first meaningful character (skip spaces and punctuation)
  const trimmed = text.trim();
  let firstChar = trimmed[0];
  let charCode = firstChar.charCodeAt(0);

  // If first character is punctuation/number, look at more characters
  for (let i = 0; i < Math.min(trimmed.length, 5); i++) {
    const char = trimmed[i];
    const code = char.charCodeAt(0);
    
    // Skip common punctuation and numbers
    if ((code >= 33 && code <= 64) || (code >= 91 && code <= 96) || (code >= 123 && code <= 126)) {
      continue;
    }
    
    firstChar = char;
    charCode = code;
    break;
  }

  // Korean (Hangul)
  // Hangul Syllables: U+AC00 to U+D7AF
  // Hangul Jamo: U+1100 to U+11FF
  // Hangul Compatibility Jamo: U+3130 to U+318F
  if (
    (charCode >= 0xac00 && charCode <= 0xd7af) ||
    (charCode >= 0x1100 && charCode <= 0x11ff) ||
    (charCode >= 0x3130 && charCode <= 0x318f)
  ) {
    return Language.KOREAN;
  }

  // Japanese
  // Hiragana: U+3040 to U+309F
  // Katakana: U+30A0 to U+30FF
  // Katakana Phonetic Extensions: U+31F0 to U+31FF
  if (
    (charCode >= 0x3040 && charCode <= 0x309f) ||
    (charCode >= 0x30a0 && charCode <= 0x30ff) ||
    (charCode >= 0x31f0 && charCode <= 0x31ff)
  ) {
    return Language.JAPANESE;
  }

  // Chinese (CJK Unified Ideographs)
  // CJK Unified Ideographs: U+4E00 to U+9FFF
  // CJK Extension A: U+3400 to U+4DBF
  // Note: Japanese also uses Kanji (Chinese characters), so this check comes after Japanese
  if (
    (charCode >= 0x4e00 && charCode <= 0x9fff) ||
    (charCode >= 0x3400 && charCode <= 0x4dbf)
  ) {
    // Check if there are any Hiragana/Katakana in the text (would indicate Japanese)
    for (let i = 0; i < Math.min(text.length, 20); i++) {
      const code = text.charCodeAt(i);
      if ((code >= 0x3040 && code <= 0x309f) || (code >= 0x30a0 && code <= 0x30ff)) {
        return Language.JAPANESE;
      }
    }
    return Language.CHINESE;
  }

  // Cyrillic (Russian and other Slavic languages)
  // Cyrillic: U+0400 to U+04FF
  if (charCode >= 0x0400 && charCode <= 0x04ff) {
    return Language.RUSSIAN;
  }

  // Arabic
  // Arabic: U+0600 to U+06FF
  // Arabic Supplement: U+0750 to U+077F
  if (
    (charCode >= 0x0600 && charCode <= 0x06ff) ||
    (charCode >= 0x0750 && charCode <= 0x077f)
  ) {
    return Language.ARABIC;
  }

  // Latin characters (English and European languages)
  // Basic Latin: U+0000 to U+007F
  // Latin-1 Supplement: U+0080 to U+00FF
  // Latin Extended-A: U+0100 to U+017F
  // Latin Extended-B: U+0180 to U+024F
  if (
    (charCode >= 0x0041 && charCode <= 0x005a) || // A-Z
    (charCode >= 0x0061 && charCode <= 0x007a) || // a-z
    (charCode >= 0x0080 && charCode <= 0x024f)    // Extended Latin
  ) {
    return Language.ENGLISH;
  }

  return Language.UNKNOWN;
}

/**
 * Gets a human-readable name for the detected language
 * @param language - The detected language
 * @returns The display name of the language
 */
export function getLanguageDisplayName(language: Language): string {
  const names: Record<Language, string> = {
    [Language.KOREAN]: "Korean (한국어)",
    [Language.JAPANESE]: "Japanese (日本語)",
    [Language.CHINESE]: "Chinese (中文)",
    [Language.RUSSIAN]: "Russian (Русский)",
    [Language.ARABIC]: "Arabic (العربية)",
    [Language.ENGLISH]: "English",
    [Language.UNKNOWN]: "Unknown"
  };
  
  return names[language];
}

/**
 * Maps detected language to API language code (returns the enum value)
 * @param language - The detected language
 * @returns ISO 639-1 language code or custom code
 */
export function getLanguageCode(language: Language): string {
  // Since Language enum values are already the language codes, just return the value
  return language;
}

