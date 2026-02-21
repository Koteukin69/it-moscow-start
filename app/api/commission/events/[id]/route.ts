import {NextRequest, NextResponse} from "next/server";
import {ObjectId} from "mongodb";
import {eventsCollection} from "@/lib/db/collections";

export async function PUT(req: NextRequest, {params}: {params: Promise<{id: string}>}): Promise<NextResponse> {
  try {
    const {id} = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({error: "Неверный ID"}, {status: 400});
    }

    const {name, date, image, description} = await req.json();
    if (!name || !date || !description || !image) {
      return NextResponse.json({error: "Заполните обязательные поля"}, {status: 400});
    }

    const collection = await eventsCollection;
    const result = await collection.findOneAndUpdate(
      {_id: new ObjectId(id)},
      {$set: {name: String(name), date: String(date), image: String(image), description: String(description)}},
      {returnDocument: "after"},
    );

    if (!result) {
      return NextResponse.json({error: "Мероприятие не найдено"}, {status: 404});
    }

    return NextResponse.json({
      success: true,
      event: {_id: result._id.toString(), name: result.name, date: result.date, image: result.image || null, description: result.description},
    });
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
