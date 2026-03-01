import {NextRequest, NextResponse} from "next/server";
import {usersCollection} from "@/lib/db/collections";
import {computeGameHash} from "@/lib/game/hash";
import {ObjectId} from "mongodb";
import {z} from "zod";

const coinsSchema = z.object({
  amount: z.number().int().min(1).max(500),
  seed: z.number().int(),
  args: z.string(),
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

    const {amount, seed, args} = validated.data;
    const users = await usersCollection;

    const user = await users.findOne({_id: objectId}, {projection: {gameSession: 1}});
    if (!user) {
      return NextResponse.json({error: "Пользователь не найден"}, {status: 404});
    }

    if (!user.gameSession || user.gameSession.seed !== seed) {
      return NextResponse.json({error: "Неверный seed"}, {status: 422});
    }

    if (args !== computeGameHash(amount, seed)) {
      return NextResponse.json({error: "Неверный args"}, {status: 422});
    }

    const result = await users.findOneAndUpdate(
      {_id: objectId},
      {$inc: {coins: amount}, $unset: {gameSession: ""}},
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
