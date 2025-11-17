"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/useAppStore";
import type { Persona } from "@/lib/types";

export default function DiscussClient() {
  const router = useRouter();
  const { meta, personas, transcript, setPersonas, setTranscript } = useAppStore();
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

        const j2 = await r2.json();
        setTranscript(j2);
      } catch (error) {
        console.error("Discussion pipeline error:", error);
        hasStartedRef.current = false; // Reset on error so user can retry
      }
    })();
    // Only depend on meta - other values are checked inside the effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta]);

  return null;
}

