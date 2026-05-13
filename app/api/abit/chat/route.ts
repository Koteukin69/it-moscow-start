import { NextRequest, NextResponse } from "next/server";
import { askAIStream, type AIError, type ModelType } from "@/lib/ai";
import { generateImage } from "@/lib/image-gen";
import { checkContent } from "@/lib/content-filter";
import { consumeOrbProQuota } from "@/lib/orb-plus";
import {
  MAX_UPLOAD_BYTES,
  extractFileText,
  generateFile,
  resolveUploadType,
  type GenerateRequest,
} from "@/lib/orb-files";

const ORB_PRO_TIER = "Orbs Pro";
const IMAGE_MODEL: ModelType = "ИТ.Дизайн";

const ORB_FILE_MARKER = /```orb-file\s*\n([\s\S]+?)\n```/;

const ORB_PRO_SYSTEM_HINT = `Ты работаешь в режиме повышенной мощности Orbs Pro.
Если пользователь просит создать документ Word, Excel или PDF, ответь сначала строго таким блоком (на отдельной строке):
\`\`\`orb-file
{
  "type": "docx" | "xlsx" | "pdf",
  "fileName": "имя.docx|.xlsx|.pdf",
  "docx": { "title": "...", "sections": [{ "heading": "...", "paragraphs": ["..."] }] },
  "xlsx": { "sheetName": "Лист 1", "headers": ["Колонка"], "rows": [["значение"]] },
  "pdf": { "title": "...", "paragraphs": ["..."] }
}
\`\`\`
Заполняй только тот ключ (docx/xlsx/pdf), который соответствует type. JSON должен быть валидным. После блока кратко поясни пользователю, что файл подготовлен.
Если пользователь не просит документ — не используй этот блок и отвечай обычным текстом.`;

type ResponseError = {
  message: string;
  code: number;
};

interface ParsedRequest {
  prompt: string;
  modelType: ModelType;
  maxTokens: number;
  orbsTier: string | null;
  uploadedFileContext: string | null;
}

async function parseRequest(req: NextRequest): Promise<ParsedRequest | NextResponse> {
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const promptRaw = form.get("prompt");
    const prompt = typeof promptRaw === "string" ? promptRaw.trim() : "";
    if (!prompt) return NextResponse.json({ error: "prompt is required" }, { status: 400 });

    const modelTypeRaw = form.get("modelType");
    const modelType = (typeof modelTypeRaw === "string" ? modelTypeRaw : "Приемная комиссия") as ModelType;
    const maxTokensRaw = form.get("maxTokens");
    const rawMaxTokens = maxTokensRaw ? parseInt(String(maxTokensRaw), 10) : 1000;
    const maxTokens = Math.min(Math.max(isNaN(rawMaxTokens) ? 1000 : rawMaxTokens, 100), 2000);
    const orbsTierRaw = form.get("orbsTier");
    const orbsTier = typeof orbsTierRaw === "string" ? orbsTierRaw : null;

    let uploadedFileContext: string | null = null;

    const file = form.get("file");
    if (file && file instanceof File && file.size > 0) {
      if (file.size > MAX_UPLOAD_BYTES) {
        return NextResponse.json({ error: `Файл больше ${MAX_UPLOAD_BYTES / 1024 / 1024} МБ` }, { status: 413 });
      }
      const fileType = resolveUploadType(file.name, file.type);
      if (!fileType) {
        return NextResponse.json({ error: "Поддерживаются только pdf, docx, xlsx, txt, csv" }, { status: 415 });
      }
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const extracted = await extractFileText(file.name, fileType, buffer);
        uploadedFileContext = `Содержимое файла «${extracted.fileName}»${extracted.truncated ? " (обрезано)" : ""}:\n${extracted.text}`;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Не удалось прочитать файл";
        return NextResponse.json({ error: message }, { status: 422 });
      }
    }

    return { prompt, modelType, maxTokens, orbsTier, uploadedFileContext };
  }

  const body = await req.json().catch(() => null) as {
    prompt?: unknown;
    modelType?: unknown;
    maxTokens?: unknown;
    orbsTier?: unknown;
  } | null;

  if (!body || typeof body.prompt !== "string" || !body.prompt.trim()) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  const modelType = (typeof body.modelType === "string" ? body.modelType : "Приемная комиссия") as ModelType;
  const rawMaxTokens = typeof body.maxTokens === "number" ? body.maxTokens : 1000;
  const maxTokens = Math.min(Math.max(rawMaxTokens, 100), 2000);
  const orbsTier = typeof body.orbsTier === "string" ? body.orbsTier : null;

  return {
    prompt: body.prompt.trim(),
    modelType,
    maxTokens,
    orbsTier,
    uploadedFileContext: null,
  };
}

export async function POST(req: NextRequest) {
  const parsed = await parseRequest(req);
  if (parsed instanceof NextResponse) return parsed;

  const { prompt, modelType, maxTokens, orbsTier, uploadedFileContext } = parsed;
  const encoder = new TextEncoder();
  const userId = req.headers.get("x-user-id");
  const isOrbPro = orbsTier === ORB_PRO_TIER;

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

  if (isOrbPro) {
    if (!userId) {
      return NextResponse.json(
        { error: "Тариф Orbs Pro доступен только авторизованным пользователям", code: "AUTH_REQUIRED" },
        { status: 401 },
      );
    }

    const result = await consumeOrbProQuota(userId);
    if (!result.ok) {
      return NextResponse.json(
        { error: "Лимит запросов Orbs Pro исчерпан", code: "ORB_PRO_LIMIT", status: result.status },
        { status: 429 },
      );
    }
  }

  if (modelType === IMAGE_MODEL) {
    return sseStream(async function* () {
      const imageBase64 = await generateImage(prompt);
      if (imageBase64) {
        yield encoder.encode(`data: ${JSON.stringify({ imageBase64 })}\n\n`);
      } else {
        yield encoder.encode(`data: ${JSON.stringify({ error: "Не удалось сгенерировать изображение. Попробуйте ещё раз." })}\n\n`);
      }
      yield encoder.encode("data: [DONE]\n\n");
    });
  }

  const blocked = checkContent(prompt);
  if (blocked) {
    return sseStream(async function* () {
      yield encoder.encode(`data: ${JSON.stringify({ text: blocked })}\n\n`);
      yield encoder.encode("data: [DONE]\n\n");
    });
  }

  let composedPrompt = prompt;
  if (uploadedFileContext) {
    composedPrompt = `${uploadedFileContext}\n\nВопрос пользователя: ${prompt}`;
  }

  const result = await askAIStream({
    prompt: composedPrompt,
    modelType,
    temperature: 0.3,
    maxTokens,
    signal: req.signal,
    systemPromptExtra: isOrbPro ? ORB_PRO_SYSTEM_HINT : undefined,
  });

  if (!result.ok) {
    console.error("[AI route error]", result.error);
    const responseError = getResponseError(result.error);
    return NextResponse.json({ error: responseError.message, code: result.error.code }, { status: responseError.code });
  }

  const { stream } = result;

  return sseStream(async function* () {
    let buffer = "";
    try {
      for await (const chunk of stream) {
        buffer += chunk;
        yield encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }

      if (isOrbPro && userId) {
        const match = ORB_FILE_MARKER.exec(buffer);
        if (match) {
          try {
            const spec = JSON.parse(match[1]) as GenerateRequest;
            if (spec.type && spec.fileName) {
              const meta = await generateFile(spec, userId);
              const cleanText = buffer.replace(ORB_FILE_MARKER, "").trim() || "Файл готов.";
              yield encoder.encode(`data: ${JSON.stringify({ file: meta, replaceText: cleanText })}\n\n`);
            }
          } catch (err) {
            console.error("[orb-file gen error]", err);
            yield encoder.encode(`data: ${JSON.stringify({ text: "\n\n_Не удалось собрать файл, попробуй переформулировать запрос._" })}\n\n`);
          }
        }
      }

      yield encoder.encode("data: [DONE]\n\n");
    } catch (error) {
      console.error("[AI stream error]", error);
      try {
        yield encoder.encode(`data: ${JSON.stringify({ error: "Ошибка генерации ответа" })}\n\n`);
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
