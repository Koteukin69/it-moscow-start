import {NextRequest, NextResponse} from "next/server";
import {ObjectId} from "mongodb";
import {faqCollection} from "@/lib/db/collections";

export async function PUT(req: NextRequest, {params}: {params: Promise<{id: string}>}): Promise<NextResponse> {
  try {
    const {id} = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({error: "Неверный ID"}, {status: 400});
    }
    const {question, answer} = await req.json();
    const q = String(question).trim();
    const a = String(answer).trim();
    if (!q || !a) {
      return NextResponse.json({error: "Заполните обязательные поля"}, {status: 400});
    }
    const col = await faqCollection;
    const result = await col.findOneAndUpdate(
      {_id: new ObjectId(id)},
      {$set: {question: q, answer: a}},
      {returnDocument: "after"},
    );
    if (!result) {
      return NextResponse.json({error: "Вопрос не найден"}, {status: 404});
    }
    return NextResponse.json({
      success: true,
      item: {_id: result._id.toString(), question: result.question, answer: result.answer},
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
    const col = await faqCollection;
    const result = await col.deleteOne({_id: new ObjectId(id)});
    if (result.deletedCount === 0) {
      return NextResponse.json({error: "Вопрос не найден"}, {status: 404});
    }
    return NextResponse.json({success: true});
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}
