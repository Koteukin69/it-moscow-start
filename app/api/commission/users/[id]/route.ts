import {NextRequest, NextResponse} from "next/server";
import {ObjectId} from "mongodb";
import {usersCollection} from "@/lib/db/collections";

export async function PUT(req: NextRequest, {params}: {params: Promise<{id: string}>}): Promise<NextResponse> {
  try {
    const {id} = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({error: "Неверный ID"}, {status: 400});
    }

    const {name, coins} = await req.json();
    if (!name) {
      return NextResponse.json({error: "Имя обязательно"}, {status: 400});
    }

    const collection = await usersCollection;
    const result = await collection.findOneAndUpdate(
      {_id: new ObjectId(id)},
      {$set: {name: String(name), coins: Number(coins) || 0}},
      {returnDocument: "after"},
    );

    if (!result) {
      return NextResponse.json({error: "Пользователь не найден"}, {status: 404});
    }

    const phones = (result.oauthProviders ?? [])
      .map(p => p.phone)
      .filter((p): p is string => Boolean(p));

    return NextResponse.json({
      success: true,
      user: {
        _id: result._id.toString(),
        name: result.name,
        phones,
        providers: (result.oauthProviders ?? []).map(p => p.provider),
        coins: result.coins ?? 0,
      },
    });
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}
