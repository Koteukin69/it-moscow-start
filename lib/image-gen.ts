const ART_BASE_URL =
  "https://llm.api.cloud.yandex.net/foundationModels/v1/imageGenerationAsync";
const OPERATIONS_URL = "https://llm.api.cloud.yandex.net/operations";

const artModelUri = process.env.YANDEX_ART_MODEL_URI;
const apiKey = process.env.YANDEX_API_KEY ?? process.env.AI_API_KEY;

type OperationResponse = {
  done?: boolean;
  response?: { image?: string };
  error?: { message?: string };
};

export async function generateImage(prompt: string): Promise<string | null> {
  if (!apiKey || !artModelUri) return null;

  let operationId: string;
  try {
    const res = await fetch(ART_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Api-Key ${apiKey}`,
      },
      body: JSON.stringify({
        modelUri: artModelUri,
        generationOptions: { seed: Math.floor(Math.random() * 1_000_000) },
        messages: [{ weight: 1, text: prompt }],
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as { id?: string };
    if (!data.id) return null;
    operationId = data.id;
  } catch {
    return null;
  }

  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    await sleep(2_000);
    try {
      const poll = await fetch(`${OPERATIONS_URL}/${operationId}`, {
        headers: { Authorization: `Api-Key ${apiKey}` },
        signal: AbortSignal.timeout(8_000),
      });
      if (!poll.ok) continue;
      const op = (await poll.json()) as OperationResponse;
      if (op.error) return null;
      if (op.done && op.response?.image) return op.response.image;
    } catch {
      continue;
    }
  }

  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
