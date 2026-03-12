import {NextResponse} from "next/server";
import {specialtiesCollection} from "@/lib/db/collections";
import {mergeWithDefaults} from "@/lib/merge-specialties";

export async function GET(): Promise<NextResponse> {
  try {
    const docs = await (await specialtiesCollection).find({}).toArray();
    const specialties = mergeWithDefaults(docs);
    return NextResponse.json({specialties});
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}
