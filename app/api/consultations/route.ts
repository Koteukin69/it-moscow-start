import {NextRequest, NextResponse} from "next/server";
import {consultationsCollection} from "@/lib/db/collections";

const phoneRegex = /^(\+7|8|7)\d{10}$/;

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const name = body.name?.trim() ?? "";
    const phone = body.phone?.trim() ?? "";

    if (!name) {
      return NextResponse.json({error: "Введите ФИО"}, {status: 400});
    }
    if (!phone || !phoneRegex.test(phone.replace(/[\s\-()]/g, ""))) {
      return NextResponse.json({error: "Введите корректный номер телефона"}, {status: 400});
    }

    const collection = await consultationsCollection;
    await collection.insertOne({
      name,
      phone,
      flames: 3,
      createdAt: new Date(),
    });

    return NextResponse.json({success: true});
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}
