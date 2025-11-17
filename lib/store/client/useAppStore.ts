"use client";

import { create } from "zustand";
import type { BookResult, Persona, Transcript } from "@/lib/types";
import { Language } from "@/lib/constants";

type Step = "idle" | "meta" | "personas" | "debate" | "done";

export const useAppStore = create<{
  step: Step;
  meta?: BookResult;
  language: Language;
  personas?: [Persona, Persona];
  transcript?: Transcript;
  progress?: number;
  setMeta: (m: BookResult, lang: Language) => void;
  setPersonas: (p: [Persona, Persona]) => void;
  setTranscript: (t: Transcript) => void;
  setProgress: (p: number | undefined) => void;
  reset: () => void;
}>((set) => ({
  step: "idle",
  language: Language.ENGLISH,
  progress: undefined,
  setMeta: (meta, language) =>
    set({ meta, language, personas: undefined, transcript: undefined, progress: undefined, step: "meta" }),
  setPersonas: (personas) => set({ personas, step: "personas" }),
  setTranscript: (transcript) => set({ transcript, progress: undefined, step: "done" }),
  setProgress: (progress) => set({ progress }),
  reset: () =>
    set({
      step: "idle",
      meta: undefined,
      language: Language.ENGLISH,
      personas: undefined,
      transcript: undefined,
      progress: undefined,
    }),
}));

