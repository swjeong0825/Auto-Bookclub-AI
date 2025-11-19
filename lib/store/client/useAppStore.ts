"use client";

import { create } from "zustand";
import type { BookResult, Persona, Transcript } from "@/lib/types";
import { Language } from "@/lib/constants";

type Step = "idle" | "meta" | "topic" | "personas" | "debate" | "done";

export const useAppStore = create<{
  step: Step;
  meta?: BookResult;
  language: Language;
  selectedTopic?: string;
  personas?: [Persona, Persona];
  transcript?: Transcript;
  progress?: number;
  setMeta: (m: BookResult, lang: Language) => void;
  setSelectedTopic: (topic: string) => void;
  setPersonas: (p: [Persona, Persona]) => void;
  setTranscript: (t: Transcript) => void;
  setProgress: (p: number | undefined) => void;
  reset: () => void;
}>((set) => ({
  step: "idle",
  language: Language.ENGLISH,
  progress: undefined,
  setMeta: (meta, language) =>
    set({ 
      meta, 
      language, 
      selectedTopic: undefined,
      personas: undefined, 
      transcript: undefined, 
      progress: undefined, 
      step: "meta" 
    }),
  setSelectedTopic: (selectedTopic) => set({ selectedTopic, step: "topic" }),
  setPersonas: (personas) => set({ personas, step: "personas" }),
  setTranscript: (transcript) => set({ transcript, progress: undefined, step: "done" }),
  setProgress: (progress) => set({ progress }),
  reset: () =>
    set({
      step: "idle",
      meta: undefined,
      language: Language.ENGLISH,
      selectedTopic: undefined,
      personas: undefined,
      transcript: undefined,
      progress: undefined,
    }),
}));

