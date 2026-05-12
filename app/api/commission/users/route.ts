import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

type OAuthProvider = { provider: string; phone?: string };

export async function GET(): Promise<NextResponse> {
  try {
    const users = await prisma.user.findMany();
    const quizResults = await prisma.quizResult.findMany();

    const quizMap = new Map(quizResults.map(q => [q.userId, q]));

    const hiddenPhones = new Set(
      (process.env.COMMISSION_HIDDEN_PHONES ?? "")
        .split(",")
        .map(p => p.trim())
        .filter(Boolean),
    );

    const result = users.map(u => {
      const quiz = quizMap.get(u.id);
      const providers = (u.oauthProviders as OAuthProvider[]) ?? [];
      const phones = providers
        .map(p => p.phone)
        .filter((p): p is string => p !== undefined && !hiddenPhones.has(p));

      return {
        _id: u.id,
        name: u.name,
        phones,
        providers: providers.map(p => p.provider),
        coins: u.coins ?? 0,
        quiz: quiz
          ? { directions: quiz.directions, top: quiz.top, completedAt: quiz.completedAt.toISOString() }
          : null,
      };
    });

    return NextResponse.json({ users: result });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
