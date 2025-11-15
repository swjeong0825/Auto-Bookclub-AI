/**
 * OpenAI Responses API client
 * 
 * Uses the /v1/responses endpoint with structured JSON output via JSON Schema.
 * 
 * Design:
 * - `instructions` (system parameter): Provides the prompt and generic guidelines
 * - `input` (input parameter): Provides the specific data/context
 * 
 * While we maintain the conceptual separation of System (instructions) and User (input),
 * the Responses API uses `instructions` and `input` fields rather than role-based messages.
 */

interface OpenaiJsonOptions<T> {  
  /** System prompt providing guidelines and behavior instructions */
  system: string;
  /** Specific input data/context for this request */
  input: unknown;
  /** JSON Schema for structured output validation */
  schema: Record<string, unknown>;
  /** Maximum output tokens (optional) */
  maxOutputTokens?: number;

}

const OPENAI_BASE_URL = "https://api.openai.com/v1/responses";

function getApiKey(): string {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("OPENAI_API_KEY environment variable is required");
  }
  return key;
}

function getModel(): string {
  return process.env.OPENAI_MODEL || "gpt-4o-mini";
}

/**
 * Calls OpenAI Responses API with structured JSON output
 * 
 * @param options Configuration object with system prompt, input data, and JSON schema
 * @returns Parsed JSON response matching the provided schema
 * @throws Error if API call fails or response doesn't match schema
 */
export async function openaiJson<T>(options: OpenaiJsonOptions<T>): Promise<T> {
  const { system, input, schema, maxOutputTokens } = options;

  const apiKey = getApiKey();
  const model = getModel();

  const requestBody: {
    model: string;
    instructions: string;
    input: string | unknown[];
    text: {
      format: {
        type: "json_schema";
        name: string;
        schema: Record<string, unknown>;
        strict: boolean;
      };
    };
    max_output_tokens?: number;
  } = {
    model: model,
    instructions: system,
    input: typeof input === "string" || Array.isArray(input) 
      ? input 
      : JSON.stringify(input),
    text: {
      format: {
        type: "json_schema",
        name: "structured_output",
        schema: schema,
        strict: true,
      },
    },
  };

  if (maxOutputTokens !== undefined) {
    requestBody.max_output_tokens = maxOutputTokens;
  }

  const response = await fetch(OPENAI_BASE_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `OpenAI API error: ${response.status} ${response.statusText}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error?.message || errorMessage;
    } catch {
      errorMessage = `${errorMessage}\n${errorText}`;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  // The Responses API with JSON Schema returns structured output
  // Response format: array with content items containing text fields
  // Structure: data[0].content[0].text (JSON string that needs parsing)

  const parsed = JSON.parse(data.output[0].content[0].text);

  // check if parsed is the type T

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid JSON response from OpenAI");
  }

  return parsed as T;
}

