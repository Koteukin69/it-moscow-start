import {NextResponse} from "next/server";
import {eventsCollection} from "@/lib/db/collections";

export async function GET(): Promise<NextResponse> {
  try {
    const events = await (await eventsCollection).find({}).sort({date: 1}).toArray();
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
