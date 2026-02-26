import {NextResponse} from "next/server";
import {consultationsCollection} from "@/lib/db/collections";

export async function GET(): Promise<NextResponse> {
  try {
    const collection = await consultationsCollection;
    const consultations = await collection
      .find({flames: {$gt: 0}})
      .sort({createdAt: -1})
      .toArray();

    return NextResponse.json({
      consultations: consultations.map(c => ({
        _id: c._id.toString(),
        name: c.name,
        phone: c.phone,
        childName: c.childName,
        specialty: c.specialty,
        grade: c.grade,
        flames: c.flames,
        createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
      })),
    });
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}
