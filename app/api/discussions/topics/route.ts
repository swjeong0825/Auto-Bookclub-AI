export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { generateTopics } from "@/lib/orchestrator/topics";
import { Language } from "@/lib/constants";
import type { BookResult } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { metaHint, language = Language.ENGLISH } = body as {
      metaHint: BookResult;
      language?: Language;
    };

    if (!metaHint) {
      return NextResponse.json(
        { error: "Missing metaHint" },
        { status: 400 }
      );
    }

    const topics = await generateTopics(metaHint, language);

    return NextResponse.json({ topics });
  } catch (error) {
    console.error("Topics generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate topics",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

