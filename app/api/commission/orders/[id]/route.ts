import {NextRequest, NextResponse} from "next/server";
import {ordersCollection, usersCollection, productsCollection} from "@/lib/db/collections";
import {ObjectId} from "mongodb";

function mapOrder(o: Record<string, unknown>) {
  return {
    _id: (o._id as ObjectId).toString(),
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
    createdAt: o.createdAt instanceof Date ? (o.createdAt as Date).toISOString() : o.createdAt,
  };
}

async function restoreStock(productId: string, variant: string | undefined, quantity: number) {
  const products = await productsCollection;
  if (variant) {
    await products.updateOne(
      {_id: new ObjectId(productId)},
      {$inc: {[`variants.${variant}`]: quantity}},
    );
  } else {
    await products.updateOne(
      {_id: new ObjectId(productId), stock: {$exists: true}},
      {$inc: {stock: quantity}},
    );
  }
}

async function reduceStock(productId: string, variant: string | undefined, quantity: number): Promise<boolean> {
  const products = await productsCollection;
  if (variant) {
    const result = await products.findOneAndUpdate(
      {_id: new ObjectId(productId), [`variants.${variant}`]: {$gte: quantity}},
      {$inc: {[`variants.${variant}`]: -quantity}},
      {returnDocument: "after"},
    );
    return !!result;
  } else {
    const product = await products.findOne({_id: new ObjectId(productId)});
    if (!product || product.stock === undefined || product.stock === null) return true;
    const result = await products.findOneAndUpdate(
      {_id: new ObjectId(productId), stock: {$gte: quantity}},
      {$inc: {stock: -quantity}},
      {returnDocument: "after"},
    );
    return !!result;
  }
}

export async function PATCH(req: NextRequest, {params}: {params: Promise<{id: string}>}): Promise<NextResponse> {
  try {
    const {id} = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({error: "Неверный ID"}, {status: 400});
    }

    const body = await req.json();
    const collection = await ordersCollection;

    if (!body.status || !["pending", "completed", "cancelled"].includes(body.status)) {
      return NextResponse.json({error: "Неверный статус"}, {status: 400});
    }

    if (body.status === "completed") {
      const order = await collection.findOneAndUpdate(
        {_id: new ObjectId(id), status: "pending"},
        {$set: {status: "completed"}},
        {returnDocument: "before"},
      );
      if (!order) {
        return NextResponse.json({error: "Заказ не найден или не в статусе ожидания"}, {status: 422});
      }
      if (!body.pickupCode || body.pickupCode !== order.pickupCode) {
        await collection.updateOne({_id: new ObjectId(id)}, {$set: {status: "pending"}});
        return NextResponse.json({error: "Неверный код выдачи"}, {status: 403});
      }
    }

    if (body.status === "cancelled") {
      const order = await collection.findOneAndUpdate(
        {_id: new ObjectId(id), status: "pending"},
        {$set: {status: "cancelled"}},
        {returnDocument: "before"},
      );
      if (!order) {
        return NextResponse.json({error: "Заказ не найден или не в статусе ожидания"}, {status: 422});
      }
      const users = await usersCollection;
      await users.updateOne(
        {_id: new ObjectId(order.userId)},
        {$inc: {coins: order.price}},
      );
      await restoreStock(order.productId, order.variant, order.quantity || 1);
    }

    if (body.status === "pending") {
      const order = await collection.findOne({_id: new ObjectId(id)});
      if (!order) {
        return NextResponse.json({error: "Заказ не найден"}, {status: 404});
      }
      if (order.status !== "cancelled") {
        return NextResponse.json({error: "Только отменённый заказ можно восстановить"}, {status: 422});
      }

      const stockOk = await reduceStock(order.productId, order.variant, order.quantity || 1);
      if (!stockOk) {
        return NextResponse.json({error: "Товара нет в наличии"}, {status: 409});
      }

      const users = await usersCollection;
      const debit = await users.findOneAndUpdate(
        {_id: new ObjectId(order.userId), coins: {$gte: order.price}},
        {$inc: {coins: -order.price}},
        {returnDocument: "after"},
      );
      if (!debit) {
        await restoreStock(order.productId, order.variant, order.quantity || 1);
        return NextResponse.json({error: "У пользователя недостаточно монет"}, {status: 402});
      }

      await collection.updateOne({_id: new ObjectId(id)}, {$set: {status: "pending"}});
    }

    const updated = await collection.findOne({_id: new ObjectId(id)});
    return NextResponse.json({
      success: true,
      order: updated ? mapOrder(updated as unknown as Record<string, unknown>) : null,
    });
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}

export async function DELETE(_req: NextRequest, {params}: {params: Promise<{id: string}>}): Promise<NextResponse> {
  try {
    const {id} = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({error: "Неверный ID"}, {status: 400});
    }

    const collection = await ordersCollection;
    const order = await collection.findOne({_id: new ObjectId(id)});

    if (!order) {
      return NextResponse.json({error: "Заказ не найден"}, {status: 404});
    }

    if (order.status === "pending") {
      return NextResponse.json({error: "Нельзя удалить ожидающий заказ. Сначала отмените его."}, {status: 422});
    }

    await collection.deleteOne({_id: new ObjectId(id)});
    return NextResponse.json({success: true});
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}
