"use client";

import { create } from "zustand";
import type { BookResult, Persona, Transcript } from "@/lib/types";

type Step = "idle" | "meta" | "personas" | "debate" | "done";

export const useAppStore = create<{
  step: Step;
  meta?: BookResult;
  personas?: [Persona, Persona];
  transcript?: Transcript;
  progress?: number;
  setMeta: (m: BookResult) => void;
  setPersonas: (p: [Persona, Persona]) => void;
  setTranscript: (t: Transcript) => void;
  setProgress: (p: number | undefined) => void;
  reset: () => void;
}>((set) => ({
  step: "idle",
  progress: undefined,
  setMeta: (meta) =>
    set({ meta, personas: undefined, transcript: undefined, progress: undefined, step: "meta" }),
  setPersonas: (personas) => set({ personas, step: "personas" }),
  setTranscript: (transcript) => set({ transcript, progress: undefined, step: "done" }),
  setProgress: (progress) => set({ progress }),
  reset: () =>
    set({
      step: "idle",
      meta: undefined,
      personas: undefined,
      transcript: undefined,
      progress: undefined,
    }),
}));

