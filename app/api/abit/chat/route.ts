import { NextRequest, NextResponse } from "next/server";
import { askAIStream, type AIError, type ModelType } from "@/lib/ai";
import { generateImage } from "@/lib/image-gen";
import { checkContent } from "@/lib/content-filter";

type Body = {
  prompt?: unknown;
  modelType?: unknown;
  maxTokens?: unknown;
};

type ResponseError = {
  message: string;
  code: number;
};

const IMAGE_MODEL: ModelType = "ИТ.Дизайн";

export async function POST(req: NextRequest) {
  const body = await req.json().catch((): Body | null => null);

  if (!body || typeof body.prompt !== "string" || !body.prompt.trim()) {
    return NextResponse.json(
      { error: "prompt is required" },
      { status: 400 },
    );
  }

  const modelType = (typeof body.modelType === "string" ? body.modelType : "Приемная комиссия") as ModelType;
  const rawMaxTokens = typeof body.maxTokens === "number" ? body.maxTokens : 1000;
  const maxTokens = Math.min(Math.max(rawMaxTokens, 100), 2000);
  const encoder = new TextEncoder();

  function sseStream(events: () => AsyncIterable<Uint8Array>): Response {
    return new Response(
      new ReadableStream({ async start(controller) {
        try { for await (const chunk of events()) controller.enqueue(chunk); }
        finally { controller.close(); }
      }}),
      { headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      }},
    );
  }

  if (modelType === IMAGE_MODEL) {
    return sseStream(async function* () {
      const imageBase64 = await generateImage(body.prompt as string);
      if (imageBase64) {
        yield encoder.encode(`data: ${JSON.stringify({ imageBase64 })}\n\n`);
      } else {
        yield encoder.encode(`data: ${JSON.stringify({ error: "Не удалось сгенерировать изображение. Попробуйте ещё раз." })}\n\n`);
      }
      yield encoder.encode("data: [DONE]\n\n");
    });
  }

  const blocked = checkContent(body.prompt);
  if (blocked) {
    return sseStream(async function* () {
      yield encoder.encode(`data: ${JSON.stringify({ text: blocked })}\n\n`);
      yield encoder.encode("data: [DONE]\n\n");
    });
  }

  const result = await askAIStream({
    prompt: body.prompt,
    modelType,
    temperature: 0.3,
    maxTokens,
    signal: req.signal,
  });

  if (!result.ok) {
    console.error("[AI route error]", result.error);
    const responseError = getResponseError(result.error);
    return NextResponse.json(
      { error: responseError.message, code: result.error.code },
      { status: responseError.code },
    );
  }

  const { stream } = result;

  return sseStream(async function* () {
    try {
      for await (const chunk of stream) {
        yield encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }
      yield encoder.encode("data: [DONE]\n\n");
    } catch (error) {
      console.error("[AI stream error]", error);
      try {
        yield encoder.encode(
          `data: ${JSON.stringify({ error: "Ошибка генерации ответа" })}\n\n`,
        );
      } catch (writeErr) { console.error("[SSE write error]", writeErr); }
    }
  });
}

const RESPONSE_ERRORS: Record<AIError["code"], ResponseError> = {
  CONFIG_ERROR: { code: 500, message: "AI is not configured" },
  AUTH_ERROR: { code: 401, message: "AI authorization failed" },
  PERMISSION_ERROR: { code: 403, message: "AI permission denied" },
  RATE_LIMIT: { code: 429, message: "AI rate limit exceeded" },
  TIMEOUT: { code: 504, message: "AI request timeout" },
  CONTENT_FILTER: { code: 422, message: "AI response was blocked by content filter" },
  EMPTY_RESPONSE: { code: 502, message: "AI returned empty response" },
  YANDEX_ERROR: { code: 502, message: "AI request failed" },
  UNKNOWN_ERROR: { code: 502, message: "AI request failed" },
};

function getResponseError(error: AIError): ResponseError {
  const fallback = RESPONSE_ERRORS[error.code];
  if (error.status && error.status >= 400 && error.status < 600) {
    return { code: error.status, message: fallback.message };
  }
  return fallback;
}
