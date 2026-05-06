import { NextRequest, NextResponse } from "next/server";
import { askAI, type AIError } from "@/lib/ai";

type Body = {
  prompt?: unknown;
};

type ResponseError = {
  message: string;
  code: number;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch((): Body | null => null);

  if (!body || typeof body.prompt !== "string" || !body.prompt.trim()) {
    return NextResponse.json(
      { error: "prompt is required" },
      { status: 400 },
    );
  }

  const result = await askAI({
    prompt: body.prompt,
    temperature: 0.3,
    maxTokens: 1000,
    signal: req.signal,
  });

  if (!result.ok) {
    console.error("[AI route error]", result.error);
    const responseError = getResponseError(result.error);
    return NextResponse.json(
      {
        error: responseError.message,
        code: result.error.code,
      },
      {
        status: responseError.code,
      },
    );
  }

  return NextResponse.json({
    text: result.data.text,
    model: result.data.model,
    finishReason: result.data.finishReason,
    usage: result.data.usage,
  });
}

const RESPONSE_ERRORS: Record<AIError["code"], ResponseError> = {
  CONFIG_ERROR: {
    code: 500,
    message: "AI is not configured",
  },
  AUTH_ERROR: {
    code: 401,
    message: "AI authorization failed",
  },
  PERMISSION_ERROR: {
    code: 403,
    message: "AI permission denied",
  },
  RATE_LIMIT: {
    code: 429,
    message: "AI rate limit exceeded",
  },
  TIMEOUT: {
    code: 504,
    message: "AI request timeout",
  },
  CONTENT_FILTER: {
    code: 422,
    message: "AI response was blocked by content filter",
  },
  EMPTY_RESPONSE: {
    code: 502,
    message: "AI returned empty response",
  },
  YANDEX_ERROR: {
    code: 502,
    message: "AI request failed",
  },
  UNKNOWN_ERROR: {
    code: 502,
    message: "AI request failed",
  },
};

function getResponseError(error: AIError): ResponseError {
  const fallback = RESPONSE_ERRORS[error.code];

  if (error.status && error.status >= 400 && error.status < 600) {
    return {
      code: error.status,
      message: fallback.message,
    };
  }

  return fallback;
}