import { NextRequest, NextResponse } from "next/server";
import { createPersonas } from "@/lib/orchestrator/personas";
import type { BookResult, Persona } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest
): Promise<
  NextResponse<
    | { personas: [Persona, Persona]; meta: BookResult }
    | { error: string; details?: string }
  >
> {
  try {
    const body = await request.json();
    const metaHint: BookResult = body.metaHint;

    if (!metaHint || !metaHint.title) {
      return NextResponse.json(
        { error: "metaHint with title is required" },
        { status: 400 }
      );
    }

    const personas = await createPersonas(metaHint);
    return NextResponse.json({ personas, meta: metaHint });
  } catch (error) {
    console.error("Personas error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create personas", details: errorMessage },
      { status: 500 }
    );
  }
}

