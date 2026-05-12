import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

const SETTINGS_KEY = "main";

const DEFAULT_SETTINGS = {
  image: "/popup.png",
  title: "Задай вопрос",
  subtitle: "специалисту приёмной комиссии",
  description: "Запишитесь на бесплатную консультацию\nи узнайте все о поступлении",
  buttonUrl: "#consultation",
  delaySeconds: 10,
  repeatDelaySeconds: 120,
};

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(): Promise<NextResponse> {
  try {
    const settings = await prisma.popupSettings.findUnique({ where: { key: SETTINGS_KEY } });
    if (!settings) {
      return NextResponse.json(DEFAULT_SETTINGS, { headers: NO_STORE });
    }
    return NextResponse.json({
      image: settings.image,
      title: settings.title,
      subtitle: settings.subtitle,
      description: settings.description,
      buttonUrl: settings.buttonUrl ?? "#consultation",
      delaySeconds: settings.delaySeconds ?? 10,
      repeatDelaySeconds: settings.repeatDelaySeconds ?? 120,
    }, { headers: NO_STORE });
  } catch {
    return NextResponse.json(DEFAULT_SETTINGS, { headers: NO_STORE });
  }
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
  const token = req.cookies.get("commission-token")?.value;
  if (!token || (await verifyToken(token)) === null) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { image, title, subtitle, description, buttonUrl, delaySeconds, repeatDelaySeconds } = await req.json();

    if (!title || !description || !image) {
      return NextResponse.json({ error: "Заполните обязательные поля" }, { status: 400 });
    }

    await prisma.popupSettings.upsert({
      where: { key: SETTINGS_KEY },
      create: {
        key: SETTINGS_KEY,
        image: String(image),
        title: String(title),
        subtitle: String(subtitle ?? ""),
        description: String(description),
        buttonUrl: String(buttonUrl ?? "#consultation"),
        delaySeconds: Number(delaySeconds) > 0 ? Number(delaySeconds) : 10,
        repeatDelaySeconds: Number(repeatDelaySeconds) > 0 ? Number(repeatDelaySeconds) : 120,
      },
      update: {
        image: String(image),
        title: String(title),
        subtitle: String(subtitle ?? ""),
        description: String(description),
        buttonUrl: String(buttonUrl ?? "#consultation"),
        delaySeconds: Number(delaySeconds) > 0 ? Number(delaySeconds) : 10,
        repeatDelaySeconds: Number(repeatDelaySeconds) > 0 ? Number(repeatDelaySeconds) : 120,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
