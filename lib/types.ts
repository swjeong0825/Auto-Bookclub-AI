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
  speaker: "A" | "B" | "USER";
  text: string;
  topic?: string;
  asksReader?: boolean; // Indicates if this turn asks a question to the reader
  respondsToUser?: boolean; // Indicates if this turn is responding to the user's input
};

export type Transcript = {
  personas: [Persona, Persona];
  turns: DebateTurn[];
  discussionTopic?: string;
};

