import { openaiJson } from "@/lib/openai";
import { getDebateSystemPrompt } from "@/lib/prompts/debate.system";
import { Language, DEFAULT_DISCUSSION_TURNS } from "@/lib/constants";
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
  turns: number = DEFAULT_DISCUSSION_TURNS,
  loadingState: DiscussionLoadingState,
  language: Language = Language.ENGLISH,
  previousTurns: DebateTurn[] = [],
  startingSpeaker: "A" | "B" = "A",
  topic?: string,
  customReaderName?: string
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
    ...(topic && { discussionTopic: topic }),
  };

  const debateTurns: DebateTurn[] = [];
  let currentSpeaker: "A" | "B" = startingSpeaker;

  for (let i = 0; i < turns; i++) {
    // Combine previous turns (if any) with newly generated turns
    const allPreviousTurns = [
      ...previousTurns.map((t) => ({
        speaker: t.speaker,
        text: t.text,
        topic: t.topic,
      })),
      ...debateTurns.map((t) => ({
        speaker: t.speaker,
        text: t.text,
        topic: t.topic,
      })),
    ];

    const turnInput = {
      ...input,
      currentTurn: previousTurns.length + i + 1,
      previousTurns: allPreviousTurns,
      currentSpeaker,
    };

    // Determine if this turn should ask the reader
    // Always ask on the last turn of THIS generation (not checking previous rounds)
    const shouldAskReader = (i === turns - 1);

    // Determine if this turn should respond to user input
    // True when it's the first turn AND the last turn in previousTurns was from USER
    const shouldRespondToUser = (
      i === 0 && 
      previousTurns.length > 0 && 
      previousTurns[previousTurns.length - 1].speaker === "USER"
    );

    const turn = await openaiJson<{ text: string; topic?: string }>({
      system: getDebateSystemPrompt(language, shouldAskReader, shouldRespondToUser, customReaderName),
      input: turnInput,
      schema: debateTurnSchema,
      maxOutputTokens: 300,
    });

    debateTurns.push({
      idx: i,
      speaker: currentSpeaker,
      text: turn.text,
      topic: turn.topic,
      asksReader: shouldAskReader, // Set in code, not from AI
      respondsToUser: shouldRespondToUser, // Set in code, not from AI
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

