import {NextRequest, NextResponse} from "next/server";
import {ObjectId} from "mongodb";
import {consultationsCollection} from "@/lib/db/collections";

export async function PATCH(
  req: NextRequest,
  {params}: {params: Promise<{id: string}>},
): Promise<NextResponse> {
  try {
    const {id} = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({error: "Неверный ID"}, {status: 400});
    }

    const body = await req.json();
    const action: string = body.action;

    if (action !== "like" && action !== "dislike") {
      return NextResponse.json({error: "Неверное действие"}, {status: 400});
    }

    const collection = await consultationsCollection;
    const objectId = new ObjectId(id);

    if (action === "like") {
      await collection.deleteOne({_id: objectId});
      return NextResponse.json({success: true, removed: true});
    }

    const updated = await collection.findOneAndUpdate(
      {_id: objectId},
      {$inc: {flames: -1}},
      {returnDocument: "after"},
    );

    if (!updated) {
      return NextResponse.json({error: "Заявка не найдена"}, {status: 404});
    }

    if (updated.flames <= 0) {
      await collection.deleteOne({_id: objectId});
      return NextResponse.json({success: true, removed: true});
    }

    return NextResponse.json({
      success: true,
      removed: false,
      consultation: {
        _id: updated._id.toString(),
        name: updated.name,
        phone: updated.phone,
        childName: updated.childName,
        specialty: updated.specialty,
        grade: updated.grade,
        flames: updated.flames,
        createdAt: updated.createdAt instanceof Date ? updated.createdAt.toISOString() : updated.createdAt,
      },
    });
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}
