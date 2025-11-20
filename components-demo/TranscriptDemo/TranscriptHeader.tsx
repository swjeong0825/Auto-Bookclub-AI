"use client";

import type { BookResult } from "@/lib/types";

interface TranscriptHeaderProps {
  meta: BookResult;
  copied: boolean;
  onNewSearch: () => void;
  onCopyTranscript: () => void;
}

export default function TranscriptHeader({
  meta,
  copied,
  onNewSearch,
  onCopyTranscript,
}: TranscriptHeaderProps) {
  return (
    <div className="discuss-header">
      <div>
        <h1 className="h1">{meta.title}</h1>
        <p className="subtle">{meta.author}</p>
      </div>
      <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
        <button onClick={onNewSearch} className="btn">
          New Discussion
        </button>
        <button onClick={onCopyTranscript} className="btn btn-primary">
          {copied ? "Copied!" : "Copy Transcript"}
        </button>
      </div>
    </div>
  );
}

