"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/client";
import type { Persona, Transcript } from "@/lib/types";
import { SSE_PREFIX } from "@/lib/constants";

export default function DiscussClient() {
  const router = useRouter();
  const { meta, personas, transcript, setPersonas, setTranscript, setProgress } = useAppStore();
  const hasStartedRef = useRef(false);
  

  useEffect(() => {
    if (!meta) {
      router.replace("/");
      return;
    }

    // If transcript exists, we're done - don't run again
    if (transcript) {
      return;
    }

    // Prevent multiple calls - if we've already started, don't run again
    if (hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;

    (async () => {
      try {
        // Get current personas from store (may have been set by previous run)
        let currentPersonas = personas;
        
        if (!currentPersonas) {
          const r1 = await fetch("/api/discussions/personas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ metaHint: meta }),
          });

          if (!r1.ok) {
            const errorData = await r1.json().catch(() => ({}));
            const errorMsg = errorData.details || errorData.error || "Failed to create personas";
            console.error("Personas API error:", errorMsg, errorData);
            throw new Error(errorMsg);
          }

          const j1 = await r1.json();
          if (!j1.personas) {
            throw new Error("Personas response missing personas data");
          }
          currentPersonas = j1.personas as [Persona, Persona];
          setPersonas(currentPersonas);
        }

        const r2 = await fetch("/api/discussions/debate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            metaHint: meta,
            personas: currentPersonas,
            turns: 12,
          }),
        });

        if (!r2.ok) {
          const errorData = await r2.json().catch(() => ({}));
          const errorMsg = errorData.details || errorData.error || "Failed to generate debate";
          console.error("Debate API error:", errorMsg, errorData);
          throw new Error(errorMsg);
        }

        // Read the stream
        const reader = r2.body?.getReader();
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
                  setProgress(data.progress);
                } else if (data.type === "complete") {
                  setTranscript(data.transcript as Transcript);
                  setProgress(undefined); // Clear progress when complete
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
        console.error("Discussion pipeline error:", error);
        hasStartedRef.current = false; // Reset on error so user can retry
        setProgress(undefined); // Clear progress on error
      }
    })();
    // Only depend on meta - other values are checked inside the effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta]);

  return null;
}

