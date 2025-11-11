import { openaiJson } from "@/lib/openai";
import { personasSystemPrompt } from "@/lib/prompts/personas.system";
import type { BookResult, Persona } from "@/lib/types";

const personasSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  required: ["personas"],
  properties: {
    personas: {
      type: "array",
      minItems: 2,
      maxItems: 2,
      items: {
        type: "object",
        required: ["name", "role", "stance", "voice", "tagline"],
        properties: {
          name: { type: "string" },
          role: { type: "string" },
          stance: { type: "string" },
          voice: { type: "string" },
          tagline: { type: "string" },
        },
        additionalProperties: false,
      },
    },
  },
  additionalProperties: false,
};

export async function createPersonas(
  meta: BookResult
): Promise<[Persona, Persona]> {
  const input = {
    book: {
      title: meta.title,
      author: meta.author,
      year: meta.year,
      description: meta.description,
      subjects: meta.subjects,
    },
  };

  const result = await openaiJson<{ personas: Persona[] }>({
    system: personasSystemPrompt,
    input,
    schema: personasSchema,
    maxOutputTokens: 600,
  });

  const personas = result.personas;
  if (!personas || personas.length !== 2) {
    throw new Error("Expected exactly 2 personas");
  }

  return [personas[0], personas[1]];
}

