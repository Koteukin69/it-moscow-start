import {NextRequest, NextResponse} from "next/server";
import {
  PARENT_TOKEN_COOKIE,
  PARENT_TOKEN_COOKIE_OPTIONS,
  createParentToken,
  verifyParentToken,
} from "@/lib/parent-token";
import {parentTokenAttemptsCollection} from "@/lib/db/collections";

const HOUR_LIMIT = 2;
const DAY_LIMIT = 3;
const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

let ttlIndexEnsured = false;

async function ensureTtlIndex(): Promise<void> {
  if (ttlIndexEnsured) return;
  const col = await parentTokenAttemptsCollection;
  await col.createIndex({createdAt: 1}, {expireAfterSeconds: 60 * 60 * 24});
  ttlIndexEnsured = true;
}

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const existingToken = req.cookies.get(PARENT_TOKEN_COOKIE)?.value;

    if (existingToken) {
      const payload = await verifyParentToken(existingToken);
      if (payload) {
        return NextResponse.json({valid: true, token: existingToken});
      }
    }

    const ip = getIp(req);
    const now = new Date();
    const col = await parentTokenAttemptsCollection;

    await ensureTtlIndex();

    const hourAgo = new Date(now.getTime() - ONE_HOUR_MS);
    const dayAgo = new Date(now.getTime() - ONE_DAY_MS);

    const [hourCount, dayCount] = await Promise.all([
      col.countDocuments({ip, createdAt: {$gte: hourAgo}}),
      col.countDocuments({ip, createdAt: {$gte: dayAgo}}),
    ]);

    if (hourCount >= HOUR_LIMIT || dayCount >= DAY_LIMIT) {
      return NextResponse.json({error: "Too many requests"}, {status: 429});
    }

    const sessionId = crypto.randomUUID();
    const token = await createParentToken(sessionId);

    await col.insertOne({ip, createdAt: now});

    const res = NextResponse.json({valid: true, token});
    res.cookies.set(PARENT_TOKEN_COOKIE, token, PARENT_TOKEN_COOKIE_OPTIONS);
    return res;
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}
