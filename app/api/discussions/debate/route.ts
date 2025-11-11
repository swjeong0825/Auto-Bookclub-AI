import { NextRequest, NextResponse } from "next/server";
import { generateDebate } from "@/lib/orchestrator/debate";
import type { BookResult, Persona, Transcript } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest
): Promise<NextResponse<Transcript | { error: string; details?: string }>> {
  try {
    const body = await request.json();
    const metaHint: BookResult = body.metaHint;
    const personas: [Persona, Persona] = body.personas;
    const turns: number = body.turns || 12;

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

    const transcript = await generateDebate(metaHint, personas, turns);
    return NextResponse.json(transcript);
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

