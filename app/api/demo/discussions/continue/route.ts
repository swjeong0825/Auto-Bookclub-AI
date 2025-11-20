import { NextRequest, NextResponse } from "next/server";
import { generateDebate } from "@/lib/orchestrator/debate";
import { Language, SSE_PREFIX, DEFAULT_DISCUSSION_TURNS } from "@/lib/constants";
import type { BookResult, Persona, Transcript, DebateTurn } from "@/lib/types";
import { DiscussionLoadingState } from "@/lib/store/server";

export const dynamic = "force-dynamic";

/**
 * Continues a discussion with a user prompt
 * @returns A streaming response with SSE messages:
 *   - { type: "progress", progress: number }
 *   - { type: "complete", newTurns: DebateTurn[] }
 *   - { type: "error", error: string, details?: string }
 */
export async function POST(
  request: NextRequest
): Promise<Response> {
  try {
    const body = await request.json();
    const metaHint: BookResult = body.metaHint;
    const personas: [Persona, Persona] = body.personas;
    const currentTranscript: DebateTurn[] = body.currentTranscript || [];
    const userPrompt: string = body.userPrompt;
    const language: Language = body.language || Language.ENGLISH;
    const continueTurns: number = body.continueTurns || DEFAULT_DISCUSSION_TURNS;
    const topic: string | undefined = body.topic;
    const customReaderName: string | undefined = body.customReaderName;

    if (!metaHint || !metaHint.title) {
      return NextResponse.json(
        { error: "metaHint with title is required" },
        { status: 400 }
      );
    }

    if (!personas || personas.length !== 2) {
      return NextResponse.json(
        { error: "personas array with exactly 2 items is required" },
        { status: 400 }
      );
    }

    if (!userPrompt || userPrompt.trim().length === 0) {
      return NextResponse.json(
        { error: "userPrompt is required" },
        { status: 400 }
      );
    }

    const loadingState = new DiscussionLoadingState();
    loadingState.setTotalDiscussions(continueTurns);

    // Create a ReadableStream to send progress updates
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        // Function to send progress update
        const sendProgress = (progress: number) => {
          const data = JSON.stringify({ type: "progress", progress });
          controller.enqueue(encoder.encode(`${SSE_PREFIX}${data}\n\n`));
        };

        // Send initial progress (0%)
        sendProgress(0);

        // Start interval to send progress every second while generateDebate is running
        const intervalId = setInterval(() => {
          const progress = loadingState.getCompletedDiscussionRatio();
          sendProgress(progress);
        }, 1000);

        try {
          // Create user turn
          const nextIdx = currentTranscript.length;
          const userTurn: DebateTurn = {
            idx: nextIdx,
            speaker: "USER",
            text: userPrompt,
            topic: undefined,
          };

          // Determine next speaker (should be opposite of last AI speaker)
          // Find the last non-USER turn to determine who should speak next
          let nextSpeaker: "A" | "B" = "A";
          for (let i = currentTranscript.length - 1; i >= 0; i--) {
            if (currentTranscript[i].speaker !== "USER") {
              nextSpeaker = currentTranscript[i].speaker === "A" ? "B" : "A";
              break;
            }
          }

          // Generate continuation with user prompt as context
          const continuationTranscript = await generateDebate(
            metaHint,
            personas,
            continueTurns,
            loadingState,
            language,
            [...currentTranscript, userTurn], // Include user turn in context
            nextSpeaker,
            topic,
            customReaderName
          );

          clearInterval(intervalId);
          
          // Send final progress (100%)
          sendProgress(1.0);
          
          // The new turns start after the user turn
          // We need to re-index them to continue from where we left off
          const newTurns = [
            userTurn,
            ...continuationTranscript.turns.map((turn, idx) => ({
              ...turn,
              idx: nextIdx + 1 + idx,
            }))
          ];
          
          // Send the completed new turns
          const finalData = JSON.stringify({ type: "complete", newTurns });
          controller.enqueue(encoder.encode(`${SSE_PREFIX}${finalData}\n\n`));
          
          // Close the stream
          controller.close();
        } catch (debateError) {
          clearInterval(intervalId);
          const errorMessage =
            debateError instanceof Error ? debateError.message : "Unknown error";
          const errorData = JSON.stringify({ 
            type: "error", 
            error: "Failed to continue debate", 
            details: errorMessage 
          });
          controller.enqueue(encoder.encode(`${SSE_PREFIX}${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Continue debate error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to continue debate", details: errorMessage },
      { status: 500 }
    );
  }
}

