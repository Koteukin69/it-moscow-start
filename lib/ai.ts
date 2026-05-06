type Result =
  | { ok: true; data: AIAnswer }
  | { ok: false; error: AIError };

type AskParams = {
  prompt: string;
  system?: string;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
};

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
  requestId?: string;
};

export type AIAnswer = {
  text: string;
  model: string;
  finishReason: string | null;
  usage: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
};

type ThreadResponse = {
  id: string;
};

type RunResponse = {
  id: string;
  state?: {
    status?: string;
    completed_message?: {
      status?: string;
      content?: {
        content?: {
          text?: {
            content?: string;
          };
        }[];
      };
    };
  };
};

class YandexRequestError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

const apiKey = process.env.YANDEX_API_KEY ?? process.env.AI_API_KEY;
const assistantId = process.env.YANDEX_AGENT_ID;
const folderId = process.env.YANDEX_FOLDER_ID ?? process.env.AI_FOLDER_ID;
const baseURL = process.env.YANDEX_ASSISTANT_BASE_URL ?? "https://rest-assistant.api.cloud.yandex.net/assistants/v1";

const configError =
  !apiKey ? "YANDEX_API_KEY or AI_API_KEY env is required" :
    !assistantId ? "YANDEX_AGENT_ID env is required" :
      !folderId ? "YANDEX_FOLDER_ID or AI_FOLDER_ID env is required" : null;

export async function askAI(params: AskParams): Promise<Result> {
  if (configError || !apiKey || !assistantId || !folderId) {
    return {
      ok: false,
      error: {
        code: "CONFIG_ERROR",
        message: configError ?? "AI client is not configured",
      },
    };
  }

  try {
    const thread = await yandexFetch<ThreadResponse>("/threads", {
      method: "POST",
      body: {
        folderId,
      },
      signal: params.signal,
    });

    await yandexFetch(`/messages?threadId=${encodeURIComponent(thread.id)}`, {
      method: "POST",
      body: {
        threadId: thread.id,
        content: {
          content: [
            {
              text: {
                content: params.prompt,
              },
            },
          ],
        },
      },
      signal: params.signal,
    });

    const run = await yandexFetch<RunResponse>("/runs", {
      method: "POST",
      body: {
        assistantId,
        threadId: thread.id,
      },
      signal: params.signal,
    });

    const finishedRun = await waitForRun(run.id, params.signal);
    const messageStatus = finishedRun.state?.completed_message?.status;

    if (messageStatus === "FILTERED_CONTENT") {
      return {
        ok: false,
        error: {
          code: "CONTENT_FILTER",
          message: "Yandex Assistant stopped generation because of content filtering",
        },
      };
    }

    const text = getRunText(finishedRun);

    if (!text) {
      return {
        ok: false,
        error: {
          code: "EMPTY_RESPONSE",
          message: "Yandex Assistant returned empty response",
        },
      };
    }

    return {
      ok: true,
      data: {
        text,
        model: assistantId,
        finishReason: finishedRun.state?.status ?? null,
        usage: {},
      },
    };
  } catch (error) {
    console.error("[AI raw error]", error);

    return {
      ok: false,
      error: normalizeError(error),
    };
  }
}

async function waitForRun(runId: string, signal?: AbortSignal): Promise<RunResponse> {
  const startedAt = Date.now();
  const maxWaitMs = 60_000;

  while (Date.now() - startedAt < maxWaitMs) {
    const run = await yandexFetch<RunResponse>(`/runs/${encodeURIComponent(runId)}`, {
      signal,
    });

    const status = run.state?.status;

    if (status === "COMPLETED") return run;

    if (status === "FAILED" || status === "CANCELLED" || status === "EXPIRED") {
      throw new YandexRequestError(`Run finished with status: ${status}`);
    }

    await sleep(1000, signal);
  }

  return Promise.reject(new YandexRequestError("Yandex Assistant did not respond in 60 seconds"));
}

async function yandexFetch<T>(
  path: string,
  options: {
    method?: "GET" | "POST";
    body?: unknown;
    signal?: AbortSignal;
  } = {},
): Promise<T> {
  const res = await fetch(`${baseURL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Api-Key ${apiKey}`,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  const text = await res.text();
  const data = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    const message =
      getYandexErrorMessage(data) ??
      (text ? text : `Yandex request failed: ${res.status}`);

    throw new YandexRequestError(message, res.status);
  }

  return data as T;
}

function getRunText(run: RunResponse): string | undefined {
  return run.state?.completed_message?.content?.content
    ?.map((part) => part.text?.content)
    .filter(Boolean)
    .join("\n")
    .trim();
}

function normalizeError(error: unknown): AIError {
  if (error instanceof YandexRequestError) {
    if (error.status === 401) {
      return {
        code: "AUTH_ERROR",
        message: "Invalid Yandex API key",
        status: error.status,
      };
    }

    if (error.status === 403) {
      return {
        code: "PERMISSION_ERROR",
        message: "Yandex API key has no permission for this assistant or folder",
        status: error.status,
      };
    }

    if (error.status === 429) {
      return {
        code: "RATE_LIMIT",
        message: "Yandex rate limit exceeded",
        status: error.status,
      };
    }

    return {
      code: "YANDEX_ERROR",
      message: error.message,
      status: error.status,
    };
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return {
      code: "TIMEOUT",
      message: "AI request was aborted",
    };
  }

  if (error instanceof Error) {
    return {
      code: "UNKNOWN_ERROR",
      message: error.message,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "Unknown AI error",
  };
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

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const timeout = setTimeout(resolve, ms);

    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timeout);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}