import {NextRequest, NextResponse} from "next/server";
import {usersCollection} from "@/lib/db/collections";
import {createToken, AUTH_COOKIE_OPTIONS} from "@/lib/auth";
import type {JWTPayload} from "@/lib/types";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const {name} = await req.json();

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({error: "Имя не может быть пустым"}, {status: 422});
    }

    const collection = await usersCollection;
    const result = await collection.insertOne({
      name: name.trim(),
      coins: 0,
    });

    const token = await createToken({
      userId: result.insertedId.toString(),
      name: name.trim(),
      verified: false,
    } satisfies JWTPayload);

    const response = NextResponse.json({success: true});
    response.cookies.set("auth-token", token, AUTH_COOKIE_OPTIONS);
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({error: "Внутренняя ошибка сервера"}, {status: 500});
  }
}
