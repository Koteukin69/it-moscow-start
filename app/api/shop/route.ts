import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(): Promise<NextResponse> {
  try {
    const products = await prisma.product.findMany();
    const result = products.map(p => ({
      _id: p.id,
      name: p.name,
      price: p.price,
      description: p.description,
      images: Array.isArray(p.images) ? p.images : [],
      stock: p.stock ?? null,
      variants: (p.variants as Record<string, number> | null) || null,
      variantLabel: p.variantLabel || null,
      isNew: p.isNew ?? false,
    }));
    return NextResponse.json({ products: result });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
