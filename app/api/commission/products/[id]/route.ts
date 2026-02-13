import {NextRequest, NextResponse} from "next/server";
import {productsCollection} from "@/lib/db/collections";
import {ObjectId} from "mongodb";

export async function DELETE(_req: NextRequest, {params}: {params: Promise<{id: string}>}): Promise<NextResponse> {
  try {
    const {id} = await params;
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
    const body = await req.json();
    const collection = await productsCollection;

    const update: Record<string, unknown> = {};

    if (body.stock !== undefined && typeof body.stock === "number") {
      update.stock = body.stock;
    }

    if (body.sizes && typeof body.sizes === "object") {
      update.sizes = body.sizes;
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

    return NextResponse.json({
      success: true,
      product: {
        _id: result._id.toString(),
        name: result.name,
        price: result.price,
        description: result.description,
        image: result.image || null,
        stock: result.stock ?? null,
        sizes: result.sizes || null,
        isNew: result.isNew ?? false,
      },
    });
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}
