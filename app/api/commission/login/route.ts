import {NextRequest, NextResponse} from "next/server";
import {createToken} from "@/lib/auth";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const {login, password} = await req.json();

    if (
      !login || !password ||
      login !== process.env.ADMIN_LOGIN ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return NextResponse.json({error: "Неверный логин или пароль"}, {status: 401});
    }

    const token = await createToken({commission: true});

    const response = NextResponse.json({success: true});
    response.cookies.set("commission-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch {
    return NextResponse.json({error: "Внутренняя ошибка сервера"}, {status: 500});
  }
}
