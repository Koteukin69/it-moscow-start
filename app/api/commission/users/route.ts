import {NextResponse} from "next/server";
import {usersCollection, quizResultsCollection} from "@/lib/db/collections";

export async function GET(): Promise<NextResponse> {
  try {
    const users = await (await usersCollection).find({}).toArray();
    const quizResults = await (await quizResultsCollection).find({}).toArray();

    const quizMap = new Map(quizResults.map(q => [q.userId, q]));

    const result = users.map(u => {
      const quiz = quizMap.get(u._id.toString());
      return {
        _id: u._id.toString(),
        name: u.name,
        phone: u.phone || null,
        coins: u.coins ?? 0,
        quiz: quiz
          ? {directions: quiz.directions, top: quiz.top, completedAt: quiz.completedAt.toISOString()}
          : null,
      };
    });

    return NextResponse.json({users: result});
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}
