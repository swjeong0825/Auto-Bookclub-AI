"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/useAppStore";

export default function Transcript() {
  const router = useRouter();
  const { meta, transcript, reset } = useAppStore();
  const [copied, setCopied] = useState(false);

  if (!meta) {
    return null;
  }

  if (!transcript) {
    return (
      <div className="discuss-container">
        <div className="loading-state">
          <h1 className="h1">{meta.title}</h1>
          <p className="subtle">Creating personas and generating debate...</p>
        </div>
      </div>
    );
  }

  const copyToClipboard = () => {
    const text = formatTranscript(transcript);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const formatTranscript = (t: typeof transcript) => {
    let text = `Book Discussion: ${meta.title} by ${meta.author}\n\n`;
    text += `Persona A: ${t.personas[0].name} - ${t.personas[0].role}\n`;
    text += `Persona B: ${t.personas[1].name} - ${t.personas[1].role}\n\n`;
    text += "---\n\n";
    t.turns.forEach((turn) => {
      const persona = turn.speaker === "A" ? t.personas[0] : t.personas[1];
      text += `${persona.name} (${turn.speaker}): ${turn.text}\n\n`;
    });
    return text;
  };

  return (
    <div className="discuss-container">
      <div className="discuss-header">
        <div>
          <h1 className="h1">{meta.title}</h1>
          <p className="subtle">{meta.author}</p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
          <button
            onClick={() => {
              reset();
              router.push("/");
            }}
            className="btn"
          >
            New Search
          </button>
          <button onClick={copyToClipboard} className="btn btn-primary">
            {copied ? "Copied!" : "Copy Transcript"}
          </button>
        </div>
      </div>

      <div className="personas-intro">
        <div className="persona-card">
          <div className="persona-avatar">A</div>
          <div>
            <div className="persona-name">{transcript.personas[0].name}</div>
            <div className="persona-role subtle">{transcript.personas[0].role}</div>
            <div className="persona-stance">{transcript.personas[0].stance}</div>
            {transcript.personas[0].tagline && (
              <div className="persona-tagline subtle">
                "{transcript.personas[0].tagline}"
              </div>
            )}
          </div>
        </div>
        <div className="persona-card">
          <div className="persona-avatar">B</div>
          <div>
            <div className="persona-name">{transcript.personas[1].name}</div>
            <div className="persona-role subtle">{transcript.personas[1].role}</div>
            <div className="persona-stance">{transcript.personas[1].stance}</div>
            {transcript.personas[1].tagline && (
              <div className="persona-tagline subtle">
                "{transcript.personas[1].tagline}"
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="transcript">
        {transcript.turns.map((turn) => {
          const persona =
            turn.speaker === "A" ? transcript.personas[0] : transcript.personas[1];
          return (
            <div key={turn.idx} className="turn">
              <div className="turn-header">
                <div className="turn-avatar">{turn.speaker}</div>
                <div className="turn-speaker">{persona.name}</div>
                {turn.topic && (
                  <span className="turn-topic subtle">• {turn.topic}</span>
                )}
              </div>
              <div className="turn-text">{turn.text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

