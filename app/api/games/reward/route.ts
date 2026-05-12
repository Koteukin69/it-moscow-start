import { NextRequest, NextResponse } from "next/server";
import { usersCollection } from "@/lib/db/collections";
import { ObjectId } from "mongodb";

const ALLOWED_GAMES = ["fly", "2048"] as const;
type GameId = typeof ALLOWED_GAMES[number];

function calcCoins(game: GameId, score: number): number {
  if (game === "fly") return Math.min(Math.floor(score / 2), 30);
  if (game === "2048") {
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
    const users = await usersCollection;
    await users.updateOne({ _id: new ObjectId(userId) }, { $inc: { coins } });
  }

  return NextResponse.json({ coins });
}
