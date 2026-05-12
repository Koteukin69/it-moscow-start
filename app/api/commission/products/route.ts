import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

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

export async function GET(): Promise<NextResponse> {
  try {
    const products = await prisma.product.findMany();
    return NextResponse.json({ products: products.map(p => mapProduct(p)) });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { name, price, description, images, variants, variantLabel, isNew } = await req.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Укажите название" }, { status: 422 });
    }
    if (typeof price !== "number" || price < 0) {
      return NextResponse.json({ error: "Укажите корректную цену" }, { status: 422 });
    }
    if (!description || typeof description !== "string") {
      return NextResponse.json({ error: "Укажите описание" }, { status: 422 });
    }

    const data: Parameters<typeof prisma.product.create>[0]["data"] = {
      name: name.trim(),
      price,
      description: description.trim(),
      isNew: !!isNew,
    };

    if (Array.isArray(images)) data.images = images.filter((u: unknown) => typeof u === "string");
    if (variants && typeof variants === "object") {
      data.variants = variants;
      if (variantLabel && typeof variantLabel === "string") data.variantLabel = variantLabel.trim();
    }

    const product = await prisma.product.create({ data });

    return NextResponse.json({ success: true, product: mapProduct(product) });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
