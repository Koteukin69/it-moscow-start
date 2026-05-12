import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(): Promise<NextResponse> {
  try {
    const events = await prisma.event.findMany({ orderBy: { date: "desc" } });
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

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { name, date, image, description, registrationUrl } = await req.json();

    if (!name || !date || !description || !image) {
      return NextResponse.json({ error: "Заполните обязательные поля" }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        name: String(name),
        date: String(date),
        image: String(image),
        description: String(description),
        registrationUrl: registrationUrl ? String(registrationUrl) : null,
      },
    });

    return NextResponse.json({
      success: true,
      event: { _id: event.id, name: event.name, date: event.date, image: event.image || null, description: event.description, registrationUrl: event.registrationUrl || null },
    });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
