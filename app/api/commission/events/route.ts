import {NextRequest, NextResponse} from "next/server";
import {eventsCollection} from "@/lib/db/collections";

export async function GET(): Promise<NextResponse> {
  try {
    const events = await (await eventsCollection).find({}).sort({date: -1}).toArray();
    const result = events.map(e => ({
      _id: e._id.toString(),
      name: e.name,
      date: e.date,
      image: e.image || null,
      description: e.description,
    }));
    return NextResponse.json({events: result});
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const {name, date, image, description} = await req.json();

    if (!name || !date || !description) {
      return NextResponse.json({error: "Заполните обязательные поля"}, {status: 400});
    }

    const collection = await eventsCollection;
    const result = await collection.insertOne({
      name: String(name),
      date: String(date),
      image: image ? String(image) : undefined,
      description: String(description),
    });

    return NextResponse.json({
      success: true,
      event: {
        _id: result.insertedId.toString(),
        name,
        date,
        image: image || null,
        description,
      },
    });
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}
