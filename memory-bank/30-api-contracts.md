# API Contracts

## Book Search

**Endpoint**: `GET /api/books/{lang}/search`

**Path Parameters**:
- `lang` (string, required) - Language code (e.g., `en`, `kr`)

**Query Parameters**:
- `title` (string, required) - Book title to search
- `limit` (number, optional, default: 5) - Max results

**Response**: `BookResult[]`

```typescript
type BookResult = {
  title: string;
  author: string;
  year?: number;
  coverUrl?: string;
  workKey?: string; // Internal only, not exposed to client
  subjects?: string[];
  description?: string;
};
```

## Book Resolve

**Endpoint**: `POST /api/books/{lang}/resolve`

**Path Parameters**:
- `lang` (string, required) - Language code (e.g., `en`, `kr`)

**Request Body**:
```typescript
{
  title?: string;
  workKey?: string;
  // ... other partial BookResult fields
}
```

**Response**: `BookResult` (fully resolved)

## Create Personas

**Endpoint**: `POST /api/discussions/personas`

**Request Body**:
```typescript
{
  metaHint: BookResult;
}
```

**Response**:
```typescript
{
  personas: [Persona, Persona];
  meta: BookResult;
}
```

## Generate Debate

**Endpoint**: `POST /api/discussions/debate`

**Request Body**:
```typescript
{
  metaHint: BookResult;
  personas: [Persona, Persona];
  turns?: number; // Optional, default: 12
}
```

**Response**: `Transcript`

```typescript
type Transcript = {
  personas: [Persona, Persona];
  turns: DebateTurn[];
};

type DebateTurn = {
  idx: number;
  speaker: "A" | "B";
  text: string;
  topic?: string;
};
```

## Error Responses

All endpoints return:
- `400` - Bad request (missing/invalid parameters)
- `500` - Server error

Error format:
```typescript
{
  error: string;
}
```

## Notes

- `workKey` is never passed between pages or exposed in client state
- All API routes use `export const dynamic = "force-dynamic"`
- OpenAI Responses API used with JSON Schema strict mode
- **Book Search Providers**:
  - English (`en`): Open Library API (no auth required)
  - Korean (`kr`): Google Books API with `langRestrict=ko` (no auth required for basic usage)
- Language detection automatically routes to appropriate provider

