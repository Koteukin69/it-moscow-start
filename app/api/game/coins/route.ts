import {NextRequest, NextResponse} from "next/server";
import {usersCollection} from "@/lib/db/collections";
import {ObjectId} from "mongodb";
import {z} from "zod";

const coinsSchema = z.object({
  amount: z.number().int().min(1).max(500),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
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

    const validated = coinsSchema.safeParse(await req.json());
    if (!validated.success) {
      return NextResponse.json(
        {error: `Ошибка валидации. ${validated.error.issues.map((i) => i.message).join(" ")}`},
        {status: 422},
      );
    }

    const {amount} = validated.data;
    const users = await usersCollection;

    const result = await users.findOneAndUpdate(
      {_id: objectId},
      {$inc: {coins: amount}},
      {returnDocument: "after"},
    );

    if (!result) {
      return NextResponse.json({error: "Пользователь не найден"}, {status: 404});
    }

    return NextResponse.json({success: true, coins: result.coins});
  } catch (error) {
    console.error(error);
    return NextResponse.json({error: "Внутренняя ошибка сервера"}, {status: 500});
  }
}
