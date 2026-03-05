import {NextRequest, NextResponse} from "next/server";
import {faqCollection} from "@/lib/db/collections";
import {defaultApplicantFaq} from "@/lib/faq";

export async function GET(): Promise<NextResponse> {
  try {
    const col = await faqCollection;
    let items = await col.find({}).sort({_id: 1}).toArray();
    if (items.length === 0) {
      await col.insertMany(defaultApplicantFaq.map(item => ({question: item.question.trim(), answer: item.answer.trim()})));
      items = await col.find({}).sort({_id: 1}).toArray();
    }
    const result = items.map(i => ({
      _id: i._id.toString(),
      question: i.question,
      answer: i.answer,
    }));
    return NextResponse.json({faq: result});
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const {question, answer} = await req.json();
    const q = String(question).trim();
    const a = String(answer).trim();
    if (!q || !a) {
      return NextResponse.json({error: "Заполните обязательные поля"}, {status: 400});
    }
    const col = await faqCollection;
    const result = await col.insertOne({question: q, answer: a});
    return NextResponse.json({
      success: true,
      item: {_id: result.insertedId.toString(), question: q, answer: a},
    });
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}
