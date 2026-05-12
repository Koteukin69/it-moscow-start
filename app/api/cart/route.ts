import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

type CartItem = { productId: string; quantity: number; variant?: string };

type ProductRecord = {
  id: string;
  name: string;
  price: number;
  images: unknown;
  variants: unknown;
  variantLabel: string | null;
  stock: number | null;
  isNew: boolean;
};

async function getEnrichedCart(userId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  const items = (cart?.items as CartItem[]) ?? [];

  if (items.length === 0) return { items: [] };

  const productIds = [...new Set(items.map(i => i.productId))];
  const productDocs = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productMap = new Map(productDocs.map(p => [p.id, p as unknown as ProductRecord]));

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
        variants: (product.variants as Record<string, number> | null) || null,
        variantLabel: product.variantLabel || null,
        stock: product.stock ?? null,
        isNew: product.isNew ?? false,
      };
    })
    .filter(Boolean);

  return { items: enriched };
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Ошибка аккаунта" }, { status: 401 });

    const cart = await getEnrichedCart(userId);
    return NextResponse.json(cart);
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Ошибка аккаунта" }, { status: 401 });

    const { productId, variant } = await req.json();
    if (!productId || typeof productId !== "string") {
      return NextResponse.json({ error: "Некорректный товар" }, { status: 422 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: "Товар не найден" }, { status: 404 });

    const variants = product.variants as Record<string, number> | null;
    const hasVariants = variants && Object.keys(variants).length > 0;
    let resolvedVariant = variant;

    if (hasVariants) {
      if (!resolvedVariant || !(resolvedVariant in variants!)) {
        resolvedVariant = Object.entries(variants!).find(([, count]) => count > 0)?.[0];
        if (!resolvedVariant) {
          return NextResponse.json({ error: "Нет в наличии" }, { status: 409 });
        }
      }
    }

    const cart = await prisma.cart.findUnique({ where: { userId } });
    const currentItems = (cart?.items as CartItem[]) ?? [];
    const newItem: CartItem = { productId, quantity: 1, ...(resolvedVariant ? { variant: resolvedVariant } : {}) };

    let updatedItems: CartItem[];

    if (!cart) {
      await prisma.cart.create({ data: { userId, items: [newItem] } });
    } else if (hasVariants) {
      updatedItems = [...currentItems, newItem];
      await prisma.cart.update({ where: { userId }, data: { items: updatedItems } });
    } else {
      const existingIdx = currentItems.findIndex(i => i.productId === productId);
      if (existingIdx >= 0) {
        updatedItems = currentItems.map((item, i) =>
          i === existingIdx ? { ...item, quantity: item.quantity + 1 } : item,
        );
      } else {
        updatedItems = [...currentItems, newItem];
      }
      await prisma.cart.update({ where: { userId }, data: { items: updatedItems } });
    }

    const enriched = await getEnrichedCart(userId);
    return NextResponse.json(enriched);
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Ошибка аккаунта" }, { status: 401 });

    const { index, quantity, newVariant } = await req.json();
    if (typeof index !== "number" || index < 0) {
      return NextResponse.json({ error: "Некорректный индекс" }, { status: 422 });
    }

    const cart = await prisma.cart.findUnique({ where: { userId } });
    const currentItems = (cart?.items as CartItem[]) ?? [];

    if (!cart || index >= currentItems.length) {
      return NextResponse.json({ error: "Позиция не найдена" }, { status: 404 });
    }

    let updatedItems: CartItem[];

    if (typeof quantity === "number" && quantity <= 0) {
      updatedItems = currentItems.filter((_, i) => i !== index);
    } else {
      updatedItems = currentItems.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item };
        if (typeof quantity === "number") updated.quantity = quantity;
        if (newVariant !== undefined) {
          if (newVariant) updated.variant = newVariant;
          else delete updated.variant;
        }
        return updated;
      });
    }

    await prisma.cart.update({ where: { userId }, data: { items: updatedItems } });

    const enriched = await getEnrichedCart(userId);
    return NextResponse.json(enriched);
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Ошибка аккаунта" }, { status: 401 });

    const body = await req.json();
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return NextResponse.json({ error: "Корзина не найдена" }, { status: 404 });

    const currentItems = (cart.items as CartItem[]) ?? [];
    let updatedItems: CartItem[];

    if (typeof body.productId === "string") {
      updatedItems = currentItems.filter(i => i.productId !== body.productId);
    } else if (typeof body.index === "number" && body.index >= 0) {
      if (body.index >= currentItems.length) {
        return NextResponse.json({ error: "Позиция не найдена" }, { status: 404 });
      }
      updatedItems = currentItems.filter((_, i) => i !== body.index);
    } else {
      return NextResponse.json({ error: "Укажите index или productId" }, { status: 422 });
    }

    await prisma.cart.update({ where: { userId }, data: { items: updatedItems } });

    const enriched = await getEnrichedCart(userId);
    return NextResponse.json(enriched);
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
