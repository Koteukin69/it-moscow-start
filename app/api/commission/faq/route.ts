import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { defaultApplicantFaq } from "@/lib/faq";

export async function GET(): Promise<NextResponse> {
  try {
    let items = await prisma.faq.findMany({ orderBy: { id: "asc" } });
    if (items.length === 0) {
      await prisma.faq.createMany({
        data: defaultApplicantFaq.map(item => ({
          question: item.question.trim(),
          answer: item.answer.trim(),
        })),
      });
      items = await prisma.faq.findMany({ orderBy: { id: "asc" } });
    }
    const result = items.map(i => ({ _id: i.id, question: i.question, answer: i.answer }));
    return NextResponse.json({ faq: result });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { question, answer } = await req.json();
    const q = String(question).trim();
    const a = String(answer).trim();
    if (!q || !a) {
      return NextResponse.json({ error: "Заполните обязательные поля" }, { status: 400 });
    }
    const item = await prisma.faq.create({ data: { question: q, answer: a } });
    return NextResponse.json({ success: true, item: { _id: item.id, question: item.question, answer: item.answer } });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
