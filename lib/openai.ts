export async function openaiJson<T>(opts: {
  system: string;
  input?: any;
  schema: any;
  model?: string;
  maxOutputTokens?: number;
}): Promise<T> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  // Try Responses API first, fallback to Chat Completions
  const useResponsesAPI = process.env.USE_RESPONSES_API === "true";
  const endpoint = useResponsesAPI
    ? "https://api.openai.com/v1/responses"
    : "https://api.openai.com/v1/chat/completions";

  const model = opts.model ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  let requestBody: any;
  if (useResponsesAPI) {
    // Responses API format
    requestBody = {
      model,
      system: opts.system,
      input: opts.input,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "auto_bookclub",
          schema: opts.schema,
          strict: true,
        },
      },
      max_output_tokens: opts.maxOutputTokens ?? 400,
    };
  } else {
    // Chat Completions API format with JSON mode
    const userMessage = opts.input
      ? `Book context: ${JSON.stringify(opts.input, null, 2)}`
      : "Generate the response based on the system instructions.";

    requestBody = {
      model,
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: userMessage },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "auto_bookclub",
          schema: opts.schema,
          strict: true,
        },
      },
      max_tokens: opts.maxOutputTokens ?? 400,
    };
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const errorText = await res.text();
    let errorMessage = `OpenAI API error: ${res.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage += ` - ${errorJson.error?.message || errorText}`;
    } catch {
      errorMessage += ` - ${errorText}`;
    }
    throw new Error(errorMessage);
  }

  const j = await res.json();

  if (useResponsesAPI) {
    return JSON.parse(j.output_text) as T;
  } else {
    // Chat Completions API response
    const content = j.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No content in OpenAI response");
    }
    return JSON.parse(content) as T;
  }
}

