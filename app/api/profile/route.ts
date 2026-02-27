import {NextRequest, NextResponse} from "next/server";
import {usersCollection} from "@/lib/db/collections";
import {verifyToken, createToken, AUTH_COOKIE_OPTIONS} from "@/lib/auth";
import {ObjectId} from "mongodb";
import type {JWTPayload} from "@/lib/types";

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    const token = req.cookies.get("auth-token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({error: "Unauthorized"}, {status: 401});

    const {field, value} = await req.json();

    if (field === "name") {
      if (!value || typeof value !== "string" || !value.trim()) {
        return NextResponse.json({error: "Имя не может быть пустым"}, {status: 422});
      }

      const collection = await usersCollection;
      const trimmed = value.trim();
      await collection.updateOne(
        {_id: new ObjectId(payload.userId)},
        {$set: {name: trimmed}}
      );

      const newPayload: JWTPayload = {...payload, name: trimmed};
      const newToken = await createToken(newPayload);

      const response = NextResponse.json({success: true, value: trimmed});
      response.cookies.set("auth-token", newToken, AUTH_COOKIE_OPTIONS);
      return response;
    }

    if (field === "avatar") {
      const allowed = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
      if (typeof value !== "string" || !allowed.includes(value)) {
        return NextResponse.json({error: "Некорректный аватар"}, {status: 422});
      }

      const collection = await usersCollection;
      await collection.updateOne(
        {_id: new ObjectId(payload.userId)},
        {$set: {avatar: value}}
      );

      return NextResponse.json({success: true, value});
    }

    return NextResponse.json({error: "Неизвестное поле"}, {status: 422});
  } catch (error) {
    console.error(error);
    return NextResponse.json({error: "Внутренняя ошибка сервера"}, {status: 500});
  }
}
