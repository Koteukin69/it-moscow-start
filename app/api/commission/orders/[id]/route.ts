import {NextRequest, NextResponse} from "next/server";
import {ordersCollection, usersCollection} from "@/lib/db/collections";
import {ObjectId} from "mongodb";

export async function PATCH(req: NextRequest, {params}: {params: Promise<{id: string}>}): Promise<NextResponse> {
  try {
    const {id} = await params;
    const {status} = await req.json();

    if (!["pending", "completed", "cancelled"].includes(status)) {
      return NextResponse.json({error: "Некорректный статус"}, {status: 422});
    }

    const collection = await ordersCollection;
    const order = await collection.findOne({_id: new ObjectId(id)});

    if (!order) {
      return NextResponse.json({error: "Заказ не найден"}, {status: 404});
    }

    if (order.status === status) {
      return NextResponse.json({success: true});
    }

    if (status === "cancelled" && order.status === "pending") {
      const users = await usersCollection;
      await users.updateOne(
        {_id: new ObjectId(order.userId)},
        {$inc: {coins: order.price}}
      );
    }

    await collection.updateOne(
      {_id: new ObjectId(id)},
      {$set: {status}}
    );

    return NextResponse.json({success: true});
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}
