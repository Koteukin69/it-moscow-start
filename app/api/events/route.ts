import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(): Promise<NextResponse> {
  try {
    const events = await prisma.event.findMany({ orderBy: { date: "asc" } });
    const result = events.map(e => ({
      _id: e.id,
      name: e.name,
      date: e.date,
      image: e.image || null,
      description: e.description,
      registrationUrl: e.registrationUrl || null,
    }));
    return NextResponse.json({ events: result });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
