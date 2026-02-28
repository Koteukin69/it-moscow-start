import {NextRequest, NextResponse} from "next/server";
import {verifyToken, createToken, AUTH_COOKIE_OPTIONS} from "@/lib/auth";
import {usersCollection} from "@/lib/db/collections";
import {ObjectId} from "mongodb";
import type {JWTPayload} from "@/lib/types";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const authToken = req.cookies.get("auth-token")?.value;
    const payload = authToken ? await verifyToken(authToken) : null;
    if (!payload) {
      return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const {provider} = await req.json();
    if (provider !== "vk" && provider !== "yandex") {
      return NextResponse.json({error: "Некорректный провайдер"}, {status: 422});
    }

    const collection = await usersCollection;
    const user = await collection.findOne({_id: new ObjectId(payload.userId)});
    if (!user) {
      return NextResponse.json({error: "Пользователь не найден"}, {status: 404});
    }

    const providers = user.oauthProviders ?? [];
    const hasProvider = providers.some((p) => p.provider === provider);
    if (!hasProvider) {
      return NextResponse.json({error: "Аккаунт не привязан"}, {status: 422});
    }

    await collection.updateOne(
      {_id: new ObjectId(payload.userId)},
      {$pull: {oauthProviders: {provider}}},
    );

    const remaining = providers.filter((p) => p.provider !== provider);
    const newToken = await createToken({
      userId: payload.userId,
      name: payload.name,
      hasPhone: remaining.some((p) => !!p.phone),
    } satisfies JWTPayload);

    const response = NextResponse.json({success: true});
    response.cookies.set("auth-token", newToken, AUTH_COOKIE_OPTIONS);
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({error: "Внутренняя ошибка сервера"}, {status: 500});
  }
}
