'use client';

import {useState, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {GraduationCap, X} from "lucide-react";

export default function ParentConsultationBanner() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (dismissed || !visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-md rounded-2xl bg-background p-8 shadow-2xl text-center">
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-4 top-4 rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Закрыть"
        >
          <X size={20}/>
        </button>

        <div className="flex flex-col items-center gap-6">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <GraduationCap className="size-8"/>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold sm:text-2xl">
              Задай вопрос специалисту приёмной комиссии
            </h2>
            <p className="text-sm text-muted-foreground">
              Запишись на бесплатную консультацию и узнай всё о поступлении
            </p>
          </div>

          <Button
            size="lg"
            className="w-full"
            asChild
          >
            <a href="#consultation" onClick={() => setDismissed(true)}>
              Записаться
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
