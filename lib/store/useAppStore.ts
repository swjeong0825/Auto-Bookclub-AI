"use client";

import { create } from "zustand";
import type { BookResult, Persona, Transcript } from "@/lib/types";

type Step = "idle" | "meta" | "personas" | "debate" | "done";

export const useAppStore = create<{
  step: Step;
  meta?: BookResult;
  personas?: [Persona, Persona];
  transcript?: Transcript;
  setMeta: (m: BookResult) => void;
  setPersonas: (p: [Persona, Persona]) => void;
  setTranscript: (t: Transcript) => void;
  reset: () => void;
}>((set) => ({
  step: "idle",
  setMeta: (meta) =>
    set({ meta, personas: undefined, transcript: undefined, step: "meta" }),
  setPersonas: (personas) => set({ personas, step: "personas" }),
  setTranscript: (transcript) => set({ transcript, step: "done" }),
  reset: () =>
    set({
      step: "idle",
      meta: undefined,
      personas: undefined,
      transcript: undefined,
    }),
}));

