import {NextRequest, NextResponse} from "next/server";
import {cartsCollection, productsCollection, usersCollection, ordersCollection, countersCollection} from "@/lib/db/collections";
import {ObjectId} from "mongodb";

function generatePickupCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function getNextOrderNumber(): Promise<number> {
  const counters = await countersCollection;
  const result = await counters.findOneAndUpdate(
    {_id: "orderNumber"},
    {$inc: {seq: 1}},
    {upsert: true, returnDocument: "after"},
  );
  return result!.seq;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const userId = req.headers.get("x-user-id");
    const userName = req.headers.get("x-user-name");
    if (!userId || !userName) {
      return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const [carts, products, users, orders] = await Promise.all([
      cartsCollection, productsCollection, usersCollection, ordersCollection,
    ]);

    const cart = await carts.findOne({userId});
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({error: "Корзина пуста"}, {status: 422});
    }

    const productIds = cart.items.map(i => {
      try { return new ObjectId(i.productId); } catch { return null; }
    }).filter(Boolean) as ObjectId[];

    const productDocs = await products.find({_id: {$in: productIds}}).toArray();
    const productMap = new Map(productDocs.map(p => [p._id.toString(), p]));

    let totalPrice = 0;
    const validItems: Array<{
      productId: string;
      quantity: number;
      variant?: string;
      name: string;
      price: number;
    }> = [];

    for (const item of cart.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json({error: `Товар не найден: ${item.productId}`}, {status: 404});
      }

      if (product.variants && Object.keys(product.variants).length > 0) {
        if (!item.variant || !(item.variant in product.variants)) {
          return NextResponse.json({error: `Выберите вариант для «${product.name}»`}, {status: 422});
        }
        if (product.variants[item.variant] < item.quantity) {
          return NextResponse.json({
            error: `Недостаточно «${product.name}» (${item.variant}). Доступно: ${product.variants[item.variant]}`,
          }, {status: 409});
        }
      } else if (product.stock !== undefined && product.stock !== null) {
        if (product.stock < item.quantity) {
          return NextResponse.json({
            error: `Недостаточно «${product.name}». Доступно: ${product.stock}`,
          }, {status: 409});
        }
      }

      totalPrice += product.price * item.quantity;
      validItems.push({
        productId: item.productId,
        quantity: item.quantity,
        variant: item.variant,
        name: product.name,
        price: product.price,
      });
    }

    const user = await users.findOne({_id: new ObjectId(userId)});
    const currentCoins = user?.coins ?? 0;

    if (currentCoins < totalPrice) {
      return NextResponse.json({
        error: "Недостаточно монет",
        deficit: totalPrice - currentCoins,
        total: totalPrice,
        balance: currentCoins,
      }, {status: 402});
    }

    const coinResult = await users.findOneAndUpdate(
      {_id: new ObjectId(userId), coins: {$gte: totalPrice}},
      {$inc: {coins: -totalPrice}},
      {returnDocument: "after"},
    );

    if (!coinResult) {
      return NextResponse.json({error: "Недостаточно монет"}, {status: 402});
    }

    const stockRollbacks: Array<() => Promise<void>> = [];

    for (const item of validItems) {
      if (item.variant) {
        const stockResult = await products.findOneAndUpdate(
          {_id: new ObjectId(item.productId), [`variants.${item.variant}`]: {$gte: item.quantity}},
          {$inc: {[`variants.${item.variant}`]: -item.quantity}},
          {returnDocument: "after"},
        );

        if (!stockResult) {
          await users.updateOne({_id: new ObjectId(userId)}, {$inc: {coins: totalPrice}});
          for (const rollback of stockRollbacks) await rollback();
          return NextResponse.json({error: `«${item.name}» (${item.variant}) закончился`}, {status: 409});
        }

        stockRollbacks.push(async () => {
          await products.updateOne(
            {_id: new ObjectId(item.productId)},
            {$inc: {[`variants.${item.variant}`]: item.quantity}},
          );
        });
      } else {
        const existing = productMap.get(item.productId);
        if (existing && existing.stock !== undefined && existing.stock !== null) {
          const stockResult = await products.findOneAndUpdate(
            {_id: new ObjectId(item.productId), stock: {$gte: item.quantity}},
            {$inc: {stock: -item.quantity}},
            {returnDocument: "after"},
          );

          if (!stockResult) {
            await users.updateOne({_id: new ObjectId(userId)}, {$inc: {coins: totalPrice}});
            for (const rollback of stockRollbacks) await rollback();
            return NextResponse.json({error: `«${item.name}» закончился`}, {status: 409});
          }

          stockRollbacks.push(async () => {
            await products.updateOne(
              {_id: new ObjectId(item.productId)},
              {$inc: {stock: item.quantity}},
            );
          });
        }
      }
    }

    const phone = user?.oauthProviders?.find(p => p.phone)?.phone ?? null;
    const now = new Date();
    let decodedName: string;
    try { decodedName = decodeURIComponent(userName); } catch { decodedName = userName; }

    const orderDocs = [];
    for (const item of validItems) {
      const orderNumber = await getNextOrderNumber();
      orderDocs.push({
        orderNumber,
        pickupCode: generatePickupCode(),
        userId,
        userName: decodedName,
        phone,
        productId: item.productId,
        productName: item.name,
        variant: item.variant || undefined,
        quantity: item.quantity,
        price: item.price * item.quantity,
        status: "pending" as const,
        createdAt: now,
      });
    }

    try {
      await orders.insertMany(orderDocs);
      await carts.updateOne({userId}, {$set: {items: [], updatedAt: new Date()}});
    } catch (insertError) {
      await users.updateOne({_id: new ObjectId(userId)}, {$inc: {coins: totalPrice}});
      for (const rollback of stockRollbacks) await rollback();
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      coins: coinResult.coins,
      ordersCount: orderDocs.length,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({error: "Внутренняя ошибка сервера"}, {status: 500});
  }
}
