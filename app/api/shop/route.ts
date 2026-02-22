import {NextResponse} from "next/server";
import {productsCollection} from "@/lib/db/collections";

export async function GET(): Promise<NextResponse> {
  try {
    const products = await (await productsCollection).find({}).toArray();
    const result = products.map(p => ({
      _id: p._id.toString(),
      name: p.name,
      price: p.price,
      description: p.description,
      images: Array.isArray(p.images) ? p.images : [],
      stock: p.stock ?? null,
      variants: p.variants || null,
      variantLabel: p.variantLabel || null,
      isNew: p.isNew ?? false,
    }));
    return NextResponse.json({products: result});
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}
