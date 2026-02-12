"use client";

import {useState, useCallback} from "react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {questions, directionResults, directions, type Direction} from "@/lib/quiz-data";
import OrbAnimation from "@/components/orb";
import Link from "next/link";

type Stage = "intro" | "question" | "result";

function calculateResults(answers: number[]): {directions: Record<string, number>; top: string[]} {
  const scores: Record<string, number> = {};
  for (const d of directions) scores[d] = 0;

  answers.forEach((answerIdx, questionIdx) => {
    const option = questions[questionIdx].options[answerIdx];
    for (const dir of option.scores) {
      scores[dir] = (scores[dir] || 0) + 1;
    }
  });

  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .filter(([, v]) => v > 0);

  const topCount = sorted.length >= 3 ? 3 : sorted.length;
  const top = sorted.slice(0, topCount).map(([k]) => k);

  return {directions: scores, top};
}

export default function Quiz() {
  const [stage, setStage] = useState<Stage>("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{directions: Record<string, number>; top: string[]} | null>(null);

  const handleStart = useCallback(() => {
    setStage("question");
    setCurrentQuestion(0);
    setAnswers([]);
    setResult(null);
  }, []);

  const handleAnswer = useCallback((optionIdx: number) => {
    const newAnswers = [...answers, optionIdx];
    setAnswers(newAnswers);

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const res = calculateResults(newAnswers);
      setResult(res);
      setStage("result");

      fetch("/api/quiz", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(res),
      });
    }
  }, [answers, currentQuestion]);

  const content = (() => {
    if (stage === "intro") {
      return (
        <Card className="w-full max-w-md bg-background/70 animate-[chatFadeIn_0.3s_ease_both]">
          <CardHeader>
            <h1 className="text-xl font-semibold text-center">Тест: Кто ты в IT?</h1>
          </CardHeader>
          <CardContent className="flex flex-col gap-10">
            <p className="text-sm text-muted-foreground text-center">
              Давай выберем направление, которое подойдёт именно тебе! Ответь на 8 вопросов — не задумывайся слишком долго, важна первая реакция.
            </p>
            <Button className="rounded-xl w-full" onClick={handleStart}>
              Начать
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (stage === "question") {
      const q = questions[currentQuestion];
      return (
        <Card key={currentQuestion} className="w-full max-w-md bg-background/70 animate-[chatFadeIn_0.3s_ease_both]">
          <CardHeader>
            <div className="flex justify-between items-center w-full">
              <span className="text-xs text-muted-foreground">Вопрос {currentQuestion + 1} из {questions.length}</span>
              <span className="text-xs text-muted-foreground">{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-2">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{width: `${((currentQuestion + 1) / questions.length) * 100}%`}}
              />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <h2 className="font-medium text-base">{q.question}</h2>
            <div className="flex flex-col gap-2">
              {q.options.map((option, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="rounded-xl text-left h-auto py-3 px-4 whitespace-normal justify-start"
                  onClick={() => handleAnswer(idx)}
                >
                  {option.text}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="w-full max-w-md bg-background/70 animate-[chatFadeIn_0.3s_ease_both]">
        <CardHeader>
          <h1 className="text-xl font-semibold text-center">Твои результаты</h1>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground text-center">
            На основе твоих ответов мы подобрали подходящие направления:
          </p>
          {result?.top.map((dir, idx) => {
            const info = directionResults[dir as Direction];
            return (
              <Card key={dir} className="bg-background/70 animate-[chatFadeIn_0.3s_ease_both]" style={{animationDelay: `${idx * 0.1}s`}}>
                <CardContent className="flex flex-col gap-2 pt-4">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center size-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">
                      {idx + 1}
                    </span>
                    <h3 className="font-semibold text-sm">{info.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{info.description}</p>
                  <div className="flex flex-col gap-1">
                    {info.specialties.map((s) => (
                      <span key={s} className="text-xs text-muted-foreground">• {s}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          <div className="flex flex-col gap-4 mt-2">
            <Button className="rounded-xl w-full" variant="outline" onClick={handleStart}>
              Пройти заново
            </Button>
            <Button className="rounded-xl w-full" asChild>
              <Link href="/applicant">Вернуться в меню</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  })();

  return (
    <div className="flex items-center justify-center min-h-screen px-10 sm:px-20 pt-16 pb-10 overflow-x-hidden">
      <div className="overflow-hidden fixed inset-0 -z-1 flex items-center justify-center">
        <div className="h-full aspect-square">
          <OrbAnimation />
        </div>
      </div>
      {content}
    </div>
  );
}
