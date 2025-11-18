# Universal Language Detection

## Overview
Detects the language of book search queries based on Unicode character ranges to route them to appropriate book search APIs.

The detection system uses the centralized `Language` enum from `@/lib/constants.ts`, ensuring consistency across the entire application (book searches, AI discussions, and API routing).

## Supported Languages

The system can detect the following languages:

| Language | Script | Unicode Range | Example Input |
|----------|--------|---------------|---------------|
| **English** | Latin | U+0041-U+024F | "Harry Potter" |
| **Korean** | Hangul | U+AC00-U+D7AF, U+1100-U+11FF, U+3130-U+318F | "해리포터" |
| **Japanese** | Hiragana/Katakana | U+3040-U+309F, U+30A0-U+30FF | "ハリー・ポッター" |
| **Chinese** | CJK Ideographs | U+4E00-U+9FFF, U+3400-U+4DBF | "哈利波特" |
| **Russian** | Cyrillic | U+0400-U+04FF | "Гарри Поттер" |
| **Arabic** | Arabic | U+0600-U+06FF, U+0750-U+077F | "هاري بوتر" |

## Detection Logic

The system:
1. Analyzes the first meaningful character (skips punctuation/numbers)
2. Checks Unicode ranges to determine the script
3. Returns a language identifier

### Special Cases
- **Japanese vs Chinese**: Both use CJK characters, but Japanese detection takes priority if Hiragana/Katakana is found
- **Empty input**: Defaults to English
- **Unknown scripts**: Returns "unknown" but defaults to English for API routing

## API

### `detectLanguage(text: string): Language`
Returns a `Language` enum value from `@/lib/constants`:
- `Language.ENGLISH` → "en"
- `Language.KOREAN` → "ko"
- `Language.JAPANESE` → "ja"
- `Language.CHINESE` → "zh"
- `Language.RUSSIAN` → "ru"
- `Language.ARABIC` → "ar"
- `Language.UNKNOWN` → "unknown"

### `getLanguageDisplayName(language: Language): string`
Returns human-readable name with native script, e.g., "Korean (한국어)"

### `getLanguageCode(language: Language): string`
Returns ISO 639-1 language code (the enum value itself), e.g., "ko", "ja", "zh", "ru", "ar", "en"

## Current Implementation

### SearchBox Integration
When the search button is clicked, the console logs:
```
===========================================
🌍 Language Detection Results:
   Language: Korean (한국어)
   Code: ko
   Query: "해리포터"
===========================================
```

## Test Examples

Try these search queries to see language detection in action:

- **English**: "The Great Gatsby", "1984", "Pride and Prejudice"
- **Korean**: "해리포터", "어린왕자", "연금술사"
- **Japanese**: "ハリー・ポッター", "君の名は", "ノルウェイの森"
- **Chinese**: "哈利波特", "三体", "活着"
- **Russian**: "Война и мир", "Преступление и наказание"
- **Arabic**: "الخيميائي", "مئة عام من العزلة"

## Future Enhancements

1. **Add more languages**: Thai, Hebrew, Greek, Hindi, etc.
2. **Multi-script detection**: Handle texts with mixed scripts
3. **Context-based detection**: Analyze multiple characters for better accuracy
4. **Integration with book APIs**: Route to language-specific book search services
5. **Fallback detection**: Use external libraries for edge cases

## Files

- `lib/constants.ts` - Centralized `Language` enum definition
- `lib/utils/languageDetection.ts` - Core detection logic using `Language` enum
- `components/SearchBox.tsx` - Integration with search functionality

