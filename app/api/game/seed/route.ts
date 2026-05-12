import { NextRequest, NextResponse } from "next/server";
import { randomCSharpInt } from "@/lib/utils";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const userId = req.nextUrl.searchParams.get("user");
    if (!userId) {
      return NextResponse.json({ error: "Не указан пользователь" }, { status: 422 });
    }

    const seed = randomCSharpInt();

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { gameSession: { seed, createdAt: new Date().toISOString() } },
    });

    return NextResponse.json({ success: true, seed });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
