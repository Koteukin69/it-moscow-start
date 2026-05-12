import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { computeGameHash } from "@/lib/game/hash";
import { z } from "zod";

const coinsSchema = z.object({
  amount: z.number().int().min(1).max(500),
  seed: z.number().int(),
  args: z.string(),
});

type GameSession = { seed: number; createdAt: string };

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const userId = req.nextUrl.searchParams.get("user");
    if (!userId) {
      return NextResponse.json({ error: "Не указан пользователь" }, { status: 422 });
    }

    const validated = coinsSchema.safeParse(await req.json());
    if (!validated.success) {
      return NextResponse.json(
        { error: `Ошибка валидации. ${validated.error.issues.map(i => i.message).join(" ")}` },
        { status: 422 },
      );
    }

    const { amount, seed, args } = validated.data;

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, gameSession: true } });
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    const gameSession = user.gameSession as GameSession | null;
    if (!gameSession || gameSession.seed !== seed) {
      return NextResponse.json({ error: "Неверный seed" }, { status: 422 });
    }

    if (args !== computeGameHash(amount, seed)) {
      return NextResponse.json({ error: "Неверный args" }, { status: 422 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { coins: { increment: amount }, gameSession: Prisma.DbNull },
      select: { coins: true },
    });

    return NextResponse.json({ success: true, coins: updated.coins });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
