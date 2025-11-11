"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/useAppStore";

export default function DiscussClient() {
  const router = useRouter();
  const { meta, personas, setPersonas, setTranscript } = useAppStore();

  useEffect(() => {
    if (!meta) {
      router.replace("/");
      return;
    }

    (async () => {
      try {
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
          currentPersonas = j1.personas;
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
      }
    })();
  }, [meta, personas, router, setPersonas, setTranscript]);

  return null;
}

