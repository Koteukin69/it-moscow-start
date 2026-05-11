const SEED_URLS: Record<string, string[]> = {
  "itmoscow.mskobr.ru": [
    "https://itmoscow.mskobr.ru",
    "https://itmoscow.mskobr.ru/postuplenie-v-kolledzh/priemnaya-komissiya",
  ],
  "itmoscow.pro": ["https://itmoscow.pro"],
};

const MAX_PAGES_PER_DOMAIN = 12;
const MAX_CHARS_PER_PAGE = 3000;
const CACHE_TTL_MS = 30 * 60 * 1000;
const TOP_PAGES_FOR_QUERY = 3;
const FETCH_TIMEOUT_MS = 6000;

type PageEntry = { url: string; content: string; keywords: Set<string> };
type DomainCache = { pages: PageEntry[]; fetchedAt: number };

const cache = new Map<string, DomainCache>();

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\wа-яёa-z0-9\s]/gi, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3);
}

function extractText(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, " ")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function extractLinks(html: string, baseUrl: string): string[] {
  const base = new URL(baseUrl);
  const seen = new Set<string>();
  const links: string[] = [];
  const re = /href=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;

  while ((match = re.exec(html)) !== null) {
    try {
      const url = new URL(match[1], base);
      if (url.hostname !== base.hostname) continue;
      url.hash = "";
      const href = url.toString();
      if (!seen.has(href)) {
        seen.add(href);
        links.push(href);
      }
    } catch {
      // malformed href
    }
  }

  return links;
}

async function fetchPage(url: string): Promise<{ html: string } | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ITMoscow-Assistant/1.0)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return { html: await res.text() };
  } catch {
    return null;
  }
}

async function crawlDomain(hostname: string, seeds: string[]): Promise<void> {
  const queue = [...seeds];
  const visited = new Set<string>(seeds);
  const pages: PageEntry[] = [];

  while (queue.length > 0 && pages.length < MAX_PAGES_PER_DOMAIN) {
    const url = queue.shift()!;
    const result = await fetchPage(url);
    if (!result) continue;

    const text = extractText(result.html).slice(0, MAX_CHARS_PER_PAGE);
    if (text.length >= 80) {
      pages.push({ url, content: text, keywords: new Set(tokenize(text)) });
    }

    for (const link of extractLinks(result.html, url)) {
      if (!visited.has(link) && pages.length + queue.length < MAX_PAGES_PER_DOMAIN) {
        visited.add(link);
        queue.push(link);
      }
    }
  }

  cache.set(hostname, { pages, fetchedAt: Date.now() });
}

export async function getWebContext(query: string): Promise<string> {
  const queryTokens = new Set(tokenize(query));
  const now = Date.now();

  await Promise.all(
    Object.entries(SEED_URLS)
      .filter(([hostname]) => {
        const entry = cache.get(hostname);
        return !entry || now - entry.fetchedAt >= CACHE_TTL_MS;
      })
      .map(([hostname, seeds]) => crawlDomain(hostname, seeds)),
  );

  const allPages: (PageEntry & { score: number })[] = [];

  for (const [, domainCache] of cache) {
    for (const page of domainCache.pages) {
      const score = queryTokens.size > 0
        ? [...queryTokens].filter((t) => page.keywords.has(t)).length
        : 0;
      allPages.push({ ...page, score });
    }
  }

  allPages.sort((a, b) => b.score - a.score);

  const top = allPages.slice(0, TOP_PAGES_FOR_QUERY);
  return top.map((p) => `Сайт ${p.url}:\n${p.content}`).join("\n\n---\n\n");
}

Object.entries(SEED_URLS).forEach(([hostname, seeds]) =>
  crawlDomain(hostname, seeds).catch(() => {}),
);
