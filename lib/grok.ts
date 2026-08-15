import { getEnv } from "@/lib/env";
import { err, ok, type Result } from "@/lib/result";

export type GrokMessageContent =
  { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };

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
  fetchImpl?: typeof fetch;
  retries?: number;
};

type ChatCompletionResponse = {
  choices?: Array<{ message?: { content?: string | null } }>;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
      const content = parsed.choices?.[0]?.message?.content;
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
  const completed = await grokComplete({ ...options, jsonMode: true });
  if (!completed.ok) {
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
