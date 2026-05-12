import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { OrderStatus } from "@prisma/client";

function mapOrder(o: { id: string; orderNumber: number; pickupCode: string; userId: string; userName: string; phone: string | null; productId: string; productName: string; variant: string | null; quantity: number; price: number; status: OrderStatus; createdAt: Date }) {
  return {
    _id: o.id,
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
    createdAt: o.createdAt.toISOString(),
  };
}

async function restoreStock(productId: string, variant: string | null | undefined, quantity: number) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return;

  if (variant) {
    const variants = (product.variants as Record<string, number> | null) ?? {};
    await prisma.product.update({
      where: { id: productId },
      data: { variants: { ...variants, [variant]: (variants[variant] ?? 0) + quantity } },
    });
  } else if (product.stock !== null) {
    await prisma.product.update({ where: { id: productId }, data: { stock: { increment: quantity } } });
  }
}

async function reduceStock(productId: string, variant: string | null | undefined, quantity: number): Promise<boolean> {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return false;

  if (variant) {
    const variants = (product.variants as Record<string, number> | null) ?? {};
    if ((variants[variant] ?? 0) < quantity) return false;
    await prisma.product.update({
      where: { id: productId },
      data: { variants: { ...variants, [variant]: variants[variant] - quantity } },
    });
    return true;
  }

  if (product.stock === null || product.stock === undefined) return true;
  if (product.stock < quantity) return false;
  await prisma.product.update({ where: { id: productId }, data: { stock: { decrement: quantity } } });
  return true;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id } = await params;

    const body = await req.json();
    if (!body.status || !["pending", "completed", "cancelled"].includes(body.status)) {
      return NextResponse.json({ error: "Неверный статус" }, { status: 400 });
    }

    if (body.status === "completed") {
      const order = await prisma.order.findUnique({ where: { id } });
      if (!order || order.status !== "pending") {
        return NextResponse.json({ error: "Заказ не найден или не в статусе ожидания" }, { status: 422 });
      }
      if (!body.pickupCode || body.pickupCode !== order.pickupCode) {
        return NextResponse.json({ error: "Неверный код выдачи" }, { status: 403 });
      }
      await prisma.order.update({ where: { id }, data: { status: "completed" } });
    }

    if (body.status === "cancelled") {
      const order = await prisma.order.findFirst({ where: { id, status: "pending" } });
      if (!order) {
        return NextResponse.json({ error: "Заказ не найден или не в статусе ожидания" }, { status: 422 });
      }
      await prisma.order.update({ where: { id }, data: { status: "cancelled" } });
      await prisma.user.update({ where: { id: order.userId }, data: { coins: { increment: order.price } } });
      await restoreStock(order.productId, order.variant, order.quantity || 1);
    }

    if (body.status === "pending") {
      const order = await prisma.order.findUnique({ where: { id } });
      if (!order) {
        return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
      }
      if (order.status !== "cancelled") {
        return NextResponse.json({ error: "Только отменённый заказ можно восстановить" }, { status: 422 });
      }

      const stockOk = await reduceStock(order.productId, order.variant, order.quantity || 1);
      if (!stockOk) {
        return NextResponse.json({ error: "Товара нет в наличии" }, { status: 409 });
      }

      const updated = await prisma.user.updateManyAndReturn({
        where: { id: order.userId, coins: { gte: order.price } },
        data: { coins: { decrement: order.price } },
      });

      if (updated.length === 0) {
        await restoreStock(order.productId, order.variant, order.quantity || 1);
        return NextResponse.json({ error: "У пользователя недостаточно монет" }, { status: 402 });
      }

      await prisma.order.update({ where: { id }, data: { status: "pending" } });
    }

    const updated = await prisma.order.findUnique({ where: { id } });
    return NextResponse.json({ success: true, order: updated ? mapOrder(updated) : null });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
    }

    if (order.status === "pending") {
      return NextResponse.json({ error: "Нельзя удалить ожидающий заказ. Сначала отмените его." }, { status: 422 });
    }

    await prisma.order.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
