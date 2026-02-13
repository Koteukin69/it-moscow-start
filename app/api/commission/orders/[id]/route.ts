import {NextRequest, NextResponse} from "next/server";
import {ordersCollection, usersCollection} from "@/lib/db/collections";
import {ObjectId} from "mongodb";

export async function DELETE(req: NextRequest, {params}: {params: Promise<{id: string}>}): Promise<NextResponse> {
  try {
    const {id} = await params;
    const {searchParams} = new URL(req.url);
    const action = searchParams.get("action");

    const collection = await ordersCollection;
    const order = await collection.findOne({_id: new ObjectId(id)});

    if (!order) {
      return NextResponse.json({error: "Заказ не найден"}, {status: 404});
    }

    if (action === "cancel") {
      const users = await usersCollection;
      await users.updateOne(
        {_id: new ObjectId(order.userId)},
        {$inc: {coins: order.price}}
      );
    }

    await collection.deleteOne({_id: new ObjectId(id)});

    return NextResponse.json({success: true});
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}
