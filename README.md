# Auto-Bookclub AI

AI-powered book discussions with contrasting personas. Search for a book, and watch two AI personas debate it.

## Features

- **Book Search**: Search by title using Open Library
- **Auto-Personas**: Automatically generates two contrasting book-club personas
- **AI Debate**: Generates a 12-turn discussion between the personas
- **Transcript Export**: Copy transcript to clipboard

## Tech Stack

- Next.js 16 (App Router)
- Zustand (state management)
- OpenAI Responses API
- Open Library API
- TypeScript

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set environment variables:
```bash
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini  # Optional, defaults to gpt-4o-mini
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Build

```bash
npm run build
npm start
```

## Architecture

- **SSR Pages**: Server components render client islands
- **State**: Zustand for cross-page session state (no route params)
- **API Routes**: All server logic in `/app/api`
- **Book Provider**: Open Library integration (internal `workKey` only)
- **Orchestration**: Sequential debate generation with JSON Schema validation

## Project Structure

```
app/
  page.tsx              # Home (SSR wrapper)
  discuss/page.tsx      # Discussion page (SSR wrapper)
  api/                  # API routes
components/             # Client components
lib/
  store/               # Zustand store
  providers/books/     # Book data provider
  orchestrator/        # Personas & debate generation
  prompts/             # System prompts (book-agnostic)
  types.ts             # TypeScript types
  openai.ts            # OpenAI helper
```

## API Endpoints

- `GET /api/books/search?title=&limit=5` - Search books
- `POST /api/books/resolve` - Resolve book metadata
- `POST /api/discussions/personas` - Create personas
- `POST /api/discussions/debate` - Generate debate

## Notes

- Book data never passed via route/query params
- System prompts are book-agnostic
- JSON Schema strict mode enforced
- No spoilers beyond jacket copy level
