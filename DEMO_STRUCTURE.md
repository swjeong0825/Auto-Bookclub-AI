# Demo Version Structure

This document outlines the demo version of the Virtual Bookclub App that has been created.

## Overview

The demo version is a complete duplicate of the main app with the following key differences:
- All routes are prefixed with `/demo`
- All API calls are prefixed with `/api/demo`
- Components are stored in a separate `components-demo` folder
- The demo shares the same CSS (`app/globals.css`), favicon, and `lib` utilities

## File Structure

### 1. Demo Pages (`app/demo/`)
```
app/demo/
├── page.tsx                 # Demo homepage (SearchBoxDemo)
└── discuss/
    └── page.tsx            # Demo discussion page
```

### 2. Demo Components (`components-demo/`)
```
components-demo/
├── SearchBoxDemo.tsx                      # Main search component
├── DiscussClientDemo.tsx                  # Discussion orchestration
├── RecentActionsDemo.tsx                  # Recent actions component
├── ResultsModalDemo/
│   ├── index.tsx                         # Modal container
│   ├── BookSelectionPage.tsx            # Book selection step
│   ├── TopicSelectionPage.tsx           # Topic selection step
│   ├── UserSettingsPage.tsx             # User settings step
│   └── ModalPageIndicators.tsx          # Page navigation dots
└── TranscriptDemo/
    ├── index.tsx                         # Transcript container
    ├── TranscriptHeader.tsx             # Header with actions
    ├── DiscussionTopicBanner.tsx        # Topic display banner
    ├── PersonasIntro.tsx                # Persona cards
    ├── TranscriptTurns.tsx              # Discussion turns
    ├── LoadingProgress.tsx              # Progress indicator
    ├── InitialLoadingState.tsx          # Initial loading screen
    ├── ContinueDiscussionForm.tsx       # User input form
    └── useContinueDiscussion.ts         # Continue discussion hook
```

### 3. Demo API Routes (`app/api/demo/`)
```
app/api/demo/
├── books/
│   ├── en/
│   │   ├── search/route.ts              # English book search
│   │   └── resolve/route.ts             # English book metadata
│   └── kr/
│       ├── search/route.ts              # Korean book search
│       └── resolve/route.ts             # Korean book metadata
└── discussions/
    ├── topics/route.ts                  # Generate discussion topics
    ├── personas/route.ts                # Create AI personas
    ├── debate/route.ts                  # Generate debate (streaming)
    └── continue/route.ts                # Continue discussion (streaming)
```

## Shared Resources

The following are shared between the main app and demo version:
- `app/globals.css` - All styling
- `app/favicon.ico` - App icon
- `lib/` - All utilities, types, constants, orchestrators, prompts, providers, and store

## Key Differences from Main App

### Route Prefixes
- Demo Homepage: `/demo` (instead of `/`)
- Demo Discussion: `/demo/discuss` (instead of `/discuss`)

### API Endpoints
All API calls use `/api/demo/` prefix instead of `/api/`:
- Book search: `/api/demo/books/{lang}/search`
- Book resolve: `/api/demo/books/{lang}/resolve`
- Topics: `/api/demo/discussions/topics`
- Personas: `/api/demo/discussions/personas`
- Debate: `/api/demo/discussions/debate`
- Continue: `/api/demo/discussions/continue`

### Navigation
- "New Search" button redirects to `/demo` instead of `/`
- Router redirects within demo stay within `/demo` namespace

## Usage

To access the demo version:
1. Navigate to `/demo` route
2. Search for a book
3. Select a topic and configure settings
4. View the AI-powered discussion

The demo functions identically to the main app but operates independently with its own routing namespace.

