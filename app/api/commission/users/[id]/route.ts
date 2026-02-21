import {NextRequest, NextResponse} from "next/server";
import {ObjectId} from "mongodb";
import {usersCollection} from "@/lib/db/collections";

export async function PUT(req: NextRequest, {params}: {params: Promise<{id: string}>}): Promise<NextResponse> {
  try {
    const {id} = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({error: "Неверный ID"}, {status: 400});
    }

    const {name, phone, coins} = await req.json();
    if (!name) {
      return NextResponse.json({error: "Имя обязательно"}, {status: 400});
    }

    const update: Record<string, unknown> = {
      name: String(name),
      phone: phone ? String(phone) : undefined,
      coins: Number(coins) || 0,
    };

    const collection = await usersCollection;
    const result = await collection.findOneAndUpdate(
      {_id: new ObjectId(id)},
      {$set: update},
      {returnDocument: "after"},
    );

    if (!result) {
      return NextResponse.json({error: "Пользователь не найден"}, {status: 404});
    }

    return NextResponse.json({
      success: true,
      user: {_id: result._id.toString(), name: result.name, phone: result.phone || null, coins: result.coins ?? 0},
    });
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}
