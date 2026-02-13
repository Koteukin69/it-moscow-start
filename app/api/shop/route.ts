import {NextRequest, NextResponse} from "next/server";
import {productsCollection, usersCollection, ordersCollection} from "@/lib/db/collections";
import {ObjectId} from "mongodb";

export async function GET(): Promise<NextResponse> {
  try {
    const products = await (await productsCollection).find({}).toArray();
    const result = products.map(p => ({
      _id: p._id.toString(),
      name: p.name,
      price: p.price,
      description: p.description,
      image: p.image || null,
      stock: p.stock ?? null,
      sizes: p.sizes || null,
      isNew: p.isNew ?? false,
    }));
    return NextResponse.json({products: result});
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const userId = req.headers.get("x-user-id");
    const userName = req.headers.get("x-user-name");
    if (!userId || !userName) {
      return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const {productId, size} = await req.json();

    if (!productId || typeof productId !== "string") {
      return NextResponse.json({error: "Некорректный товар"}, {status: 422});
    }

    const [products, users, orders] = await Promise.all([
      productsCollection,
      usersCollection,
      ordersCollection,
    ]);

    const product = await products.findOne({_id: new ObjectId(productId)});
    if (!product) {
      return NextResponse.json({error: "Товар не найден"}, {status: 404});
    }

    if (product.sizes && Object.keys(product.sizes).length > 0) {
      if (!size || typeof size !== "string" || !(size in product.sizes)) {
        return NextResponse.json({error: "Выберите размер"}, {status: 422});
      }
      if (product.sizes[size] <= 0) {
        return NextResponse.json({error: "Нет в наличии"}, {status: 409});
      }
    } else if (product.stock !== undefined && product.stock !== null) {
      if (product.stock <= 0) {
        return NextResponse.json({error: "Нет в наличии"}, {status: 409});
      }
    }

    const coinResult = await users.findOneAndUpdate(
      {_id: new ObjectId(userId), coins: {$gte: product.price}},
      {$inc: {coins: -product.price}},
      {returnDocument: "after"}
    );

    if (!coinResult) {
      return NextResponse.json({error: "Недостаточно монеток"}, {status: 402});
    }

    if (product.sizes && size) {
      const stockResult = await products.findOneAndUpdate(
        {_id: new ObjectId(productId), [`sizes.${size}`]: {$gte: 1}},
        {$inc: {[`sizes.${size}`]: -1}},
        {returnDocument: "after"}
      );

      if (!stockResult) {
        await users.updateOne(
          {_id: new ObjectId(userId)},
          {$inc: {coins: product.price}}
        );
        return NextResponse.json({error: "Нет в наличии"}, {status: 409});
      }
    } else if (product.stock !== undefined && product.stock !== null) {
      const stockResult = await products.findOneAndUpdate(
        {_id: new ObjectId(productId), stock: {$gte: 1}},
        {$inc: {stock: -1}},
        {returnDocument: "after"}
      );

      if (!stockResult) {
        await users.updateOne(
          {_id: new ObjectId(userId)},
          {$inc: {coins: product.price}}
        );
        return NextResponse.json({error: "Нет в наличии"}, {status: 409});
      }
    }

    await orders.insertOne({
      userId,
      userName: decodeURIComponent(userName),
      productId: product._id.toString(),
      productName: product.name,
      size: size || undefined,
      price: product.price,
      status: "pending",
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      coins: coinResult.coins,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({error: "Внутренняя ошибка сервера"}, {status: 500});
  }
}
