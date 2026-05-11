import { retrieveContext } from "@/lib/knowledge-base";
import { getWebContext } from "@/lib/web-cache";

export type ModelType = "Приемная комиссия" | "База знаний ИТ.Москва" | "ИТ.Дизайн";

export type AIError = {
  code:
    | "CONFIG_ERROR"
    | "AUTH_ERROR"
    | "PERMISSION_ERROR"
    | "RATE_LIMIT"
    | "TIMEOUT"
    | "CONTENT_FILTER"
    | "EMPTY_RESPONSE"
    | "YANDEX_ERROR"
    | "UNKNOWN_ERROR";
  message: string;
  status?: number;
};

export type StreamResult =
  | { ok: false; error: AIError }
  | { ok: true; stream: AsyncGenerator<string, void, unknown> };

type AskParams = {
  prompt: string;
  modelType?: ModelType;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
};

type FMAlternative = {
  message?: { role?: string; text?: string };
  status?: string;
};

type FMEvent = {
  result?: {
    alternatives?: FMAlternative[];
  };
};

const BASE_URL =
  "https://llm.api.cloud.yandex.net/foundationModels/v1/completion";

const apiKey = process.env.YANDEX_API_KEY ?? process.env.AI_API_KEY;
const modelUri = process.env.YANDEX_MODEL_URI;
const admissionSystemPrompt = process.env.YANDEX_SYSTEM_PROMPT ?? "";
const knowledgeSystemPrompt =
  process.env.KNOWLEDGE_SYSTEM_PROMPT ??
  "Ты — Орбс, умный ИИ-помощник образовательного центра ИТ.Москва. " +
  "Помогай с вопросами по математике, физике, информатике, программированию и другим точным наукам. " +
  "Решай задачи пошагово. Не отвечай на вопросы о поступлении в колледж — для этого есть режим «Приемная комиссия».";

const configError = !apiKey
  ? "YANDEX_API_KEY or AI_API_KEY env is required"
  : !modelUri
    ? "YANDEX_MODEL_URI env is required"
    : null;

export async function askAIStream(params: AskParams): Promise<StreamResult> {
  if (configError || !apiKey || !modelUri) {
    return {
      ok: false,
      error: { code: "CONFIG_ERROR", message: configError ?? "AI client is not configured" },
    };
  }

  const isKnowledge = params.modelType === "База знаний ИТ.Москва";

  try {
    let fullSystemPrompt: string;

    if (isKnowledge) {
      fullSystemPrompt = knowledgeSystemPrompt;
    } else {
      const [kbContext, webContext] = await Promise.all([
        Promise.resolve(retrieveContext(params.prompt)),
        getWebContext(params.prompt),
      ]);
      fullSystemPrompt = admissionSystemPrompt;
      if (kbContext) fullSystemPrompt += `\n\nРелевантная информация из базы знаний:\n${kbContext}`;
      if (webContext) fullSystemPrompt += `\n\nАктуальная информация с сайтов ИТ.Москва:\n${webContext}`;
    }

    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Api-Key ${apiKey}`,
      },
      body: JSON.stringify({
        modelUri,
        completionOptions: {
          stream: true,
          temperature: params.temperature ?? 0.3,
          maxTokens: String(params.maxTokens ?? 1000),
        },
        messages: [
          { role: "system", text: fullSystemPrompt },
          { role: "user", text: params.prompt },
        ],
      }),
      signal: params.signal,
    });

    if (!res.ok || !res.body) {
      const text = await res.text().catch(() => "");
      const data = text ? safeJsonParse(text) : null;
      const message =
        getYandexErrorMessage(data) ??
        (text || `Yandex FM request failed: ${res.status}`);
      throw new YandexRequestError(message, res.status);
    }

    return { ok: true, stream: parseFMStream(res.body, params.signal) };
  } catch (error) {
    console.error("[AI setup error]", error);
    return { ok: false, error: normalizeError(error) };
  }
}

async function* parseFMStream(
  body: ReadableStream<Uint8Array>,
  signal?: AbortSignal,
): AsyncGenerator<string, void, unknown> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let prevLength = 0;

  try {
    while (true) {
      if (signal?.aborted) break;

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const parsed = safeJsonParse(trimmed) as FMEvent | null;
        const alternative = parsed?.result?.alternatives?.[0];
        if (!alternative) continue;

        const text = alternative.message?.text ?? "";
        const status = alternative.status ?? "";

        if (
          status === "ALTERNATIVE_STATUS_PARTIAL" ||
          status === "ALTERNATIVE_STATUS_FINAL"
        ) {
          const chunk = text.slice(prevLength);
          if (chunk) yield chunk;
          prevLength = text.length;
        }

        if (status === "ALTERNATIVE_STATUS_FINAL") return;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

class YandexRequestError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

function normalizeError(error: unknown): AIError {
  if (error instanceof YandexRequestError) {
    if (error.status === 401)
      return { code: "AUTH_ERROR", message: "Invalid Yandex API key", status: error.status };
    if (error.status === 403)
      return { code: "PERMISSION_ERROR", message: "Yandex API key has no permission", status: error.status };
    if (error.status === 429)
      return { code: "RATE_LIMIT", message: "Yandex rate limit exceeded", status: error.status };
    return { code: "YANDEX_ERROR", message: error.message, status: error.status };
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return { code: "TIMEOUT", message: "AI request was aborted" };
  }

  if (error instanceof Error) {
    return { code: "UNKNOWN_ERROR", message: error.message };
  }

  return { code: "UNKNOWN_ERROR", message: "Unknown AI error" };
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function getYandexErrorMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const message = (data as { message?: unknown }).message;
  return typeof message === "string" ? message : undefined;
}
