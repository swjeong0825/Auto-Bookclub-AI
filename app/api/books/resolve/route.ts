import { NextRequest, NextResponse } from "next/server";
import { resolve } from "@/lib/providers/books/openlibrary";
import type { BookResult } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const metaHint: Partial<BookResult> = body;

    if (!metaHint.title && !metaHint.workKey) {
      return NextResponse.json(
        { error: "Either title or workKey is required" },
        { status: 400 }
      );
    }

    const resolved = await resolve(metaHint);
    return NextResponse.json(resolved);
  } catch (error) {
    console.error("Resolve error:", error);
    return NextResponse.json(
      { error: "Failed to resolve book metadata" },
      { status: 500 }
    );
  }
}

