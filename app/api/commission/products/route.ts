import {NextRequest, NextResponse} from "next/server";
import {productsCollection} from "@/lib/db/collections";

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
    const {name, price, description, image, sizes, isNew} = await req.json();

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

    if (image && typeof image === "string") doc.image = image.trim();
    if (sizes && typeof sizes === "object") doc.sizes = sizes;
    if (isNew) doc.isNew = true;

    const collection = await productsCollection;
    const result = await collection.insertOne(doc as never);

    return NextResponse.json({
      success: true,
      product: {_id: result.insertedId.toString(), ...doc, stock: null, sizes: doc.sizes || null, image: doc.image || null, isNew: doc.isNew ?? false},
    });
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}
