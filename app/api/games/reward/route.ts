import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

const ALLOWED_GAMES = ["fly", "2048"] as const;
type GameId = (typeof ALLOWED_GAMES)[number];

function calcCoins(game: GameId, score: number): number {
  if (game === "fly") {
    if (score >= 50) return 30;
    if (score >= 30) return 20;
    if (score >= 20) return 10;
    if (score >= 10) return 5;
    if (score >= 5) return 2;
    return 0;
  }
  if (game === "2048") {
    if (score >= 8192) return 100;
    if (score >= 4096) return 50;
    if (score >= 2048) return 30;
    if (score >= 1024) return 15;
    if (score >= 512) return 7;
    if (score >= 256) return 3;
    if (score >= 128) return 1;
  }
  return 0;
}

export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch((): null => null);
  if (
    !body ||
    typeof body.game !== "string" ||
    typeof body.score !== "number" ||
    !Number.isFinite(body.score)
  ) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!(ALLOWED_GAMES as readonly string[]).includes(body.game)) {
    return NextResponse.json({ error: "Unknown game" }, { status: 400 });
  }

  const coins = calcCoins(body.game as GameId, body.score);
  if (coins > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: { coins: { increment: coins } },
    });
  }

  return NextResponse.json({ coins });
}
