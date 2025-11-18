# API Documentation

This document provides comprehensive API documentation for the Virtual Bookclub App backend endpoints.

## Base URL

All API endpoints are prefixed with `/api`.

## Type Definitions

### BookResult

```typescript
type BookResult = {
  title: string;
  author: string;
  year?: number;
  coverUrl?: string;
  workKey?: string;
  subjects?: string[];
  description?: string;
};
```

### Persona

```typescript
type Persona = {
  name: string;
  role: string;
  stance: string;
  voice: string;
  tagline?: string;
};
```

### DebateTurn

```typescript
type DebateTurn = {
  idx: number;
  speaker: "A" | "B";
  text: string;
  topic?: string;
};
```

### Transcript

```typescript
type Transcript = {
  personas: [Persona, Persona];
  turns: DebateTurn[];
};
```

---

## Endpoints

### 1. Search Books

Search for books by title using the OpenLibrary API.

**Endpoint**: `GET /api/books/{lang}/search`

**Path Parameters**:
- `lang` (string, **required**) - Language code (currently supported: `en`)

**Query Parameters**:
- `title` (string, **required**) - The book title to search for
- `limit` (number, optional) - Maximum number of results to return. Default: `5`

**Request Example**:
```
GET /api/books/en/search?title=1984&limit=10
```

**Success Response** (200 OK):
```json
[
  {
    "title": "1984",
    "author": "George Orwell",
    "year": 1949,
    "coverUrl": "https://covers.openlibrary.org/b/id/123456-M.jpg",
    "workKey": "OL82563W",
    "subjects": ["Dystopian fiction", "Political fiction"],
    "description": "A dystopian social science fiction novel..."
  }
]
```

**Error Responses**:

- **400 Bad Request** - Missing or invalid `title` parameter
```json
{
  "error": "Title parameter is required"
}
```

- **500 Internal Server Error** - Server error during search
```json
{
  "error": "Failed to search books"
}
```

**Implementation Notes**:
- **English (`en`)**: Uses Open Library API (no authentication required)
- **Korean (`kr`)**: Uses Google Books API with `langRestrict=ko` (no authentication required)
- Returns an array of `BookResult` objects
- All routes use `force-dynamic` rendering
- Language code determines which book provider is used

---

### 2. Resolve Book Metadata

Resolve and enrich book metadata using partial book information.

**Endpoint**: `POST /api/books/{lang}/resolve`

**Path Parameters**:
- `lang` (string, **required**) - Language code (currently supported: `en`)

**Request Body**:
```typescript
{
  title?: string;
  workKey?: string;
  // ... other partial BookResult fields
}
```

**Request Example**:
```json
{
  "title": "1984",
  "author": "George Orwell"
}
```

Or with workKey:
```json
{
  "workKey": "OL82563W"
}
```

**Success Response** (200 OK):
```json
{
  "title": "1984",
  "author": "George Orwell",
  "year": 1949,
  "coverUrl": "https://covers.openlibrary.org/b/id/123456-M.jpg",
  "workKey": "OL82563W",
  "subjects": ["Dystopian fiction", "Political fiction"],
  "description": "A dystopian social science fiction novel..."
}
```

**Error Responses**:

- **400 Bad Request** - Missing both `title` and `workKey`
```json
{
  "error": "Either title or workKey is required"
}
```

- **500 Internal Server Error** - Server error during resolution
```json
{
  "error": "Failed to resolve book metadata"
}
```

**Implementation Notes**:
- **English (`en`)**: Uses Open Library API to fetch detailed work and author information
- **Korean (`kr`)**: Uses Google Books API to fetch volume details
- Accepts partial `BookResult` as input
- At least one of `title` or `workKey` must be provided
- Returns a fully resolved `BookResult` object
- `workKey` format differs by provider (Open Library work ID vs Google Books volume ID)

---

### 3. Create Personas

Generate two debate personas based on a book's metadata.

**Endpoint**: `POST /api/discussions/personas`

**Request Body**:
```typescript
{
  metaHint: BookResult;
}
```

**Request Example**:
```json
{
  "metaHint": {
    "title": "1984",
    "author": "George Orwell",
    "year": 1949,
    "description": "A dystopian novel about totalitarianism",
    "subjects": ["Dystopian fiction", "Political fiction"]
  }
}
```

**Success Response** (200 OK):
```json
{
  "personas": [
    {
      "name": "Dr. Sarah Chen",
      "role": "Political Science Professor",
      "stance": "Argues that 1984 serves as a crucial warning about surveillance states",
      "voice": "Academic and analytical, citing historical examples",
      "tagline": "History teaches us what happens when we ignore warnings"
    },
    {
      "name": "Marcus Thompson",
      "role": "Technology Ethics Researcher",
      "stance": "Believes modern technology makes Orwell's vision more relevant than ever",
      "voice": "Passionate and contemporary, drawing parallels to current events",
      "tagline": "Big Brother is already here, we just call it Big Tech"
    }
  ],
  "meta": {
    "title": "1984",
    "author": "George Orwell",
    "year": 1949,
    "description": "A dystopian novel about totalitarianism",
    "subjects": ["Dystopian fiction", "Political fiction"]
  }
}
```

**Error Responses**:

- **400 Bad Request** - Missing or invalid `metaHint`
```json
{
  "error": "metaHint with title is required"
}
```

- **500 Internal Server Error** - Server error during persona generation
```json
{
  "error": "Failed to create personas",
  "details": "Error message details"
}
```

**Implementation Notes**:
- Uses OpenAI Responses API with JSON Schema strict mode
- Generates exactly 2 personas with opposing or complementary viewpoints
- Returns the original `metaHint` along with generated personas
- All persona fields (`name`, `role`, `stance`, `voice`, `tagline`) are required in the response

---

### 4. Generate Debate

Generate a debate transcript between two personas discussing a book.

**Endpoint**: `POST /api/discussions/debate`

**Request Body**:
```typescript
{
  metaHint: BookResult;
  personas: [Persona, Persona];
  turns?: number; // Optional, default: 12
}
```

**Request Example**:
```json
{
  "metaHint": {
    "title": "1984",
    "author": "George Orwell",
    "year": 1949,
    "description": "A dystopian novel about totalitarianism",
    "subjects": ["Dystopian fiction", "Political fiction"]
  },
  "personas": [
    {
      "name": "Dr. Sarah Chen",
      "role": "Political Science Professor",
      "stance": "Argues that 1984 serves as a crucial warning",
      "voice": "Academic and analytical",
      "tagline": "History teaches us what happens when we ignore warnings"
    },
    {
      "name": "Marcus Thompson",
      "role": "Technology Ethics Researcher",
      "stance": "Believes modern technology makes Orwell's vision more relevant",
      "voice": "Passionate and contemporary",
      "tagline": "Big Brother is already here, we just call it Big Tech"
    }
  ],
  "turns": 12
}
```

**Success Response** (200 OK):
```json
{
  "personas": [
    {
      "name": "Dr. Sarah Chen",
      "role": "Political Science Professor",
      "stance": "Argues that 1984 serves as a crucial warning",
      "voice": "Academic and analytical",
      "tagline": "History teaches us what happens when we ignore warnings"
    },
    {
      "name": "Marcus Thompson",
      "role": "Technology Ethics Researcher",
      "stance": "Believes modern technology makes Orwell's vision more relevant",
      "voice": "Passionate and contemporary",
      "tagline": "Big Brother is already here, we just call it Big Tech"
    }
  ],
  "turns": [
    {
      "idx": 0,
      "speaker": "A",
      "text": "I think 1984's greatest strength is its prescience about surveillance...",
      "topic": "Surveillance and Privacy"
    },
    {
      "idx": 1,
      "speaker": "B",
      "text": "Absolutely, but I'd argue we've already surpassed Orwell's vision...",
      "topic": "Modern Technology vs. Orwell's Vision"
    }
    // ... more turns
  ]
}
```

**Error Responses**:

- **400 Bad Request** - Missing or invalid parameters
```json
{
  "error": "metaHint with title is required"
}
```

Or:
```json
{
  "error": "personas array with exactly 2 items is required"
}
```

- **500 Internal Server Error** - Server error during debate generation
```json
{
  "error": "Failed to generate debate",
  "details": "Error message details"
}
```

**Implementation Notes**:
- Uses OpenAI Responses API with JSON Schema strict mode
- Generates turns sequentially, alternating between speaker "A" and "B"
- Each turn includes `text` and `topic` fields
- Turn indices start at 0
- Default number of turns is 12 if not specified
- Each turn is generated with context from all previous turns

---

## Error Handling

All endpoints follow a consistent error response format:

### Error Response Structure

```typescript
{
  error: string;        // Human-readable error message
  details?: string;     // Additional error details (for 500 errors)
}
```

### HTTP Status Codes

- **200 OK** - Request successful
- **400 Bad Request** - Invalid or missing required parameters
- **500 Internal Server Error** - Server-side error during processing

### Common Error Scenarios

1. **Missing Required Parameters**: Returns 400 with a descriptive error message
2. **Invalid Data Format**: Returns 400 with validation error
3. **External API Failures**: Returns 500 with error details
4. **OpenAI API Errors**: Returns 500 with error details

---

## Technical Details

### Route Configuration

All API routes use Next.js App Router with the following configuration:

```typescript
export const dynamic = "force-dynamic";
```

This ensures all routes are dynamically rendered and not cached.

### OpenAI Integration

The following endpoints use OpenAI Responses API with JSON Schema strict mode:

- `/api/discussions/personas` - Uses JSON schema validation for persona generation
- `/api/discussions/debate` - Uses JSON schema validation for each debate turn

### Data Flow

1. **Book Search** → Returns book candidates
2. **Book Resolve** → Enriches book metadata
3. **Create Personas** → Generates debate participants based on book
4. **Generate Debate** → Creates discussion transcript between personas

### Security Considerations

- All endpoints validate input parameters
- Error messages don't expose internal implementation details
- `workKey` is an internal identifier and should not be exposed to clients in production

---

## Example Workflow

A typical workflow for generating a book debate:

1. **Search for a book**:
   ```
   GET /api/books/en/search?title=1984
   ```

2. **Resolve book metadata** (optional, if more details needed):
   ```
   POST /api/books/en/resolve
   { "title": "1984", "author": "George Orwell" }
   ```

3. **Create personas**:
   ```
   POST /api/discussions/personas
   { "metaHint": { "title": "1984", "author": "George Orwell", ... } }
   ```

4. **Generate debate**:
   ```
   POST /api/discussions/debate
   {
     "metaHint": { "title": "1984", ... },
     "personas": [...],
     "turns": 12
   }
   ```

---

## Versioning

Current API version: **v1** (no version prefix in URLs)

All endpoints are subject to change. Consider implementing versioning if this API will be used by external clients.

