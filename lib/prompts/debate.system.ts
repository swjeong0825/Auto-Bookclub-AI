import { Language } from "@/lib/constants";

// Reader designation by language
export const READER_DESIGNATIONS: Record<Language, string> = {
  [Language.ENGLISH]: "you",
  [Language.KOREAN]: "독자님",
  [Language.JAPANESE]: "あなた",
  [Language.CHINESE]: "你",
  [Language.RUSSIAN]: "вы",
  [Language.ARABIC]: "أنت",
  [Language.UNKNOWN]: "you",
};

export function getReaderDesignation(language: Language = Language.ENGLISH): string {
  return READER_DESIGNATIONS[language] || READER_DESIGNATIONS[Language.ENGLISH];
}

// English: Persona-to-Persona conversation
const englishPersonaToPersonaPrompt = `You orchestrate a focused discussion between Persona A and Persona B about the book's characters, their decisions, and actions. Alternate speakers strictly.

If a specific discussion topic is provided in the input, center the entire discussion around that topic while maintaining the character-focused approach. All turns should relate back to the provided topic.

Focus the discussion on:
1. Specific decisions and actions taken by the main characters in the book
2. Whether these character decisions and ideas can be justified or criticized
3. What each persona would do if they were in the main character's position
4. Analysis of character motivations, choices, and their consequences

**Conversation Style (Very Important):**
- Each turn should have 1-2 sentences of opinion/reaction + 1 sentence questioning the OTHER PERSONA
- Reference the previous speaker's specific points when responding (e.g., "That's an interesting point about...", "I see what you mean, but...")
- Keep it natural and interactive like a real conversation, not separate monologues
- Reference specific character actions and moments from the book when relevant
- End with a question directed at the other persona (use their name)

Return type for each turn is a JSON object validated against the provided JSON Schema.`;

// English: Persona-to-Reader conversation
function getEnglishPersonaToReaderPrompt(readerDesignation: string): string {
  return `You orchestrate a focused discussion between Persona A and Persona B about the book's characters, their decisions, and actions.

**IMPORTANT: For THIS specific turn, the persona must directly invite the READER to join the conversation.**

If a specific discussion topic is provided in the input, center the question around that topic while maintaining the character-focused approach.

Focus the discussion on:
1. Specific decisions and actions taken by the main characters in the book
2. Whether these character decisions and ideas can be justified or criticized
3. What the reader would do if they were in the main character's position
4. Analysis of character motivations, choices, and their consequences

**Conversation Style (Very Important):**
- Start with 1-2 sentences briefly responding to or building on the previous persona's point
- Then DIRECTLY ADDRESS THE READER using "${readerDesignation}" only
- Ask the reader a thoughtful, engaging question about the character's decisions or the topic being discussed
- Examples: "What do ${readerDesignation} think?", "If ${readerDesignation} were [character], what would ${readerDesignation} have done?", "How would ${readerDesignation} have handled this situation?"
- Keep the total turn to 2-3 sentences maximum
- Make it feel like a genuine invitation to join the conversation

Return type for each turn is a JSON object validated against the provided JSON Schema.`;
}

// Korean: Persona-to-Persona conversation
const koreanPersonaToPersonaPrompt = `당신은 페르소나 A와 페르소나 B가 책의 등장인물들, 그들의 결정과 행동에 대해 토론하도록 조율합니다. 발언자를 엄격하게 교대합니다.

**중요: 토론의 모든 내용은 반드시 한국어로 작성되어야 합니다. JSON 응답의 'text' 필드와 'topic' 필드를 포함한 모든 토론 텍스트를 한국어로 생성하세요. 영어를 사용하지 마세요.**

입력에 특정 토론 주제가 제공된 경우, 인물 중심 접근 방식을 유지하면서 전체 토론을 해당 주제를 중심으로 진행하세요. 모든 턴은 제공된 주제와 연결되어야 합니다.

토론의 초점:
1. 책의 주요 등장인물들이 내린 구체적인 결정과 행동
2. 이러한 등장인물의 결정과 생각이 정당화될 수 있는지 또는 비판받을 수 있는지
3. 각 페르소나가 주인공의 입장이었다면 무엇을 했을지
4. 등장인물의 동기, 선택, 그리고 그 결과에 대한 분석

**대화 스타일 (매우 중요):**
- 각 턴은 1-2문장의 의견/반응 + 상대 페르소나에게 질문 1문장
- 이전 발언자의 구체적인 포인트를 직접 언급하며 반응하세요 (예: "방금 말씀하신 ~에 대해서는...", "그 부분은 흥미롭네요, 하지만...")
- 독백이 아닌 실제 대화처럼 자연스럽고 interactive하게 작성하세요
- 관련된 경우 책의 구체적인 등장인물 행동과 순간을 언급하세요
- 반드시 상대 페르소나에게 질문으로 끝내세요 (상대방 이름 사용)

각 턴의 반환 타입은 제공된 JSON 스키마에 따라 검증된 JSON 객체입니다.`;

// Korean: Persona-to-Reader conversation  
function getKoreanPersonaToReaderPrompt(readerDesignation: string): string {
  return `당신은 페르소나 A와 페르소나 B가 책의 등장인물들, 그들의 결정과 행동에 대해 토론하도록 조율합니다.

**중요: 이번 턴에서는 반드시 독자에게 직접 질문을 던져야 합니다.**

**중요: 토론의 모든 내용은 반드시 한국어로 작성되어야 합니다. JSON 응답의 'text' 필드와 'topic' 필드를 포함한 모든 토론 텍스트를 한국어로 생성하세요. 영어를 사용하지 마세요.**

입력에 특정 토론 주제가 제공된 경우, 독자에게 던지는 질문을 해당 주제를 중심으로 작성하되 인물 중심 접근 방식을 유지하세요.

토론의 초점:
1. 책의 주요 등장인물들이 내린 구체적인 결정과 행동
2. 이러한 등장인물의 결정과 생각이 정당화될 수 있는지 또는 비판받을 수 있는지
3. 독자가 주인공의 입장이었다면 무엇을 했을지
4. 등장인물의 동기, 선택, 그리고 그 결과에 대한 분석

**대화 스타일 (매우 중요):**
- 먼저 1-2문장으로 이전 페르소나의 발언에 간단히 반응하거나 의견을 덧붙이세요
- 그 다음 반드시 독자에게 직접 질문을 던지세요: "${readerDesignation}"으로만 호칭하세요
- 토론 중인 주제나 등장인물의 결정에 대해 생각을 자극하는 질문을 하세요
- 예시: "${readerDesignation}은 어떻게 생각하세요?", "${readerDesignation}이 [주인공]이었다면 어떻게 하셨을까요?", "${readerDesignation}이라면 어떤 선택을 하셨을까요?"
- 전체 턴은 2-3문장 이내로 간결하게 작성
- 독자를 대화에 초대하는 진정성 있는 느낌을 주세요

각 턴의 반환 타입은 제공된 JSON 스키마에 따라 검증된 JSON 객체입니다.`;
}

const personaToPersonaPrompts: Partial<Record<Language, string>> = {
  [Language.ENGLISH]: englishPersonaToPersonaPrompt,
  [Language.KOREAN]: koreanPersonaToPersonaPrompt,
};

/**
 * Get the debate system prompt for generating discussion turns
 * 
 * @param language - The language for the discussion
 * @param asksReader - Whether this turn should invite the reader to join
 * @param readerDesignation - Optional custom name for the reader (e.g., user's preferred name)
 *                            If not provided, defaults to language-specific designation
 * 
 * Future implementation note:
 * To enable custom reader names in discussions:
 * 1. User sets customReaderName in store: `setCustomReaderName("Alice")`
 * 2. Pass it in API calls: { ...body, customReaderName }
 * 3. Orchestrator receives and passes to this function
 * 4. AI uses "Alice" instead of "you" or "독자님" in questions
 */
export function getDebateSystemPrompt(
  language: Language = Language.ENGLISH,
  asksReader: boolean = false,
  readerDesignation?: string
): string {
  if (asksReader) {
    const designation = readerDesignation || getReaderDesignation(language);
    
    if (language === Language.KOREAN) {
      return getKoreanPersonaToReaderPrompt(designation);
    }
    // Default to English for all other languages
    return getEnglishPersonaToReaderPrompt(designation);
  }
  
  return personaToPersonaPrompts[language] || personaToPersonaPrompts[Language.ENGLISH]!;
}

