import {NextResponse} from "next/server";
import {randomCSharpInt} from "@/lib/utils"

export async function GET(): Promise<NextResponse> {
  try {
    const seed = randomCSharpInt();
    return NextResponse.json(
      {success: true, seed: seed},
      {status: 200},
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {success: false, error: 'Внутренняя ошибка сервера'},
      {status: 500},
    );
  }
}
