import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { mergeWithDefaults } from "@/lib/merge-specialties";

export async function GET(): Promise<NextResponse> {
  try {
    const docs = await prisma.specialty.findMany();
    const specialties = mergeWithDefaults(docs as never);
    return NextResponse.json({ specialties });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
