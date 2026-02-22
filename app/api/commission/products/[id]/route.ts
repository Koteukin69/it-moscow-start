import {NextRequest, NextResponse} from "next/server";
import {productsCollection} from "@/lib/db/collections";
import {ObjectId} from "mongodb";

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

export async function PUT(req: NextRequest, {params}: {params: Promise<{id: string}>}): Promise<NextResponse> {
  try {
    const {id} = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({error: "Неверный ID"}, {status: 400});
    }

    const body = await req.json();
    const {name, price, description} = body;
    if (!name || price === undefined || !description) {
      return NextResponse.json({error: "Заполните обязательные поля"}, {status: 400});
    }

    const update: Record<string, unknown> = {
      name: String(name),
      price: Number(price),
      description: String(description),
      isNew: !!body.isNew,
    };

    if (Array.isArray(body.images)) {
      update.images = body.images.filter((u: unknown) => typeof u === "string");
    }

    const unsetFields: Record<string, ""> = {};

    if (body.variants && typeof body.variants === "object") {
      update.variants = body.variants;
      unsetFields.stock = "";
      if (body.variantLabel) update.variantLabel = String(body.variantLabel);
    } else if (body.stock !== undefined && body.stock !== null) {
      update.stock = Number(body.stock);
      unsetFields.variants = "";
      unsetFields.variantLabel = "";
    }

    const collection = await productsCollection;
    const op: Record<string, unknown> = {$set: update};
    if (Object.keys(unsetFields).length > 0) op.$unset = unsetFields;

    const result = await collection.findOneAndUpdate(
      {_id: new ObjectId(id)},
      op,
      {returnDocument: "after"},
    );

    if (!result) {
      return NextResponse.json({error: "Товар не найден"}, {status: 404});
    }

    return NextResponse.json({success: true, product: mapProduct(result as never)});
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}

export async function DELETE(_req: NextRequest, {params}: {params: Promise<{id: string}>}): Promise<NextResponse> {
  try {
    const {id} = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({error: "Неверный ID"}, {status: 400});
    }
    const collection = await productsCollection;
    const result = await collection.deleteOne({_id: new ObjectId(id)});
    if (result.deletedCount === 0) {
      return NextResponse.json({error: "Товар не найден"}, {status: 404});
    }
    return NextResponse.json({success: true});
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}

export async function PATCH(req: NextRequest, {params}: {params: Promise<{id: string}>}): Promise<NextResponse> {
  try {
    const {id} = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({error: "Неверный ID"}, {status: 400});
    }
    const body = await req.json();
    const collection = await productsCollection;

    const update: Record<string, unknown> = {};

    if (body.stock !== undefined && typeof body.stock === "number") {
      update.stock = body.stock;
    }

    if (body.variants && typeof body.variants === "object") {
      update.variants = body.variants;
    }

    if (body.isNew !== undefined && typeof body.isNew === "boolean") {
      update.isNew = body.isNew;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({error: "Нечего обновлять"}, {status: 422});
    }

    const result = await collection.findOneAndUpdate(
      {_id: new ObjectId(id)},
      {$set: update},
      {returnDocument: "after"}
    );

    if (!result) {
      return NextResponse.json({error: "Товар не найден"}, {status: 404});
    }

    return NextResponse.json({success: true, product: mapProduct(result as never)});
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}
