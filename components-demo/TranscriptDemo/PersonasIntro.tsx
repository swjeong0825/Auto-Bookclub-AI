"use client";

import type { Persona } from "@/lib/types";

interface PersonasIntroProps {
  personas: [Persona, Persona];
}

export default function PersonasIntro({ personas }: PersonasIntroProps) {
  return (
    <div className="personas-intro">
      {personas.map((persona, idx) => (
        <div key={idx} className="persona-card">
          <div className="persona-avatar">{idx === 0 ? "A" : "B"}</div>
          <div>
            <div className="persona-name">{persona.name}</div>
            <div className="persona-role subtle">{persona.role}</div>
            <div className="persona-stance">{persona.stance}</div>
            {persona.tagline && (
              <div className="persona-tagline subtle">
                "{persona.tagline}"
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

