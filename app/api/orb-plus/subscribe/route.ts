import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    {
      error: "Оплата подписки Orb Plus в разработке. Скоро подключим ЮKassa.",
      code: "PAYMENT_NOT_AVAILABLE",
    },
    { status: 503 },
  );
}
