import {NextRequest, NextResponse} from "next/server";
import {randomCSharpInt} from "@/lib/utils";
import {usersCollection} from "@/lib/db/collections";
import {ObjectId} from "mongodb";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const userId = req.nextUrl.searchParams.get("user");
    if (!userId) {
      return NextResponse.json({error: "Не указан пользователь"}, {status: 422});
    }

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(userId);
    } catch {
      return NextResponse.json({error: "Некорректный идентификатор пользователя"}, {status: 422});
    }

    const seed = randomCSharpInt();
    const users = await usersCollection;

    const result = await users.updateOne(
      {_id: objectId},
      {$set: {gameSession: {seed, createdAt: new Date()}}},
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({error: "Пользователь не найден"}, {status: 404});
    }

    return NextResponse.json(
      {success: true, seed: seed},
      {status: 200},
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {success: false, error: "Внутренняя ошибка сервера"},
      {status: 500},
    );
  }
}
