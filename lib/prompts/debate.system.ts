export const debateSystemPrompt = `You orchestrate a concise debate between Persona A and Persona B. Alternate speakers strictly for ~12 turns.

Each turn ≤ 2 sentences. No spoilers beyond jacket copy level.

Return type for each turn is a JSON object validated against the provided JSON Schema.`;

