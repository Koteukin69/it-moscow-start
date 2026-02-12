import {NextRequest, NextResponse} from "next/server";
import {phoneRegex} from "@/lib/validator";
import {usersCollection} from "@/lib/db/collections";
import {verifyToken, createToken} from "@/lib/auth";
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
    } else if (field === "phone") {
      if (typeof value !== "string") {
        return NextResponse.json({error: "Некорректный формат"}, {status: 422});
      }
      if (value !== "" && !phoneRegex.test(value.replace(/[\s\-()]+/g, ""))) {
        return NextResponse.json({error: "Введите корректный номер телефона"}, {status: 422});
      }
    } else {
      return NextResponse.json({error: "Неизвестное поле"}, {status: 422});
    }

    const collection = await usersCollection;
    const updateValue = field === "name" ? value.trim() : (value === "" ? undefined : value.replace(/[\s\-()]+/g, ""));

    await collection.updateOne(
      {_id: new ObjectId(payload.userId)},
      field === "phone" && updateValue === undefined
        ? {$unset: {phone: ""}}
        : {$set: {[field]: updateValue}}
    );

    const newPayload: JWTPayload = {
      ...payload,
      [field]: field === "phone" ? updateValue : updateValue,
    };

    const newToken = await createToken(newPayload);

    const response = NextResponse.json({success: true, value: updateValue});

    response.cookies.set("auth-token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({error: "Внутренняя ошибка сервера"}, {status: 500});
  }
}
