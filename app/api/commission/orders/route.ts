import {NextResponse} from "next/server";
import {ordersCollection} from "@/lib/db/collections";

export async function GET(): Promise<NextResponse> {
  try {
    const orders = await (await ordersCollection).find({}).sort({createdAt: -1}).toArray();
    const result = orders.map(o => ({
      _id: o._id.toString(),
      userId: o.userId,
      userName: o.userName,
      productId: o.productId,
      productName: o.productName,
      size: o.size || null,
      price: o.price,
      code: o.code,
      createdAt: o.createdAt.toISOString(),
    }));
    return NextResponse.json({orders: result});
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}
