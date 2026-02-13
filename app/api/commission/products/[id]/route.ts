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
    const unset: Record<string, string> = {};

    if (body.name !== undefined && typeof body.name === "string" && body.name.trim()) {
      update.name = body.name.trim();
    }
    if (body.price !== undefined && typeof body.price === "number" && body.price >= 0) {
      update.price = body.price;
    }
    if (body.description !== undefined && typeof body.description === "string") {
      update.description = body.description.trim();
    }
    if (body.image !== undefined) {
      if (body.image && typeof body.image === "string") {
        update.image = body.image;
      } else {
        unset.image = "";
      }
    }
    if (body.stock !== undefined) {
      if (typeof body.stock === "number") {
        update.stock = body.stock;
      } else {
        unset.stock = "";
      }
    }
    if (body.sizes !== undefined) {
      if (body.sizes && typeof body.sizes === "object" && Object.keys(body.sizes).length > 0) {
        update.sizes = body.sizes;
        unset.stock = "";
      } else {
        unset.sizes = "";
      }
    }
    if (body.isNew !== undefined && typeof body.isNew === "boolean") {
      update.isNew = body.isNew;
    }

    const ops: Record<string, unknown> = {};
    if (Object.keys(update).length > 0) ops.$set = update;
    if (Object.keys(unset).length > 0) ops.$unset = unset;

    if (Object.keys(ops).length === 0) {
      return NextResponse.json({error: "Нечего обновлять"}, {status: 422});
    }

    const result = await collection.findOneAndUpdate(
      {_id: new ObjectId(id)},
      ops,
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
