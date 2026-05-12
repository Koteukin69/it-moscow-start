import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";
import { randomInt } from "crypto";

type CartItem = { productId: string; quantity: number; variant?: string };
type OAuthProvider = { provider: string; phone?: string };

function generatePickupCode(): string {
  return String(randomInt(100000, 1000000));
}

async function getNextOrderNumber(): Promise<number> {
  const counter = await prisma.counter.upsert({
    where: { id: "orderNumber" },
    create: { id: "orderNumber", seq: 1 },
    update: { seq: { increment: 1 } },
  });
  return counter.seq;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const userId = req.headers.get("x-user-id");
    const userName = req.headers.get("x-user-name");
    if (!userId || !userName) {
      return NextResponse.json({ error: "Ошибка аккаунта" }, { status: 401 });
    }

    const cart = await prisma.cart.findUnique({ where: { userId } });
    const cartItems = (cart?.items as CartItem[]) ?? [];

    if (!cart || cartItems.length === 0) {
      return NextResponse.json({ error: "Корзина пуста" }, { status: 422 });
    }

    const productIds = [...new Set(cartItems.map(i => i.productId))];
    const productDocs = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(productDocs.map(p => [p.id, p]));

    let totalPrice = 0;
    const validItems: Array<{
      productId: string;
      quantity: number;
      variant?: string;
      name: string;
      price: number;
    }> = [];

    for (const item of cartItems) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json({ error: `Товар не найден: ${item.productId}` }, { status: 404 });
      }

      const variants = product.variants as Record<string, number> | null;

      if (variants && Object.keys(variants).length > 0) {
        if (!item.variant || !(item.variant in variants)) {
          return NextResponse.json({ error: `Выберите вариант для «${product.name}»` }, { status: 422 });
        }
        if (variants[item.variant] < item.quantity) {
          return NextResponse.json({
            error: `Недостаточно «${product.name}» (${item.variant}). Доступно: ${variants[item.variant]}`,
          }, { status: 409 });
        }
      } else if (product.stock !== undefined && product.stock !== null) {
        if (product.stock < item.quantity) {
          return NextResponse.json({
            error: `Недостаточно «${product.name}». Доступно: ${product.stock}`,
          }, { status: 409 });
        }
      }

      totalPrice += product.price * item.quantity;
      validItems.push({ productId: item.productId, quantity: item.quantity, variant: item.variant, name: product.name, price: product.price });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const currentCoins = user?.coins ?? 0;

    if (currentCoins < totalPrice) {
      return NextResponse.json({
        error: "Недостаточно монет",
        deficit: totalPrice - currentCoins,
        total: totalPrice,
        balance: currentCoins,
      }, { status: 402 });
    }

    const updatedUser = await prisma.user.updateManyAndReturn({
      where: { id: userId, coins: { gte: totalPrice } },
      data: { coins: { decrement: totalPrice } },
    });

    if (updatedUser.length === 0) {
      return NextResponse.json({ error: "Недостаточно монет" }, { status: 402 });
    }

    const stockRollbacks: Array<() => Promise<void>> = [];

    for (const item of validItems) {
      const product = productMap.get(item.productId)!;
      const variants = product.variants as Record<string, number> | null;

      if (item.variant && variants) {
        const currentVariantStock = variants[item.variant];
        if (currentVariantStock < item.quantity) {
          await prisma.user.update({ where: { id: userId }, data: { coins: { increment: totalPrice } } });
          for (const rollback of stockRollbacks) await rollback();
          return NextResponse.json({ error: `«${item.name}» (${item.variant}) закончился` }, { status: 409 });
        }
        const updatedVariants = { ...variants, [item.variant]: currentVariantStock - item.quantity };
        await prisma.product.update({ where: { id: item.productId }, data: { variants: updatedVariants } });
        stockRollbacks.push(async () => {
          const p = await prisma.product.findUnique({ where: { id: item.productId } });
          if (p) {
            const v = p.variants as Record<string, number>;
            await prisma.product.update({ where: { id: item.productId }, data: { variants: { ...v, [item.variant!]: (v[item.variant!] ?? 0) + item.quantity } } });
          }
        });
      } else if (product.stock !== null && product.stock !== undefined) {
        if (product.stock < item.quantity) {
          await prisma.user.update({ where: { id: userId }, data: { coins: { increment: totalPrice } } });
          for (const rollback of stockRollbacks) await rollback();
          return NextResponse.json({ error: `«${item.name}» закончился` }, { status: 409 });
        }
        await prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
        stockRollbacks.push(async () => {
          await prisma.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
        });
      }
    }

    const phone = ((user?.oauthProviders as OAuthProvider[]) ?? []).find(p => p.phone)?.phone ?? null;
    const now = new Date();
    let decodedName: string;
    try { decodedName = decodeURIComponent(userName); } catch { decodedName = userName; }

    const orderDocs: Prisma.OrderCreateManyInput[] = [];
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
        variant: item.variant || null,
        quantity: item.quantity,
        price: item.price * item.quantity,
        status: "pending",
        createdAt: now,
      });
    }

    try {
      await prisma.order.createMany({ data: orderDocs });
      await prisma.cart.update({ where: { userId }, data: { items: [] } });
    } catch (insertError) {
      await prisma.user.update({ where: { id: userId }, data: { coins: { increment: totalPrice } } });
      for (const rollback of stockRollbacks) await rollback();
      throw insertError;
    }

    const finalUser = await prisma.user.findUnique({ where: { id: userId }, select: { coins: true } });

    return NextResponse.json({
      success: true,
      coins: finalUser?.coins ?? 0,
      ordersCount: orderDocs.length,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
