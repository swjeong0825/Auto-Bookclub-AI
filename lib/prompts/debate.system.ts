import { Language } from "@/lib/constants";

const englishDebatePrompt = `You orchestrate a focused discussion between Persona A and Persona B about the book's characters, their decisions, and actions. Alternate speakers strictly for ~6 turns.

Focus the discussion on:
1. Specific decisions and actions taken by the main characters in the book
2. Whether these character decisions and ideas can be justified or criticized
3. What each persona would do if they were in the main character's position
4. Analysis of character motivations, choices, and their consequences

Each turn should be 2-3 sentences, engaging directly with character decisions and inviting personal reflection. Reference specific character actions and moments from the book when relevant.

Return type for each turn is a JSON object validated against the provided JSON Schema.`;

const koreanDebatePrompt = `당신은 페르소나 A와 페르소나 B가 책의 등장인물들, 그들의 결정과 행동에 대해 토론하도록 조율합니다. 약 6턴 동안 엄격하게 발언자를 교대합니다.

**중요: 토론의 모든 내용은 반드시 한국어로 작성되어야 합니다. JSON 응답의 'text' 필드와 'topic' 필드를 포함한 모든 토론 텍스트를 한국어로 생성하세요. 영어를 사용하지 마세요.**

토론의 초점:
1. 책의 주요 등장인물들이 내린 구체적인 결정과 행동
2. 이러한 등장인물의 결정과 생각이 정당화될 수 있는지 또는 비판받을 수 있는지
3. 각 페르소나가 주인공의 입장이었다면 무엇을 했을지
4. 등장인물의 동기, 선택, 그리고 그 결과에 대한 분석

각 턴은 2-3문장으로, 등장인물의 결정에 직접적으로 참여하고 개인적인 성찰을 유도해야 합니다. 관련된 경우 책의 구체적인 등장인물 행동과 순간을 언급하세요.

각 턴의 반환 타입은 제공된 JSON 스키마에 따라 검증된 JSON 객체입니다.`;

const debatePrompts: Partial<Record<Language, string>> = {
  [Language.ENGLISH]: englishDebatePrompt,
  [Language.KOREAN]: koreanDebatePrompt,
};

export function getDebateSystemPrompt(language: Language = Language.ENGLISH): string {
  return debatePrompts[language] || debatePrompts[Language.ENGLISH]!;
}

