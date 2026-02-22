import {NextRequest, NextResponse} from "next/server";
import {productsCollection} from "@/lib/db/collections";

const mapProduct = (p: Record<string, unknown> & {_id: {toString(): string}}) => ({
  _id: p._id.toString(),
  name: p.name,
  price: p.price,
  description: p.description,
  images: Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []),
  stock: p.stock ?? null,
  variants: p.variants || p.sizes || null,
  variantLabel: p.variantLabel || null,
  isNew: p.isNew ?? false,
});

export async function GET(): Promise<NextResponse> {
  try {
    const products = await (await productsCollection).find({}).toArray();
    return NextResponse.json({products: products.map(p => mapProduct(p as never))});
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const {name, price, description, images, variants, variantLabel, isNew} = await req.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json({error: "Укажите название"}, {status: 422});
    }
    if (typeof price !== "number" || price < 0) {
      return NextResponse.json({error: "Укажите корректную цену"}, {status: 422});
    }
    if (!description || typeof description !== "string") {
      return NextResponse.json({error: "Укажите описание"}, {status: 422});
    }

    const doc: Record<string, unknown> = {
      name: name.trim(),
      price,
      description: description.trim(),
    };

    if (Array.isArray(images)) doc.images = images.filter((u: unknown) => typeof u === "string");
    if (variants && typeof variants === "object") {
      doc.variants = variants;
      if (variantLabel && typeof variantLabel === "string") doc.variantLabel = variantLabel.trim();
    }
    if (isNew) doc.isNew = true;

    const collection = await productsCollection;
    const result = await collection.insertOne(doc as never);

    return NextResponse.json({
      success: true,
      product: mapProduct({_id: result.insertedId, ...doc} as never),
    });
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}
