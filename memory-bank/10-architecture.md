# Architecture

## Overview

Auto-Bookclub AI is a Next.js App Router application that generates AI-powered book discussions between two contrasting personas.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: Node.js
- **State Management**: Zustand (client-side only)
- **LLM**: OpenAI Responses API (`/v1/responses`)
- **Book Data**: Open Library API
- **Styling**: Global CSS with design system variables

## Architecture Patterns

### SSR with Client Islands

- Pages (`app/page.tsx`, `app/discuss/page.tsx`) are server components that render client components
- All interactivity lives in client components (`"use client"`)
- No server actions; all API communication via API routes

### State Management

- Zustand store (`lib/store/useAppStore.ts`) manages cross-page session state
- No route parameters or query strings for book data
- State persists across navigation via Zustand

### API Routes

All API routes are in `app/api/`:
- `GET /api/books/{lang}/search` - Search books by title (lang: en, kr, etc.)
- `POST /api/books/{lang}/resolve` - Enrich book metadata (lang: en, kr, etc.)
- `POST /api/discussions/personas` - Generate personas
- `POST /api/discussions/debate` - Generate debate transcript
- `POST /api/discussions/continue` - Continue discussion with user prompt

### Book Provider Pattern

- Abstract interface in `lib/providers/books/index.ts`
- **English books**: `lib/providers/books/openlibrary.ts` (Open Library API)
- **Korean books**: `lib/providers/books/googlebooks.ts` (Google Books API with `langRestrict=ko`)
- `workKey` is internal-only; never exposed in routes or client state
- Language detection in `lib/utils/languageDetection.ts` routes to appropriate provider

### Orchestration Layer

- `lib/orchestrator/personas.ts` - Creates personas using OpenAI
- `lib/orchestrator/debate.ts` - Generates debate turns sequentially
- System prompts are book-agnostic and stored in `lib/prompts/`

### OpenAI Integration

- **API**: OpenAI Responses API (`/v1/responses`)
- **Client**: `lib/openai.ts` - `openaiJson()` function
- **Request Structure**:
  - `instructions`: System-level prompts and guidelines (conceptual "System" role)
  - `input`: Specific data/context for the request (conceptual "User" role)
  - `response_format`: JSON Schema with `strict: true` for structured output
- **Response Format**: Structured JSON output validated against provided schema
- **Model**: Configurable via `OPENAI_MODEL` env var (default: `gpt-4o-mini`)
- **Authentication**: `OPENAI_API_KEY` environment variable required

## Data Flow

1. User searches → `/api/books/{lang}/search` → Open Library
2. User selects → `/api/books/{lang}/resolve` → Enriched metadata → Zustand
3. Navigate to `/discuss` → Auto-triggers personas → Debate
4. Transcript rendered from Zustand state
5. User submits prompt → `/api/discussions/continue` → 6 more turns → Appended to transcript
6. User can continue prompting indefinitely

## Key Design Decisions

- **No route params**: Book data never in URL; all in Zustand
- **Sequential debate generation**: Each turn generated individually for better control
- **JSON Schema enforcement**: Strict schema validation via OpenAI Responses API
- **Book-agnostic prompts**: System prompts define behavior, not book facts
- **Interactive continuation**: Users can add prompts to continue discussions with full context
- **Three speaker types**: "A", "B" (personas), and "USER" (user contributions)

