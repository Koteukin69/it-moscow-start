import {NextRequest, NextResponse} from "next/server";
import {loginSchema} from "@/lib/validator";
import {usersCollection} from "@/lib/db/collections"
import {createToken} from "@/lib/auth";
import {JWTPayload, Role} from "@/lib/types";

export async function POST(req: NextRequest):Promise<NextResponse> {
  try {
    const validated = await loginSchema.safeParseAsync(req.json);
    if (!validated.success)
      return NextResponse.json(
        {error: `Ошибка валидации данных. ${validated.error.issues.map((i) => i.message).join(" ")}`},
        {status: 422}
      );

    const {name, phone} = validated.data;

    const collection = await usersCollection;
    const id = (await collection.insertOne({name, phone})).insertedId.toString();

    const token = await createToken({
      userId: id,
      name,
      phone,
      role: Role.applicant,
      verified: false
    } as JWTPayload);

    const response = NextResponse.json(
      {success: true, message: 'Logged in successfully'},
      {status: 200}
    );

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      domain: `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN?.split(":")[0]??"localhost"}`,
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {error: 'Внутренняя ошибка сервера'},
      {status: 500}
    )
  }
}
