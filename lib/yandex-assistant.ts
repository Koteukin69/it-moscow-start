export type YandexAssistantRole = "user" | "assistant";

export type YandexAssistantMessage = {
  role: YandexAssistantRole;
  text: string;
};

type YandexMessageData = {
  author: {
    id: string;
    role: YandexAssistantRole;
  };
  content: {
    content: Array<{
      text: {
        content: string;
      };
    }>;
  };
};

type ThreadCreateRequest = {
  folderId: string;
  messages: YandexMessageData[];
  name: string;
  defaultMessageAuthorId: string;
  expirationConfig: {
    expirationPolicy: "SINCE_LAST_ACTIVE";
    ttlDays: string;
  };
};

type RunCreateRequest = {
  assistantId: string;
  threadId: string;
  stream: false;
};

const ASSISTANT_API_BASE_URL = "https://rest-assistant.api.cloud.yandex.net/assistants/v1";
const USER_AUTHOR_ID = "abit-chat-user";
const THREAD_TTL_DAYS = "1";
const REQUEST_TIMEOUT_MS = 60000;

export class YandexAssistantError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "YandexAssistantError";
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new YandexAssistantError(`${name} is not configured`, 500);
  }

  return value;
}

function getStringField(value: unknown, field: string): string | null {
  if (!isRecord(value)) return null;

  const fieldValue = value[field];
  return typeof fieldValue === "string" ? fieldValue : null;
}

function getYandexErrorMessage(body: unknown): string {
  const message = getStringField(body, "message");
  if (message?.trim()) return message;

  const error = getStringField(body, "error");
  if (error?.trim()) return error;

  return "Yandex Assistant request failed";
}

async function readJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse Yandex Assistant response", error);
    throw new YandexAssistantError("Yandex Assistant returned invalid JSON", 502);
  }
}

async function requestYandexAssistant(path: string, init: RequestInit): Promise<unknown> {
  const apiKey = getRequiredEnv("YANDEX_AI_API_KEY");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${ASSISTANT_API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Api-Key ${apiKey}`,
      },
      signal: controller.signal,
    });
    const body = await readJsonResponse(response);

    if (!response.ok) {
      throw new YandexAssistantError(getYandexErrorMessage(body), response.status);
    }

    return body;
  } catch (error) {
    if (error instanceof YandexAssistantError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new YandexAssistantError("Yandex Assistant request timed out", 504);
    }

    console.error("Yandex Assistant request failed", error);
    throw new YandexAssistantError("Yandex Assistant request failed", 502);
  } finally {
    clearTimeout(timeout);
  }
}

function createMessageData(message: YandexAssistantMessage, assistantId: string): YandexMessageData {
  return {
    author: {
      id: message.role === "assistant" ? assistantId : USER_AUTHOR_ID,
      role: message.role,
    },
    content: {
      content: [
        {
          text: {
            content: message.text,
          },
        },
      ],
    },
  };
}

function getResponseId(body: unknown, fallbackName: string): string {
  const id = getStringField(body, "id");
  if (!id?.trim()) {
    throw new YandexAssistantError(`Yandex Assistant returned invalid ${fallbackName}`, 502);
  }

  return id;
}

function getRunState(body: unknown): Record<string, unknown> | null {
  if (!isRecord(body)) return null;

  const state = body.state;
  return isRecord(state) ? state : null;
}

function getRunStatus(body: unknown): string | null {
  return getStringField(getRunState(body), "status");
}

function getErrorMessage(error: unknown): string {
  const message = getStringField(error, "message");
  if (message?.trim()) return message;

  return "Yandex Assistant run failed";
}

function getMessageText(completedMessage: unknown): string | null {
  if (!isRecord(completedMessage)) return null;

  const messageContent = completedMessage.content;
  if (!isRecord(messageContent)) return null;

  const content = messageContent.content;
  if (!Array.isArray(content)) return null;

  const textParts: string[] = [];

  for (const part of content) {
    if (!isRecord(part)) continue;

    const text = part.text;
    const textContent = getStringField(text, "content");
    if (textContent?.trim()) {
      textParts.push(textContent.trim());
    }
  }

  const answer = textParts.join("\n").trim();
  return answer || null;
}

function getCompletedMessageText(body: unknown): string | null {
  if (isRecord(body)) {
    const topLevelAnswer = getMessageText(body.completedMessage);
    if (topLevelAnswer) return topLevelAnswer;
  }

  const state = getRunState(body);
  if (!state) return null;

  return getMessageText(state.completedMessage);
}

async function createThread(messages: YandexAssistantMessage[], folderId: string, assistantId: string): Promise<string> {
  const body: ThreadCreateRequest = {
    folderId,
    messages: messages.map((message) => createMessageData(message, assistantId)),
    name: "abit-chat",
    defaultMessageAuthorId: USER_AUTHOR_ID,
    expirationConfig: {
      expirationPolicy: "SINCE_LAST_ACTIVE",
      ttlDays: THREAD_TTL_DAYS,
    },
  };

  const responseBody = await requestYandexAssistant("/threads", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return getResponseId(responseBody, "thread id");
}

async function createRun(threadId: string, assistantId: string): Promise<unknown> {
  const body: RunCreateRequest = {
    assistantId,
    threadId,
    stream: false,
  };

  return requestYandexAssistant("/runs", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

async function listenForRunAnswer(initialRun: unknown): Promise<string> {
  const runId = getResponseId(initialRun, "run id");

  const body = await requestYandexAssistant(`/runs/listen?runId=${encodeURIComponent(runId)}`, {
    method: "GET",
  });
  const eventType = getStringField(body, "eventType");
  const status = getRunStatus(body);

  if (eventType === "ERROR" && isRecord(body)) {
    throw new YandexAssistantError(getErrorMessage(body.error), 502);
  }

  if (eventType === "TOOL_CALLS" || status === "TOOL_CALLS") {
    throw new YandexAssistantError("Yandex Assistant requested unsupported tool calls", 502);
  }

  if (status === "FAILED" && isRecord(body)) {
    const state = getRunState(body);
    throw new YandexAssistantError(getErrorMessage(state?.error), 502);
  }

  const answer = getCompletedMessageText(body);
  if (!answer) {
    throw new YandexAssistantError("Yandex Assistant returned an empty answer", 502);
  }

  return answer;
}

export async function requestYandexAssistantAnswer(messages: YandexAssistantMessage[]): Promise<string> {
  const folderId = getRequiredEnv("YANDEX_AI_FOLDER_ID");
  const assistantId = getRequiredEnv("YANDEX_AI_ASSISTANT_ID");
  const threadId = await createThread(messages, folderId, assistantId);
  const run = await createRun(threadId, assistantId);

  return listenForRunAnswer(run);
}
