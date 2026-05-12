import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(): Promise<NextResponse> {
  try {
    const consultations = await prisma.consultation.findMany({
      where: { flames: { gt: 0 } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      consultations: consultations.map(c => ({
        _id: c.id,
        name: c.name,
        phone: c.phone,
        childName: c.childName,
        specialty: c.specialty,
        grade: c.grade,
        flames: c.flames,
        sessionId: c.sessionId ?? null,
        createdAt: c.createdAt.toISOString(),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
