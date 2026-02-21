import Image from "next/image";
import {Button} from "@/components/ui/button";
import {ChevronDown} from "lucide-react";

export default function ParentHero() {
  return (
    <section className="relative flex min-h-[calc(100vh-4.5rem)] flex-col items-center justify-center gap-8 px-10 sm:px-20 py-20 text-center">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-transparent to-transparent"/>

      <Image
        src="/logo.svg"
        alt="IT.Москва"
        width={183}
        height={99}
        className="h-16 w-auto sm:h-20"
        priority
      />

      <div className="flex max-w-2xl flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Москва ждёт твой деплой!
        </h1>
        <p className="text-lg text-muted-foreground sm:text-xl">
          Запускай карьеру здесь!
        </p>
      </div>

      <Button variant="ghost" size="icon" className="animate-bounce" asChild>
        <a href="#directions">
          <ChevronDown size={24}/>
        </a>
      </Button>
    </section>
  );
}
