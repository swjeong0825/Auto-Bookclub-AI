import { openaiJson } from "@/lib/openai";
import { getTopicsSystemPrompt } from "@/lib/prompts/topics.system";
import { Language } from "@/lib/constants";
import type { BookResult } from "@/lib/types";

const topicsSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  required: ["topics"],
  properties: {
    topics: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "string",
      },
    },
  },
  additionalProperties: false,
};

export async function generateTopics(
  meta: BookResult,
  language: Language = Language.ENGLISH
): Promise<string[]> {
  const input = {
    book: {
      title: meta.title,
      author: meta.author,
      year: meta.year,
      description: meta.description,
      subjects: meta.subjects,
    },
  };

  const result = await openaiJson<{ topics: string[] }>({
    system: getTopicsSystemPrompt(language),
    input,
    schema: topicsSchema,
    maxOutputTokens: 400,
  });

  const topics = result.topics;
  if (!topics || topics.length !== 3) {
    throw new Error("Expected exactly 3 topics");
  }

  return topics;
}

