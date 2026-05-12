import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const result = orders.map(o => ({
      _id: o.id,
      orderNumber: o.orderNumber ?? 0,
      pickupCode: o.pickupCode ?? "",
      productName: o.productName,
      variant: o.variant || null,
      quantity: o.quantity || 1,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
    }));

    return NextResponse.json({ orders: result });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
