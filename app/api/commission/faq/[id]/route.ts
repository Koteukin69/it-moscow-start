import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id } = await params;
    const { question, answer } = await req.json();
    const q = String(question).trim();
    const a = String(answer).trim();
    if (!q || !a) {
      return NextResponse.json({ error: "Заполните обязательные поля" }, { status: 400 });
    }

    const result = await prisma.faq.update({ where: { id }, data: { question: q, answer: a } });
    return NextResponse.json({ success: true, item: { _id: result.id, question: result.question, answer: result.answer } });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id } = await params;

    const item = await prisma.faq.findUnique({ where: { id }, select: { id: true } });
    if (!item) {
      return NextResponse.json({ error: "Вопрос не найден" }, { status: 404 });
    }

    await prisma.faq.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
