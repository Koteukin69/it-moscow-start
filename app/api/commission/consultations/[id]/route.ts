import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;

    const body = await req.json();
    const action: string = body.action;

    if (action !== "like" && action !== "dislike") {
      return NextResponse.json({ error: "Неверное действие" }, { status: 400 });
    }

    if (action === "like") {
      await prisma.consultation.delete({ where: { id } });
      return NextResponse.json({ success: true, removed: true });
    }

    const updated = await prisma.consultation.update({
      where: { id },
      data: { flames: { decrement: 1 } },
    });

    if (updated.flames <= 0) {
      await prisma.consultation.delete({ where: { id } });
      return NextResponse.json({ success: true, removed: true });
    }

    return NextResponse.json({
      success: true,
      removed: false,
      consultation: {
        _id: updated.id,
        name: updated.name,
        phone: updated.phone,
        childName: updated.childName,
        specialty: updated.specialty,
        grade: updated.grade,
        flames: updated.flames,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
