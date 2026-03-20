import {NextRequest, NextResponse} from "next/server";
import {consultationsCollection} from "@/lib/db/collections";
import {verifyParentToken} from "@/lib/parent-token";

const phoneRegex = /^(\+7|8|7)\d{10}$/;

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const name = body.name?.trim() ?? "";
    const phone = body.phone?.trim() ?? "";
    const childName = body.childName?.trim() ?? "";
    const specialty = body.specialty?.trim() ?? "";
    const grade = body.grade?.trim() ?? "";
    const sessionToken: string = body.sessionToken ?? "";

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

    const tokenPayload = sessionToken ? await verifyParentToken(sessionToken) : null;
    if (!tokenPayload) {
      return NextResponse.json({error: "Недействительная сессия"}, {status: 401});
    }

    const collection = await consultationsCollection;
    await collection.insertOne({
      name,
      phone,
      childName,
      specialty,
      grade,
      flames: 3,
      sessionId: tokenPayload.sessionId,
      createdAt: new Date(),
    });

    return NextResponse.json({success: true});
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}
