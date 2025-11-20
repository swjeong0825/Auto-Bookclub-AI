import { NextRequest, NextResponse } from "next/server";
import { search } from "@/lib/providers/books/googlebooks";
import type { BookResult } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest
): Promise<NextResponse<BookResult[] | { error: string }>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const title = searchParams.get("title");
    const limit = parseInt(searchParams.get("limit") || "5", 10);

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title parameter is required" },
        { status: 400 }
      );
    }

    const results = await search(title, limit);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Korean book search error:", error);
    return NextResponse.json(
      { error: "Failed to search Korean books" },
      { status: 500 }
    );
  }
}

