import { readFileSync } from "fs";
import { join } from "path";

type Chunk = {
  text: string;
  keywords: Set<string>;
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\wа-яёa-z0-9\s]/gi, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3);
}

function loadChunks(): Chunk[] {
  try {
    const filePath = join(process.cwd(), "data", "knowledge-base.txt");
    const content = readFileSync(filePath, "utf-8");
    return content
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length >= 80)
      .map((p) => ({ text: p, keywords: new Set(tokenize(p)) }));
  } catch {
    return [];
  }
}

const chunks = loadChunks();

export function retrieveContext(query: string, topK = 4): string {
  if (chunks.length === 0) return "";

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return "";

  const scored = chunks.map((chunk) => ({
    text: chunk.text,
    score: queryTokens.filter((t) => chunk.keywords.has(t)).length,
  }));

  scored.sort((a, b) => b.score - a.score);

  const relevant = scored.slice(0, topK).filter((s) => s.score > 0);

  return relevant.map((s) => s.text).join("\n\n");
}
