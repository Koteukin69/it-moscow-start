import {NextRequest, NextResponse} from "next/server";
import {getCollection} from "@/lib/db/mongodb";
import {
  ABIT_EMPTY_MESSAGE_ERROR,
  ABIT_FALLBACK_MESSAGE,
  ABIT_MAX_MESSAGE_LENGTH,
  ABIT_RATE_LIMIT_PER_HOUR,
  ABIT_RATE_LIMIT_PER_MINUTE,
  ABIT_SYSTEM_PROMPT,
  ABIT_TOO_MANY_REQUESTS_MESSAGE,
  type AbitChatMessage,
  type AbitChatRequestBody,
} from "@/lib/abit-chat";

const RATE_LIMIT_WINDOW_MINUTE_MS = 60_000;
const RATE_LIMIT_WINDOW_HOUR_MS = 3_600_000;
const REQUEST_TIMEOUT_MS = 25_000;
const YANDEX_COMPLETION_ENDPOINT = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion";

interface ChatSessionDoc {
  token: string;
  messages: AbitChatMessage[];
  pendingText: string;
  updatedAt: Date;
}

interface ChatRateLimitDoc {
  token: string;
  minuteRequests: string[];
  hourRequests: string[];
  updatedAt: Date;
}

function isValidToken(token: string): boolean {
  return token.length >= 16 && token.length <= 128;
}

function cleanupWindow(items: string[], nowMs: number, windowMs: number): string[] {
  return items.filter((value) => nowMs - Number(value) < windowMs);
}

async function generateAssistantReply(history: AbitChatMessage[]): Promise<string> {
  const apiKey = process.env.YANDEX_LM_API_KEY?.trim();
  const modelUri = process.env.YANDEX_LM_MODEL_URI?.trim();
  const apiKeyId = process.env.YANDEX_LM_API_KEY_ID?.trim();

  if (!apiKey || !modelUri) {
    throw new Error("Yandex LM is not configured");
  }

  const messages = [
    {role: "system", text: ABIT_SYSTEM_PROMPT},
    ...history.map((item) => ({role: item.role, text: item.text})),
  ];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Api-Key ${apiKey}`,
    };

    if (apiKeyId) {
      requestHeaders["x-api-key-id"] = apiKeyId;
    }

    const response = await fetch(YANDEX_COMPLETION_ENDPOINT, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify({
        modelUri,
        completionOptions: {
          stream: false,
          temperature: 0.4,
          maxTokens: "1200",
        },
        messages,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Yandex LM request failed with ${response.status}`);
    }

    const payload = await response.json() as {
      result?: {
        alternatives?: Array<{message?: {text?: string}}>;
      };
    };

    const text = payload.result?.alternatives?.[0]?.message?.text?.trim();
    if (!text) {
      throw new Error("Yandex LM empty response");
    }

    return text;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function POST(request: NextRequest) {
  let body: AbitChatRequestBody;

  try {
    body = await request.json() as AbitChatRequestBody;
  } catch {
    return NextResponse.json({error: "Некорректный формат запроса."}, {status: 400});
  }

  const token = body.token?.trim();
  const text = body.text?.trim();
  const pendingText = body.pendingText?.slice(0, ABIT_MAX_MESSAGE_LENGTH) ?? "";

  if (!token || !isValidToken(token)) {
    return NextResponse.json({error: "Некорректный токен пользователя."}, {status: 400});
  }

  if (!text) {
    return NextResponse.json({error: ABIT_EMPTY_MESSAGE_ERROR}, {status: 400});
  }

  if (text.length > ABIT_MAX_MESSAGE_LENGTH) {
    return NextResponse.json({error: `Максимальная длина сообщения: ${ABIT_MAX_MESSAGE_LENGTH} символа.`}, {status: 400});
  }

  const rates = await getCollection<ChatRateLimitDoc>("abitChatRateLimits");
  const nowMs = Date.now();
  const nowStr = String(nowMs);
  const rateDoc = await rates.findOne({token});

  const minuteRequests = cleanupWindow(rateDoc?.minuteRequests ?? [], nowMs, RATE_LIMIT_WINDOW_MINUTE_MS);
  const hourRequests = cleanupWindow(rateDoc?.hourRequests ?? [], nowMs, RATE_LIMIT_WINDOW_HOUR_MS);

  if (minuteRequests.length >= ABIT_RATE_LIMIT_PER_MINUTE || hourRequests.length >= ABIT_RATE_LIMIT_PER_HOUR) {
    await rates.updateOne(
      {token},
      {$set: {token, minuteRequests, hourRequests, updatedAt: new Date()}},
      {upsert: true},
    );

    return NextResponse.json({error: ABIT_TOO_MANY_REQUESTS_MESSAGE}, {status: 429});
  }

  minuteRequests.push(nowStr);
  hourRequests.push(nowStr);

  await rates.updateOne(
    {token},
    {$set: {token, minuteRequests, hourRequests, updatedAt: new Date()}},
    {upsert: true},
  );

  const sessions = await getCollection<ChatSessionDoc>("abitChatSessions");
  const session = await sessions.findOne({token});
  const history = session?.messages ?? [];

  const userMessage: AbitChatMessage = {role: "user", text, createdAt: new Date().toISOString()};
  const updatedHistory = [...history, userMessage];

  try {
    const assistantText = await generateAssistantReply(updatedHistory);
    const assistantMessage: AbitChatMessage = {role: "assistant", text: assistantText, createdAt: new Date().toISOString()};
    const nextMessages = [...updatedHistory, assistantMessage];

    await sessions.updateOne(
      {token},
      {$set: {token, messages: nextMessages, pendingText: "", updatedAt: new Date()}},
      {upsert: true},
    );

    return NextResponse.json({reply: assistantText});
  } catch {
    const assistantMessage: AbitChatMessage = {role: "assistant", text: ABIT_FALLBACK_MESSAGE, createdAt: new Date().toISOString()};
    const nextMessages = [...updatedHistory, assistantMessage];

    await sessions.updateOne(
      {token},
      {$set: {token, messages: nextMessages, pendingText, updatedAt: new Date()}},
      {upsert: true},
    );

    return NextResponse.json({reply: ABIT_FALLBACK_MESSAGE});
  }
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim() ?? "";
  if (!token || !isValidToken(token)) {
    return NextResponse.json({messages: [], pendingText: ""});
  }

  const sessions = await getCollection<ChatSessionDoc>("abitChatSessions");
  const session = await sessions.findOne({token});

  return NextResponse.json({messages: session?.messages ?? [], pendingText: session?.pendingText ?? ""});
}

export async function DELETE(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim() ?? "";
  if (!token || !isValidToken(token)) {
    return NextResponse.json({error: "Некорректный токен пользователя."}, {status: 400});
  }

  const sessions = await getCollection<ChatSessionDoc>("abitChatSessions");
  await sessions.deleteOne({token});

  return NextResponse.json({ok: true});
}
