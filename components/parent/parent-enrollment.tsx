import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {FileText, GraduationCap, ClipboardCheck, Send, Flag} from "lucide-react";
import Link from "next/link";

type Step = {
  icon: React.ElementType;
  title: string;
  description: React.ReactNode;
};

const steps: Step[] = [
  {
    icon: FileText,
    title: "Подай заявление на mos.ru",
    description: (
      <div className="space-y-2 text-left text-sm text-muted-foreground">
        <ul className="space-y-1">
          <li>
            <span className="font-medium text-foreground">Выпускник 9 класса московской школы 2026, 2025 гг:</span>{" "}
            с 26 июня по 26 июля
          </li>
          <li>
            <span className="font-medium text-foreground">Остальные категории:</span>{" "}
            с 26 июня по 15 августа
          </li>
        </ul>
        <p>
          Подача заявлений осуществляется через портал{" "}
          <Link
            href="https://mos.ru"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            мос.ру
          </Link>
        </p>
      </div>
    ),
  },
  {
    icon: GraduationCap,
    title: "Ожидай результатов конкурсного отбора",
    description: (
      <ul className="space-y-1 text-left text-sm text-muted-foreground">
        <li>Сумма первичных баллов 2 экзаменов ОГЭ: русский язык и математика</li>
        <li>Средний балл аттестата для поступающих после 11 класса</li>
      </ul>
    ),
  },
  {
    icon: ClipboardCheck,
    title: "Приезжай с документами в Приёмную комиссию",
    description: (
      <p className="text-sm text-muted-foreground">
        Привези оригиналы документов и оформи зачисление
      </p>
    ),
  },
];

const socials = [
  {name: "Telegram", href: "https://t.me/itmoscow", icon: Send},
];

export default function ParentEnrollment() {
  return (
    <section id="enrollment" className="relative overflow-hidden mx-auto max-w-6xl px-10 py-20 sm:px-20">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 z-[-1] hidden h-full w-full sm:block"
        aria-hidden="true"
      >
        <path
          d="M -2 75 C 15 35, 22 85, 34 55 C 46 25, 54 80, 67 50 C 79 20, 88 65, 95 30"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          opacity={0.35}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div
        className="pointer-events-none absolute z-[1] hidden sm:block"
        style={{ left: "95%", top: "30%", transform: "translate(-20%, -100%)" }}
        aria-hidden="true"
      >
        <Flag className="size-6 text-blue-500 opacity-70" />
      </div>
      <div className="mb-12 flex flex-col gap-3 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Поступление в IT.Москва начнётся 26 июня!
        </h2>
        <p className="mx-auto max-w-3xl text-muted-foreground">
          Будь одним из первых — позвони в Приёмную комиссию по номеру{" "}
          <Link
            href="tel:84996121498"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            8(499) 612-14-98
          </Link>{" "}
          и запишись на адресное сопровождение, индивидуальную консультацию и день открытых дверей!
        </p>
      </div>

      <div className="mb-12 grid gap-6 sm:grid-cols-3">
        {steps.map((step, i) => (
          <Card key={step.title}>
            <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <step.icon className="size-6"/>
              </div>
              <span className="text-sm font-semibold text-muted-foreground">
                Шаг {i + 1}
              </span>
              <h3 className="text-lg font-bold">{step.title}</h3>
              {step.description}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
