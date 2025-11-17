import { openaiJson } from "@/lib/openai";
import { debateSystemPrompt } from "@/lib/prompts/debate.system";
import type { BookResult, Persona, DebateTurn, Transcript } from "@/lib/types";
import { DiscussionLoadingState } from "@/lib/store/server";

const debateTurnSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  required: ["text", "topic"],
  properties: {
    text: { type: "string" },
    topic: { type: "string" },
  },
  additionalProperties: false,
};

export async function generateDebate(
  meta: BookResult,
  personas: [Persona, Persona],
  turns: number = 12,
  loadingState: DiscussionLoadingState
): Promise<Transcript> {
  const input = {
    book: {
      title: meta.title,
      author: meta.author,
      year: meta.year,
      description: meta.description,
      subjects: meta.subjects,
    },
    personaA: personas[0],
    personaB: personas[1],
    targetTurns: turns,
  };

  const debateTurns: DebateTurn[] = [];
  let currentSpeaker: "A" | "B" = "A";

  for (let i = 0; i < turns; i++) {
    const turnInput = {
      ...input,
      currentTurn: i + 1,
      previousTurns: debateTurns.map((t) => ({
        speaker: t.speaker,
        text: t.text,
        topic: t.topic,
      })),
      currentSpeaker,
    };

    const turn = await openaiJson<{ text: string; topic?: string }>({
      system: debateSystemPrompt,
      input: turnInput,
      schema: debateTurnSchema,
      maxOutputTokens: 200,
    });

    debateTurns.push({
      idx: i,
      speaker: currentSpeaker,
      text: turn.text,
      topic: turn.topic,
    });

    // Increment the loading state after each discussion turn is created
    if (loadingState) {
      loadingState.incrementCreatedDiscussions();
    }

    currentSpeaker = currentSpeaker === "A" ? "B" : "A";
  }

  return {
    personas,
    turns: debateTurns,
  };
}

