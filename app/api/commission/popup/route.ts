import {NextRequest, NextResponse} from "next/server";
import {popupSettingsCollection} from "@/lib/db/collections";

const SETTINGS_KEY = "main";

const DEFAULT_SETTINGS = {
  image: "/popup.png",
  title: "Задай вопрос",
  subtitle: "специалисту приёмной комиссии",
  description: "Запишитесь на бесплатную консультацию\nи узнайте все о поступлении",
};

export async function GET(): Promise<NextResponse> {
  try {
    const collection = await popupSettingsCollection;
    const settings = await collection.findOne({key: SETTINGS_KEY});
    if (!settings) {
      return NextResponse.json(DEFAULT_SETTINGS);
    }
    return NextResponse.json({
      image: settings.image,
      title: settings.title,
      subtitle: settings.subtitle,
      description: settings.description,
    });
  } catch {
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const {image, title, subtitle, description} = await req.json();

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
        },
      },
      {upsert: true},
    );

    return NextResponse.json({success: true});
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}
