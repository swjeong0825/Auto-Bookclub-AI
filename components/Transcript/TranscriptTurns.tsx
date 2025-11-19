"use client";

import type { DebateTurn, Persona } from "@/lib/types";

interface TranscriptTurnsProps {
  turns: DebateTurn[];
  personas: [Persona, Persona];
  readerLabel: string;
}

export default function TranscriptTurns({
  turns,
  personas,
  readerLabel,
}: TranscriptTurnsProps) {
  return (
    <div className="transcript">
      {turns.map((turn) => {
        // Handle user turns differently
        if (turn.speaker === "USER") {
          return (
            <div key={turn.idx} className="turn turn-user">
              <div className="turn-header">
                <div className="turn-avatar" style={{ background: "var(--accent-bg)" }}>
                  U
                </div>
                <div className="turn-speaker" style={{ fontWeight: 600 }}>
                  {readerLabel}
                </div>
              </div>
              <div className="turn-text" style={{ fontStyle: "italic" }}>
                {turn.text}
              </div>
            </div>
          );
        }

        const persona =
          turn.speaker === "A" ? personas[0] : personas[1];
        return (
          <div 
            key={turn.idx} 
            className={`turn ${turn.asksReader ? "turn-asks-reader" : ""}`}
          >
            <div className="turn-header">
              <div className="turn-avatar">{turn.speaker}</div>
              <div className="turn-speaker">{persona.name}</div>
              {turn.asksReader && (
                <div className="reader-question-badge">
                  💬 Asking you
                </div>
              )}
            </div>
            <div className="turn-text">{turn.text}</div>
          </div>
        );
      })}
    </div>
  );
}

