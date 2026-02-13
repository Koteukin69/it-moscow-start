import {NextRequest, NextResponse} from "next/server";
import {ObjectId} from "mongodb";
import {eventsCollection} from "@/lib/db/collections";

export async function DELETE(_req: NextRequest, {params}: {params: Promise<{id: string}>}): Promise<NextResponse> {
  try {
    const {id} = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({error: "Неверный ID"}, {status: 400});
    }

    const collection = await eventsCollection;
    const result = await collection.deleteOne({_id: new ObjectId(id)});

    if (result.deletedCount === 0) {
      return NextResponse.json({error: "Мероприятие не найдено"}, {status: 404});
    }

    return NextResponse.json({success: true});
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}
