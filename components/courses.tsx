"use client";

import {useState, useCallback} from "react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {courses, type Course} from "@/lib/courses-data";
import {ArrowLeft, ExternalLink} from "lucide-react";
import OrbAnimation from "@/components/orb";
import Link from "next/link";

function CourseDetail({course, onBack}: {course: Course; onBack: () => void}) {
  const mosUrl = `https://www.mos.ru/pgu2/activity/groups?keyword=${course.mosCode}`;

  return (
    <Card className="w-full max-w-md bg-background/70 animate-[chatFadeIn_0.3s_ease_both]">
      <CardHeader>
        <Button
          variant="ghost"
          size="sm"
          className="w-fit gap-1 -ml-2 text-muted-foreground"
          onClick={onBack}
        >
          <ArrowLeft size="14px"/>
          К списку
        </Button>
        <h1 className="text-lg font-semibold">{course.title}</h1>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Field label="Площадка" value={course.venue}/>
        <Field label="Адрес" value={course.address}/>
        <Field label="Расписание" value={`${course.schedule}, ${course.time}`}/>
        <Field label="Преподаватель" value={course.teacher}/>
        <Field label="Возраст" value={course.age}/>
        <Field label="Стоимость" value="Бесплатно"/>
      </CardContent>
      <CardContent className="flex flex-col gap-2">
        <Button className="rounded-xl w-full gap-1" asChild>
          <a href={mosUrl} target="_blank" rel="noopener noreferrer">
            Записаться на mos.ru
            <ExternalLink size="14px"/>
          </a>
        </Button>
        <Button variant="outline" className="rounded-xl w-full" onClick={onBack}>
          Вернуться к списку
        </Button>
      </CardContent>
    </Card>
  );
}

function Field({label, value}: {label: string; value: string}) {
  return (
    <div className="flex flex-row items-start justify-between gap-2">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm text-right">{value}</span>
    </div>
  );
}

export default function Courses() {
  const [selected, setSelected] = useState<string | null>(null);

  const handleBack = useCallback(() => setSelected(null), []);

  const selectedCourse = selected ? courses.find((c) => c.id === selected) : null;

  const content = selectedCourse ? (
    <CourseDetail course={selectedCourse} onBack={handleBack}/>
  ) : (
    <Card className="w-full max-w-md bg-background/70 animate-[chatFadeIn_0.3s_ease_both]">
      <CardHeader>
        <h1 className="text-xl font-semibold text-center">Курсы IT Москва School</h1>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground text-center">
          Курсы IT Москва School — это возможность сделать первые шаги в профессию, понять, что тебе ближе, и сделать осознанный выбор. Поработать с наставником и задать все интересующие тебя вопросы.
        </p>
        <div className="flex flex-col gap-2">
          {courses.map((c) => (
            <Button
              key={c.id}
              variant="outline"
              className="rounded-xl text-left h-auto py-3 px-4 whitespace-normal justify-start"
              onClick={() => setSelected(c.id)}
            >
              <div className="flex flex-col gap-0.5">
                <span>{c.title}</span>
                <span className="text-xs text-muted-foreground font-normal">{c.venue}</span>
              </div>
            </Button>
          ))}
        </div>
        <Button className="rounded-xl w-full" variant="outline" asChild>
          <Link href="/guide">Выбери своё направление</Link>
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
