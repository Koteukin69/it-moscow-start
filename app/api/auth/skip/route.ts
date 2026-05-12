import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createToken, AUTH_COOKIE_OPTIONS } from "@/lib/auth";
import type { JWTPayload } from "@/lib/types";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { name } = await req.json();

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Имя не может быть пустым" }, { status: 422 });
    }

    const user = await prisma.user.create({
      data: { name: name.trim(), coins: 0 },
    });

    const token = await createToken({
      userId: user.id,
      name: user.name,
      hasPhone: false,
    } satisfies JWTPayload);

    const response = NextResponse.json({ success: true });
    response.cookies.set("auth-token", token, AUTH_COOKIE_OPTIONS);
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
