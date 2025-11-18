# Korean Book Search Implementation

## Overview

Korean book search is implemented using the **Google Books API** with language restriction for Korean content.

## Why Google Books API?

- **No Authentication Required**: Works without API keys for basic usage (recommended but not required)
- **Good Korean Coverage**: Extensive database of Korean books
- **Similar Structure**: Consistent with our existing architecture
- **Free Tier**: Sufficient for moderate usage

## Implementation Details

### Provider: `lib/providers/books/googlebooks.ts`

The Google Books provider implements the same interface as the Open Library provider:

```typescript
export async function search(title: string, limit?: number): Promise<BookResult[]>
export async function resolve(metaHint: Partial<BookResult>): Promise<BookResult>
```

### Key Features

1. **Language Restriction**: Uses `langRestrict=ko` parameter to filter Korean books
2. **Print Type Filter**: Only returns books (excludes magazines)
3. **Cover Images**: Automatically uses HTTPS for image URLs
4. **Fallback Handling**: Gracefully handles missing data

### API Endpoints

- **Search**: `GET /api/books/kr/search?title={title}&limit={limit}`
- **Resolve**: `POST /api/books/kr/resolve` with book metadata in body

## Usage Flow

1. User enters Korean text (e.g., "해리포터")
2. Language detection identifies Korean → routes to `/api/books/kr/search`
3. Google Books API searches with `langRestrict=ko`
4. Results displayed in modal
5. User selects book → `/api/books/kr/resolve` fetches full metadata

## Data Mapping

| BookResult Field | Google Books Field |
|-----------------|-------------------|
| title | volumeInfo.title |
| author | volumeInfo.authors[0] |
| year | volumeInfo.publishedDate (year extracted) |
| coverUrl | volumeInfo.imageLinks.thumbnail |
| workKey | id (Google Books volume ID) |
| subjects | volumeInfo.categories |
| description | volumeInfo.description |

## Limitations

- **Rate Limiting**: Google Books has rate limits (1,000 requests/day for unauthenticated)
- **Search Quality**: May include books with Korean translations, not just Korean originals
- **Metadata Completeness**: Some books may have incomplete information

## Future Improvements

To improve Korean book search, consider:

1. **Add API Key**: Register for Google Books API key to increase rate limits
2. **Add Korean-Specific APIs**: 
   - NAVER Books API (requires authentication)
   - Aladin API (popular Korean bookstore)
   - National Library of Korea API
3. **Enhanced Filtering**: Better distinguish Korean originals from translations
4. **Caching**: Implement response caching to reduce API calls

## Testing

Test with common Korean book titles:
- "해리포터" (Harry Potter in Korean)
- "어린왕자" (The Little Prince)
- "채식주의자" (The Vegetarian - Korean original)
- "82년생 김지영" (Kim Jiyoung, Born 1982)

## Error Handling

The implementation handles:
- Empty search results (returns empty array)
- API failures (returns 500 error)
- Missing metadata (provides fallback values)
- Invalid requests (returns 400 error)

