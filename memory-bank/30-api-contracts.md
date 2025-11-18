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
  turns?: number; // Optional, default: 6
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
  speaker: "A" | "B" | "USER";
  text: string;
  topic?: string;
};
```

## Continue Debate

**Endpoint**: `POST /api/discussions/continue`

**Request Body**:
```typescript
{
  metaHint: BookResult;
  personas: [Persona, Persona];
  currentTranscript: DebateTurn[];
  userPrompt: string;
  language?: Language; // Optional
  continueTurns?: number; // Optional, default: 6
}
```

**Response**: Server-Sent Events (SSE) Stream

**SSE Message Types**:
```typescript
// Progress update (sent periodically)
{
  type: "progress";
  progress: number; // 0.0 to 1.0
}

// Completion with new turns
{
  type: "complete";
  newTurns: DebateTurn[]; // Includes user turn + 6 AI turns
}

// Error
{
  type: "error";
  error: string;
  details?: string;
}
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

