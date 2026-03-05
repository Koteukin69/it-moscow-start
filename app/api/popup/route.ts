import {NextRequest, NextResponse} from "next/server";
import {popupSettingsCollection} from "@/lib/db/collections";
import {verifyToken} from "@/lib/auth";

export const dynamic = "force-dynamic";

const SETTINGS_KEY = "main";

const DEFAULT_SETTINGS = {
  image: "/popup.png",
  title: "Задай вопрос",
  subtitle: "специалисту приёмной комиссии",
  description: "Запишитесь на бесплатную консультацию\nи узнайте все о поступлении",
  buttonUrl: "#consultation",
};

const NO_STORE = {"Cache-Control": "no-store"};

export async function GET(): Promise<NextResponse> {
  try {
    const collection = await popupSettingsCollection;
    const settings = await collection.findOne({key: SETTINGS_KEY});
    if (!settings) {
      return NextResponse.json(DEFAULT_SETTINGS, {headers: NO_STORE});
    }
    return NextResponse.json({
      image: settings.image,
      title: settings.title,
      subtitle: settings.subtitle,
      description: settings.description,
      buttonUrl: settings.buttonUrl ?? "#consultation",
    }, {headers: NO_STORE});
  } catch {
    return NextResponse.json(DEFAULT_SETTINGS, {headers: NO_STORE});
  }
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
  const token = req.cookies.get("commission-token")?.value;
  if (!token || await verifyToken(token) === null) {
    return NextResponse.json({error: "Unauthorized"}, {status: 401});
  }

  try {
    const {image, title, subtitle, description, buttonUrl} = await req.json();

    if (!title || !description || !image) {
      return NextResponse.json({error: "Заполните обязательные поля"}, {status: 400});
    }

    const collection = await popupSettingsCollection;
    await collection.updateOne(
      {key: SETTINGS_KEY},
      {
        $set: {
          key: SETTINGS_KEY,
          image: String(image),
          title: String(title),
          subtitle: String(subtitle ?? ""),
          description: String(description),
          buttonUrl: String(buttonUrl ?? "#consultation"),
        },
      },
      {upsert: true},
    );

    return NextResponse.json({success: true});
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}
