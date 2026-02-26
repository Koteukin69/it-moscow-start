import {NextRequest, NextResponse} from "next/server";
import {consultationsCollection} from "@/lib/db/collections";

const phoneRegex = /^(\+7|8|7)\d{10}$/;

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const name = body.name?.trim() ?? "";
    const phone = body.phone?.trim() ?? "";
    const childName = body.childName?.trim() ?? "";
    const specialty = body.specialty?.trim() ?? "";
    const grade = body.grade?.trim() ?? "";

    if (!name) {
      return NextResponse.json({error: "Введите ФИО"}, {status: 400});
    }
    if (!phone || !phoneRegex.test(phone.replace(/[\s\-()]/g, ""))) {
      return NextResponse.json({error: "Введите корректный номер телефона"}, {status: 400});
    }
    if (!childName) {
      return NextResponse.json({error: "Введите имя ребёнка"}, {status: 400});
    }
    if (!specialty) {
      return NextResponse.json({error: "Выберите специальность"}, {status: 400});
    }
    if (!grade) {
      return NextResponse.json({error: "Укажите класс"}, {status: 400});
    }

    const collection = await consultationsCollection;
    await collection.insertOne({
      name,
      phone,
      childName,
      specialty,
      grade,
      flames: 3,
      createdAt: new Date(),
    });

    return NextResponse.json({success: true});
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}
