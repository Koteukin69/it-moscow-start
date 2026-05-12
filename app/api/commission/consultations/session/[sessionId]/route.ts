import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
): Promise<NextResponse> {
  try {
    const commission = req.headers.get("x-commission");
    if (commission !== "true") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json({ error: "Неверный ID сессии" }, { status: 400 });
    }

    const result = await prisma.consultation.deleteMany({ where: { sessionId } });
    return NextResponse.json({ success: true, deleted: result.count });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
