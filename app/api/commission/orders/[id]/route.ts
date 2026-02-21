import {NextRequest, NextResponse} from "next/server";
import {ordersCollection, usersCollection} from "@/lib/db/collections";
import {ObjectId} from "mongodb";

export async function PATCH(req: NextRequest, {params}: {params: Promise<{id: string}>}): Promise<NextResponse> {
  try {
    const {id} = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({error: "Неверный ID"}, {status: 400});
    }

    const body = await req.json();
    const collection = await ordersCollection;
    const order = await collection.findOne({_id: new ObjectId(id)});

    if (!order) {
      return NextResponse.json({error: "Заказ не найден"}, {status: 404});
    }

    const update: Record<string, unknown> = {};

    if (body.status && ["pending", "completed", "cancelled"].includes(body.status)) {
      if (order.status !== body.status) {
        if (body.status === "cancelled" && order.status === "pending") {
          const users = await usersCollection;
          await users.updateOne(
            {_id: new ObjectId(order.userId)},
            {$inc: {coins: order.price}},
          );
        }
        update.status = body.status;
      }
    }

    if (body.size !== undefined) {
      update.size = body.size || undefined;
    }

    if (Object.keys(update).length > 0) {
      await collection.updateOne({_id: new ObjectId(id)}, {$set: update});
    }

    const updated = await collection.findOne({_id: new ObjectId(id)});
    return NextResponse.json({
      success: true,
      order: updated ? {
        _id: updated._id.toString(),
        userId: updated.userId,
        userName: updated.userName,
        productId: updated.productId,
        productName: updated.productName,
        size: updated.size || null,
        price: updated.price,
        status: updated.status,
        createdAt: updated.createdAt instanceof Date ? updated.createdAt.toISOString() : updated.createdAt,
      } : null,
    });
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}
