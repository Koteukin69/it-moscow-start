import { NextRequest, NextResponse } from "next/server";
import {
  PARENT_TOKEN_COOKIE,
  PARENT_TOKEN_COOKIE_OPTIONS,
  createParentToken,
  verifyParentToken,
} from "@/lib/parent-token";
import { prisma } from "@/lib/db/prisma";

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
        return NextResponse.json({ valid: true, token: existingToken });
      }
    }

    const ip = getIp(req);
    const sessionId = crypto.randomUUID();
    const token = await createParentToken(sessionId);

    await prisma.parentTokenAttempt.create({ data: { ip, token } });

    const res = NextResponse.json({ valid: true, token });
    res.cookies.set(PARENT_TOKEN_COOKIE, token, PARENT_TOKEN_COOKIE_OPTIONS);
    return res;
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
