export type BookResult = {
  title: string;
  author: string;
  year?: number;
  coverUrl?: string;
  workKey?: string;
  subjects?: string[];
  description?: string;
};

export type Persona = {
  name: string;
  role: string;
  stance: string;
  voice: string;
  tagline?: string;
};

export type DebateTurn = {
  idx: number;
  speaker: "A" | "B";
  text: string;
  topic?: string;
};

export type Transcript = {
  personas: [Persona, Persona];
  turns: DebateTurn[];
};

