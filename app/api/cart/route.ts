import {NextRequest, NextResponse} from "next/server";
import {cartsCollection, productsCollection} from "@/lib/db/collections";
import {ObjectId} from "mongodb";

async function getEnrichedCart(userId: string) {
  const carts = await cartsCollection;
  const cart = await carts.findOne({userId});
  const items = cart?.items ?? [];

  if (items.length === 0) return {items: []};

  const products = await productsCollection;
  const productIds = items.map(i => {
    try { return new ObjectId(i.productId); } catch { return null; }
  }).filter(Boolean) as ObjectId[];

  const productDocs = await products.find({_id: {$in: productIds}}).toArray();
  const productMap = new Map(productDocs.map(p => [p._id.toString(), p]));

  const enriched = items
    .map((item, index) => {
      const product = productMap.get(item.productId);
      if (!product) return null;
      return {
        index,
        productId: item.productId,
        quantity: item.quantity,
        variant: item.variant || null,
        name: product.name,
        price: product.price,
        images: Array.isArray(product.images) ? product.images : [],
        variants: product.variants || null,
        variantLabel: product.variantLabel || null,
        stock: product.stock ?? null,
        isNew: product.isNew ?? false,
      };
    })
    .filter(Boolean);

  return {items: enriched};
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return NextResponse.json({error: "Unauthorized"}, {status: 401});

    const cart = await getEnrichedCart(userId);
    return NextResponse.json(cart);
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return NextResponse.json({error: "Unauthorized"}, {status: 401});

    const {productId, variant} = await req.json();
    if (!productId || typeof productId !== "string" || !ObjectId.isValid(productId)) {
      return NextResponse.json({error: "Некорректный товар"}, {status: 422});
    }

    const products = await productsCollection;
    const product = await products.findOne({_id: new ObjectId(productId)});
    if (!product) return NextResponse.json({error: "Товар не найден"}, {status: 404});

    const hasVariants = product.variants && Object.keys(product.variants).length > 0;
    let resolvedVariant = variant;

    if (hasVariants) {
      if (!resolvedVariant || !(resolvedVariant in product.variants!)) {
        resolvedVariant = Object.entries(product.variants!).find(([, count]) => count > 0)?.[0];
        if (!resolvedVariant) {
          return NextResponse.json({error: "Нет в наличии"}, {status: 409});
        }
      }
    }

    const carts = await cartsCollection;
    const cart = await carts.findOne({userId});
    const newItem = {productId, quantity: 1, variant: resolvedVariant || undefined};

    if (!cart) {
      await carts.insertOne({
        userId,
        items: [newItem],
        updatedAt: new Date(),
      });
    } else if (hasVariants) {
      await carts.updateOne(
        {userId},
        {
          $push: {items: newItem} as never,
          $set: {updatedAt: new Date()},
        }
      );
    } else {
      const existingIdx = cart.items.findIndex(i => i.productId === productId);
      if (existingIdx >= 0) {
        await carts.updateOne(
          {userId},
          {
            $inc: {[`items.${existingIdx}.quantity`]: 1},
            $set: {updatedAt: new Date()},
          }
        );
      } else {
        await carts.updateOne(
          {userId},
          {
            $push: {items: newItem} as never,
            $set: {updatedAt: new Date()},
          }
        );
      }
    }

    const enriched = await getEnrichedCart(userId);
    return NextResponse.json(enriched);
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return NextResponse.json({error: "Unauthorized"}, {status: 401});

    const {index, quantity, newVariant} = await req.json();
    if (typeof index !== "number" || index < 0) {
      return NextResponse.json({error: "Некорректный индекс"}, {status: 422});
    }

    const carts = await cartsCollection;
    const cart = await carts.findOne({userId});
    if (!cart || index >= cart.items.length) {
      return NextResponse.json({error: "Позиция не найдена"}, {status: 404});
    }

    if (typeof quantity === "number" && quantity <= 0) {
      const updatedItems = cart.items.filter((_, i) => i !== index);
      await carts.updateOne({userId}, {$set: {items: updatedItems, updatedAt: new Date()}});
    } else {
      const update: Record<string, unknown> = {updatedAt: new Date()};
      if (typeof quantity === "number") update[`items.${index}.quantity`] = quantity;
      if (newVariant !== undefined) update[`items.${index}.variant`] = newVariant || undefined;
      await carts.updateOne({userId}, {$set: update});
    }

    const enriched = await getEnrichedCart(userId);
    return NextResponse.json(enriched);
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return NextResponse.json({error: "Unauthorized"}, {status: 401});

    const body = await req.json();
    const carts = await cartsCollection;
    const cart = await carts.findOne({userId});
    if (!cart) return NextResponse.json({error: "Корзина не найдена"}, {status: 404});

    let updatedItems;
    if (typeof body.productId === "string") {
      updatedItems = cart.items.filter(i => i.productId !== body.productId);
    } else if (typeof body.index === "number" && body.index >= 0) {
      if (body.index >= cart.items.length) {
        return NextResponse.json({error: "Позиция не найдена"}, {status: 404});
      }
      updatedItems = cart.items.filter((_, i) => i !== body.index);
    } else {
      return NextResponse.json({error: "Укажите index или productId"}, {status: 422});
    }

    await carts.updateOne({userId}, {$set: {items: updatedItems, updatedAt: new Date()}});

    const enriched = await getEnrichedCart(userId);
    return NextResponse.json(enriched);
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}
