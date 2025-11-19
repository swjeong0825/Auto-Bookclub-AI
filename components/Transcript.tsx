"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/client";
import type { DebateTurn } from "@/lib/types";
import { SSE_PREFIX, DEFAULT_DISCUSSION_TURNS } from "@/lib/constants";
import { getReaderDesignation } from "@/lib/prompts/debate.system";

export default function Transcript() {
  const router = useRouter();
  const { meta, transcript, progress, reset, language, selectedTopic, customReaderName, setTranscript } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [userPrompt, setUserPrompt] = useState("");
  const [isContinuing, setIsContinuing] = useState(false);
  const [continueProgress, setContinueProgress] = useState<number | undefined>(undefined);
  const hasStartedContinue = useRef(false);

  // Get reader designation: use custom name if provided, otherwise default to language-based designation
  const readerDesignation = customReaderName || getReaderDesignation(language);
  // Capitalize first letter for display (only if not custom name, as custom name should be displayed as-is)
  const readerLabel = customReaderName || 
    (readerDesignation.charAt(0).toUpperCase() + readerDesignation.slice(1));

  if (!meta) {
    return null;
  }

  if (!transcript) {
    const progressPercent = progress !== undefined ? Math.round(progress * 100) : 0;
    return (
      <div className="discuss-container">
        <div className="loading-state">
          <h1 className="h1">{meta.title}</h1>
          <p className="subtle">Creating personas and generating debate...</p>
          {progress !== undefined && (
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="progress-text">{progressPercent}%</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const handleContinueDiscussion = async () => {
    if (!userPrompt.trim() || !transcript || isContinuing) {
      return;
    }

    if (hasStartedContinue.current) {
      return;
    }

    hasStartedContinue.current = true;
    setIsContinuing(true);
    setContinueProgress(0);

    try {
      const response = await fetch("/api/discussions/continue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metaHint: meta,
          personas: transcript.personas,
          currentTranscript: transcript.turns,
          userPrompt: userPrompt.trim(),
          language,
          continueTurns: DEFAULT_DISCUSSION_TURNS,
          topic: selectedTopic,
          customReaderName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.details || errorData.error || "Failed to continue discussion";
        console.error("Continue API error:", errorMsg, errorData);
        throw new Error(errorMsg);
      }

      // Read the stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      if (!reader) {
        throw new Error("Response body is not a stream");
      }

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        
        // Process complete SSE messages (lines ending with \n\n)
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || ""; // Keep incomplete message in buffer

        for (const line of lines) {
          if (line.startsWith(SSE_PREFIX)) {
            try {
              const data = JSON.parse(line.slice(SSE_PREFIX.length));
              
              if (data.type === "progress") {
                setContinueProgress(data.progress);
              } else if (data.type === "complete") {
                const newTurns = data.newTurns as DebateTurn[];
                // Append new turns to existing transcript
                setTranscript({
                  ...transcript,
                  turns: [...transcript.turns, ...newTurns],
                });
                setContinueProgress(undefined);
                setUserPrompt(""); // Clear the input
              } else if (data.type === "error") {
                throw new Error(data.details || data.error || "Unknown error");
              }
            } catch (parseError) {
              console.error("Error parsing SSE data:", parseError, line);
            }
          }
        }
      }
    } catch (error) {
      console.error("Continue discussion error:", error);
      setContinueProgress(undefined);
    } finally {
      setIsContinuing(false);
      hasStartedContinue.current = false;
    }
  };

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
      if (turn.speaker === "USER") {
        text += `${readerLabel}: ${turn.text}\n\n`;
      } else {
        const persona = turn.speaker === "A" ? t.personas[0] : t.personas[1];
        text += `${persona.name} (${turn.speaker}): ${turn.text}\n\n`;
      }
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

      {selectedTopic && (
        <div className="discussion-topic-banner">
          <div className="discussion-topic-label">Discussion Topic</div>
          <div className="discussion-topic-text">{selectedTopic}</div>
        </div>
      )}

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
            turn.speaker === "A" ? transcript.personas[0] : transcript.personas[1];
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

      {/* Loading state for continuation */}
      {isContinuing && continueProgress !== undefined && (
        <div className="loading-state" style={{ marginTop: "var(--space-4)" }}>
          <p className="subtle">Continuing discussion...</p>
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.round(continueProgress * 100)}%` }}
              />
            </div>
            <p className="progress-text">{Math.round(continueProgress * 100)}%</p>
          </div>
        </div>
      )}

      {/* User prompt input */}
      {!isContinuing && (
        <div className="user-prompt-section" style={{ 
          marginTop: "var(--space-6)", 
          padding: "var(--space-4)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-md)",
          background: "var(--surface-bg)"
        }}>
          <label 
            htmlFor="user-prompt" 
            style={{ 
              display: "block", 
              marginBottom: "var(--space-2)",
              fontWeight: 600,
              fontSize: "var(--text-base)"
            }}
          >
            Continue the Discussion
          </label>
          <p className="subtle" style={{ marginBottom: "var(--space-3)", fontSize: "var(--text-sm)" }}>
            Ask a question or share your thoughts to continue the conversation with the personas.
          </p>
          <textarea
            id="user-prompt"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="What are your thoughts on this discussion? Ask a question or share your perspective..."
            disabled={isContinuing}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleContinueDiscussion();
              }
            }}
            style={{
              width: "100%",
              minHeight: "120px",
              padding: "var(--space-3)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--text-base)",
              fontFamily: "inherit",
              resize: "vertical",
              marginBottom: "var(--space-3)",
            }}
          />
          <button
            onClick={handleContinueDiscussion}
            disabled={!userPrompt.trim() || isContinuing}
            className="btn btn-primary"
            style={{
              opacity: !userPrompt.trim() || isContinuing ? 0.5 : 1,
              cursor: !userPrompt.trim() || isContinuing ? "not-allowed" : "pointer",
            }}
          >
            {isContinuing ? "Continuing..." : "Continue Discussion"}
          </button>
          <span className="subtle" style={{ marginLeft: "var(--space-3)", fontSize: "var(--text-sm)" }}>
            Press ⌘+Enter (or Ctrl+Enter) to submit
          </span>
        </div>
      )}
    </div>
  );
}

