import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(): Promise<NextResponse> {
  try {
    const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });
    const result = orders.map(o => ({
      _id: o.id,
      orderNumber: o.orderNumber ?? 0,
      pickupCode: o.pickupCode ?? "",
      userId: o.userId,
      userName: o.userName,
      phone: o.phone ?? null,
      productId: o.productId,
      productName: o.productName,
      variant: o.variant || null,
      quantity: o.quantity || 1,
      price: o.price,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
    }));
    return NextResponse.json({ orders: result });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
