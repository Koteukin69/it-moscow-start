"use client";

import {useState, useCallback} from "react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {specialties, type GuideSpecialty} from "@/lib/guide-data";
import {ArrowLeft, ArrowRight} from "lucide-react";
import OrbAnimation from "@/components/orb";
import Link from "next/link";

interface SectionData {
  title: string;
  content: string | string[];
}

function getSections(s: GuideSpecialty): SectionData[] {
  return [
    {title: "О чём направление", content: s.description},
    {title: "Актуальность в индустрии", content: s.relevance},
    {title: "Чему обучают", content: s.curriculum},
    {title: "Кому подойдёт", content: s.targetAudience},
    {title: "Профессиональные возможности", content: s.careers},
  ];
}

function SpecialtySteps({specialty, onBack}: {specialty: GuideSpecialty; onBack: () => void}) {
  const sections = getSections(specialty);
  const [step, setStep] = useState(0);
  const section = sections[step];
  const isLast = step === sections.length - 1;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      <Card className="w-full bg-background/70 animate-[chatFadeIn_0.3s_ease_both]">
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <Button
              variant="ghost"
              size="sm"
              className="w-fit gap-1 -ml-2 text-muted-foreground"
              onClick={onBack}
            >
              <ArrowLeft size="14px"/>
              К списку
            </Button>
            <span className="text-xs text-muted-foreground">{step + 1} / {sections.length}</span>
          </div>
          <h1 className="text-lg font-semibold text-center">{specialty.title}</h1>
          <div className="w-full bg-muted rounded-full h-1.5 mt-2">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{width: `${((step + 1) / sections.length) * 100}%`}}
            />
          </div>
        </CardHeader>
      </Card>

      <Card key={step} className="w-full bg-background/70 animate-[chatFadeIn_0.3s_ease_both]">
        <CardHeader>
          <h2 className="text-base font-semibold">{section.title}</h2>
        </CardHeader>
        <CardContent>
          {typeof section.content === "string" ? (
            <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {section.content.map((item, idx) => (
                <span
                  key={item}
                  className="text-sm text-muted-foreground animate-[chatFadeIn_0.3s_ease_both]"
                  style={{animationDelay: `${idx * 0.08}s`}}
                >
                  • {item}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 w-full">
        <div className="flex gap-2 w-full">
          {step > 0 && (
            <Button
              variant="outline"
              className="rounded-xl flex-1 gap-1"
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft size="14px"/>
              Назад
            </Button>
          )}
          {!isLast && (
            <Button
              className="rounded-xl flex-1 gap-1"
              onClick={() => setStep(step + 1)}
            >
              Далее
              <ArrowRight size="14px"/>
            </Button>
          )}
        </div>
        {isLast && (
          <Button variant="outline" className="rounded-xl w-full" onClick={onBack}>
            Вернуться к списку
          </Button>
        )}
      </div>
    </div>
  );
}

export default function Guide() {
  const [selected, setSelected] = useState<string | null>(null);

  const handleBack = useCallback(() => setSelected(null), []);

  const selectedSpecialty = selected ? specialties.find((s) => s.id === selected) : null;

  const content = selectedSpecialty ? (
    <SpecialtySteps specialty={selectedSpecialty} onBack={handleBack}/>
  ) : (
    <Card className="w-full max-w-md bg-background/70 animate-[chatFadeIn_0.3s_ease_both]">
      <CardHeader>
        <h1 className="text-xl font-semibold text-center">Гид по профессиям</h1>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground text-center">
          Привет! Это твой IT-гид. Выбирай направление и смотри, чему учат и кем можно стать.
        </p>
        <div className="flex flex-col gap-2">
          {specialties.map((s) => (
            <Button
              key={s.id}
              variant="outline"
              className="rounded-xl text-left h-auto py-3 px-4 whitespace-normal justify-start"
              onClick={() => setSelected(s.id)}
            >
              {s.title}
            </Button>
          ))}
        </div>
        <Button className="rounded-xl w-full" asChild>
          <Link href="/quiz">Пройти профтест</Link>
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex items-center justify-center min-h-screen px-10 sm:px-20 pt-16 pb-10 overflow-x-hidden">
      <div className="overflow-hidden fixed inset-0 -z-1 flex items-center justify-center">
        <div className="h-full aspect-square">
          <OrbAnimation/>
        </div>
      </div>
      {content}
    </div>
  );
}
