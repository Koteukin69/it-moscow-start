import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

type OAuthProvider = { provider: string; phone?: string };

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id } = await params;

    const { name, coins } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Имя обязательно" }, { status: 400 });
    }

    const result = await prisma.user.update({
      where: { id },
      data: { name: String(name), coins: Number(coins) || 0 },
    });

    const providers = (result.oauthProviders as OAuthProvider[]) ?? [];
    const phones = providers.map(p => p.phone).filter((p): p is string => Boolean(p));

    return NextResponse.json({
      success: true,
      user: {
        _id: result.id,
        name: result.name,
        phones,
        providers: providers.map(p => p.provider),
        coins: result.coins ?? 0,
      },
    });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
