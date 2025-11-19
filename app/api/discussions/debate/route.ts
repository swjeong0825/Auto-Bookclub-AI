import { NextRequest, NextResponse } from "next/server";
import { generateDebate } from "@/lib/orchestrator/debate";
import { Language, SSE_PREFIX, DEFAULT_DISCUSSION_TURNS } from "@/lib/constants";
import type { BookResult, Persona, Transcript } from "@/lib/types";
import { DiscussionLoadingState } from "@/lib/store/server";

export const dynamic = "force-dynamic";

/**
 * @returns A streaming response with SSE messages:
 *   - { type: "progress", progress: number }
 *   - { type: "complete", transcript: Transcript }
 *   - { type: "error", error: string, details?: string }
 */
export async function POST(
  request: NextRequest
): Promise<Response> {
  try {
    const body = await request.json();
    const metaHint: BookResult = body.metaHint;
    const personas: [Persona, Persona] = body.personas;
    const turns: number = body.turns || DEFAULT_DISCUSSION_TURNS;
    const language: Language = body.language || Language.ENGLISH;
    const topic: string | undefined = body.topic;

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

    const loadingState = new DiscussionLoadingState();
    loadingState.setTotalDiscussions(turns);

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
          const transcript = await generateDebate(metaHint, personas, turns, loadingState, language, [], "A", topic);
          clearInterval(intervalId);
          
          // Send final progress (100%)
          sendProgress(1.0);
          
          // Send the completed transcript
          const finalData = JSON.stringify({ type: "complete", transcript });
          controller.enqueue(encoder.encode(`${SSE_PREFIX}${finalData}\n\n`));
          
          // Close the stream
          controller.close();
        } catch (debateError) {
          clearInterval(intervalId);
          const errorMessage =
            debateError instanceof Error ? debateError.message : "Unknown error";
          const errorData = JSON.stringify({ 
            type: "error", 
            error: "Failed to generate debate", 
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
    console.error("Debate error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate debate", details: errorMessage },
      { status: 500 }
    );
  }
}

