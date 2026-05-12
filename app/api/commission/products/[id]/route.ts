import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

const mapProduct = (p: { id: string; name: string; price: number; description: string; images: unknown; stock: number | null; variants: unknown; variantLabel: string | null; isNew: boolean }) => ({
  _id: p.id,
  name: p.name,
  price: p.price,
  description: p.description,
  images: Array.isArray(p.images) ? p.images : [],
  stock: p.stock ?? null,
  variants: (p.variants as Record<string, number> | null) || null,
  variantLabel: p.variantLabel || null,
  isNew: p.isNew ?? false,
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id } = await params;

    const body = await req.json();
    const { name, price, description } = body;
    if (!name || price === undefined || !description) {
      return NextResponse.json({ error: "Заполните обязательные поля" }, { status: 400 });
    }

    const data: Parameters<typeof prisma.product.update>[0]["data"] = {
      name: String(name),
      price: Number(price),
      description: String(description),
      isNew: !!body.isNew,
    };

    if (Array.isArray(body.images)) {
      data.images = body.images.filter((u: unknown) => typeof u === "string");
    }

    if (body.variants && typeof body.variants === "object") {
      data.variants = body.variants;
      data.stock = null;
      if (body.variantLabel) data.variantLabel = String(body.variantLabel);
    } else if (body.stock !== undefined && body.stock !== null) {
      data.stock = Number(body.stock);
      data.variants = Prisma.DbNull;
      data.variantLabel = null;
    }

    const result = await prisma.product.update({ where: { id }, data });
    return NextResponse.json({ success: true, product: mapProduct(result) });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({ where: { id }, select: { id: true } });
    if (!product) {
      return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await req.json();

    const data: Parameters<typeof prisma.product.update>[0]["data"] = {};

    if (body.stock !== undefined && typeof body.stock === "number") data.stock = body.stock;
    if (body.variants && typeof body.variants === "object") data.variants = body.variants;
    if (body.isNew !== undefined && typeof body.isNew === "boolean") data.isNew = body.isNew;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Нечего обновлять" }, { status: 422 });
    }

    const result = await prisma.product.update({ where: { id }, data });
    return NextResponse.json({ success: true, product: mapProduct(result) });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
