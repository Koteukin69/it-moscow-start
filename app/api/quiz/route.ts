import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const token = req.cookies.get("auth-token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { directions, top } = await req.json();
    if (!directions || !top) {
      return NextResponse.json({ error: "Missing directions or top" }, { status: 422 });
    }

    await prisma.quizResult.upsert({
      where: { userId: payload.userId },
      create: {
        userId: payload.userId,
        directions,
        top,
        completedAt: new Date(),
      },
      update: {
        directions,
        top,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const token = req.cookies.get("auth-token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await prisma.quizResult.findUnique({ where: { userId: payload.userId } });

    if (!result) return NextResponse.json({ result: null });

    return NextResponse.json({
      result: {
        directions: result.directions,
        top: result.top,
        completedAt: result.completedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
