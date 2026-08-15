import { getEnv } from "@/lib/env";
import { err, ok, type Result } from "./result";

export type GrokMessageContent =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string; detail?: "low" | "high" } };

export type GrokMessage = {
  role: "system" | "user" | "assistant";
  content: string | GrokMessageContent[];
};

export type GrokError =
  | { kind: "missing_key" }
  | { kind: "http"; status: number; body: string }
  | { kind: "parse"; raw: string }
  | { kind: "network"; message: string };

type GrokOptions = {
  messages: GrokMessage[];
  temperature?: number;
  jsonMode?: boolean;
  maxTokens?: number;
  fetchImpl?: typeof fetch;
  retries?: number;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
      reasoning_content?: string | null;
    };
  }>;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function snippet(text: string): string {
  return text.replaceAll(/\s+/g, " ").trim().slice(0, 180);
}

export function describeGrokError(error: GrokError): string {
  switch (error.kind) {
    case "missing_key":
      return "GROK_API_KEY is not set on Vercel. Add it under Project → Settings → Environment Variables for Production.";
    case "http":
      if (error.status === 401 || error.status === 403) {
        return "xAI rejected GROK_API_KEY. The variable is present on Vercel but the key is invalid or revoked.";
      }
      if (error.status === 429) {
        return "xAI rate-limited the request. Wait a moment and try the photo again.";
      }
      return `xAI returned ${error.status}: ${snippet(error.body) || "no body"}`;
    case "parse":
      return "Grok returned a response that was not a spec. The photo reached xAI; the model output could not be read.";
    case "network":
      return `Could not reach xAI (${error.message}).`;
    default: {
      const _never: never = error;
      return _never;
    }
  }
}

export async function grokComplete(options: GrokOptions): Promise<Result<string, GrokError>> {
  const env = getEnv();
  if (!env.GROK_API_KEY) {
    return err({ kind: "missing_key" });
  }
  const fetchImpl = options.fetchImpl ?? fetch;
  const retries = options.retries ?? 2;
  let lastError: GrokError = { kind: "network", message: "no attempt" };

  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await fetchImpl(`${env.GROK_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.GROK_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: env.GROK_MODEL,
          messages: options.messages,
          temperature: options.temperature ?? 0.2,
          max_tokens: options.maxTokens ?? 4096,
          response_format: options.jsonMode === false ? undefined : { type: "json_object" },
        }),
      });
      const body = await response.text();
      if (response.status === 429 || response.status >= 500) {
        lastError = { kind: "http", status: response.status, body };
        await sleep(400 * 2 ** attempt);
        continue;
      }
      if (!response.ok) {
        return err({ kind: "http", status: response.status, body });
      }
      let parsed: ChatCompletionResponse;
      try {
        parsed = JSON.parse(body) as ChatCompletionResponse;
      } catch {
        return err({ kind: "parse", raw: body });
      }
      const message = parsed.choices?.[0]?.message;
      const content = message?.content || message?.reasoning_content;
      if (!content) {
        return err({ kind: "parse", raw: body });
      }
      return ok(content);
    } catch (error) {
      lastError = {
        kind: "network",
        message: error instanceof Error ? error.message : "network error",
      };
      await sleep(400 * 2 ** attempt);
    }
  }
  return err(lastError);
}

export async function grokJson<T>(
  options: GrokOptions,
  parse: (value: unknown) => T,
): Promise<Result<T, GrokError>> {
  const completed = await grokComplete(options);
  if (!completed.ok) {
    if (
      completed.error.kind === "http" &&
      completed.error.status === 400 &&
      options.jsonMode !== false
    ) {
      return grokJson({ ...options, jsonMode: false }, parse);
    }
    return completed;
  }
  try {
    const raw: unknown = JSON.parse(extractJson(completed.value));
    return ok(parse(raw));
  } catch {
    return err({ kind: "parse", raw: completed.value });
  }
}

export function extractJson(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return trimmed;
  }
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }
  return trimmed;
}
