import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id } = await params;

    const { name, date, image, description, registrationUrl } = await req.json();
    if (!name || !date || !description || !image) {
      return NextResponse.json({ error: "Заполните обязательные поля" }, { status: 400 });
    }

    const result = await prisma.event.update({
      where: { id },
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
      event: { _id: result.id, name: result.name, date: result.date, image: result.image || null, description: result.description, registrationUrl: result.registrationUrl || null },
    });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id } = await params;

    const event = await prisma.event.findUnique({ where: { id }, select: { id: true } });
    if (!event) {
      return NextResponse.json({ error: "Мероприятие не найдено" }, { status: 404 });
    }

    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
