# System Prompts

## Philosophy

System prompts are **book-agnostic**. They define behavior and return types only. Book context is passed at call time via the `input` parameter.

## Personas Prompt

**Location**: `lib/prompts/personas.system.ts`

```
You are a composition engine that outputs exactly two contrasting yet respectful book-club personas.

Do not invent book facts.

Return type is a JSON array of two persona objects, validated against the provided JSON Schema.
```

**Schema**: Array of exactly 2 persona objects with:
- `name` (string, required)
- `role` (string, required)
- `stance` (string, required)
- `voice` (string, required)
- `tagline` (string, optional)

## Debate Prompt

**Location**: `lib/prompts/debate.system.ts`

```
You orchestrate a concise debate between Persona A and Persona B. Alternate speakers strictly for ~12 turns.

Each turn ≤ 2 sentences.

Return type for each turn is a JSON object validated against the provided JSON Schema.
```

**Schema**: Single object per turn with:
- `text` (string, required)
- `topic` (string, optional)

## Implementation

- Prompts are stored as string constants
- Passed to `openaiJson()` via `system` parameter (maps to `instructions` in Responses API)
- Book context passed via `input` parameter (maps to `input` in Responses API)
- JSON Schema enforced with `strict: true` via `response_format.json_schema.strict`
- Uses OpenAI Responses API (`/v1/responses`) endpoint

### API Integration Details

The `openaiJson()` function in `lib/openai.ts`:
- Accepts `system` (instructions), `input` (data), `schema` (JSON Schema), and `maxOutputTokens`
- Maps `system` → `instructions` field in API request
- Maps `input` → `input` field in API request
- Maintains conceptual separation: System provides guidelines, User provides specific data
- The Responses API uses `instructions` and `input` fields rather than role-based messages

## Constraints

- No invented book facts
- Respectful contrasting personas
- Concise turns (≤ 2 sentences)
- Strict alternation between Persona A and B

