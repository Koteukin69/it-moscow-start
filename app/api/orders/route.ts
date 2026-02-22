import {NextRequest, NextResponse} from "next/server";
import {ordersCollection} from "@/lib/db/collections";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const collection = await ordersCollection;
    const orders = await collection.find({userId}).sort({createdAt: -1}).toArray();

    const result = orders.map(o => ({
      _id: o._id.toString(),
      orderNumber: o.orderNumber ?? 0,
      pickupCode: o.pickupCode ?? "",
      productName: o.productName,
      variant: o.variant || null,
      quantity: o.quantity || 1,
      status: o.status,
      createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : o.createdAt,
    }));

    return NextResponse.json({orders: result});
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}
