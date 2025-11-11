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
- `GET /api/books/search` - Search books by title
- `POST /api/books/resolve` - Enrich book metadata
- `POST /api/discussions/personas` - Generate personas
- `POST /api/discussions/debate` - Generate debate transcript

### Book Provider Pattern

- Abstract interface in `lib/providers/books/index.ts`
- Implementation in `lib/providers/books/openlibrary.ts`
- `workKey` is internal-only; never exposed in routes or client state

### Orchestration Layer

- `lib/orchestrator/personas.ts` - Creates personas using OpenAI
- `lib/orchestrator/debate.ts` - Generates debate turns sequentially
- System prompts are book-agnostic and stored in `lib/prompts/`

## Data Flow

1. User searches → `/api/books/search` → Open Library
2. User selects → `/api/books/resolve` → Enriched metadata → Zustand
3. Navigate to `/discuss` → Auto-triggers personas → Debate
4. Transcript rendered from Zustand state

## Key Design Decisions

- **No route params**: Book data never in URL; all in Zustand
- **Sequential debate generation**: Each turn generated individually for better control
- **JSON Schema enforcement**: Strict schema validation via OpenAI Responses API
- **Book-agnostic prompts**: System prompts define behavior, not book facts

