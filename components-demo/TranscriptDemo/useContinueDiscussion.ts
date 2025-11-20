"use client";

import { useState, useRef } from "react";
import { useAppStore } from "@/lib/store/client";
import type { DebateTurn } from "@/lib/types";
import { SSE_PREFIX, DEFAULT_DISCUSSION_TURNS } from "@/lib/constants";

export function useContinueDiscussion() {
  const { meta, transcript, language, selectedTopic, customReaderName, setTranscript } = useAppStore();
  const [isContinuing, setIsContinuing] = useState(false);
  const [continueProgress, setContinueProgress] = useState<number | undefined>(undefined);
  const hasStartedContinue = useRef(false);

  const handleContinueDiscussion = async (userPrompt: string) => {
    if (!userPrompt.trim() || !transcript || isContinuing || hasStartedContinue.current) {
      return;
    }

    hasStartedContinue.current = true;
    setIsContinuing(true);
    setContinueProgress(0);

    try {
      const response = await fetch("/api/demo/discussions/continue", {
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

  return {
    handleContinueDiscussion,
    isContinuing,
    continueProgress,
  };
}

