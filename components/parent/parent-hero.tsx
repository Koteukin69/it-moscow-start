import Image from "next/image";
import {Button} from "@/components/ui/button";
import {ChevronDown} from "lucide-react";

export default function ParentHero() {
  return (
    <section className="relative flex min-h-[calc(100vh-4.5rem)] flex-col items-center justify-center gap-8 px-10 sm:px-20 py-20 text-center">
      <div className="absolute inset-0 -z-5 bg-linear-to-b from-primary/10 via-transparent to-transparent"/>
      <div className="absolute inset-0 -z-7 bg-background/70"/>
      <div className="absolute inset-0 flex justify-end items-center -z-10 bg-background">
        <video width={1080} height={1080} className={"max-w-full max-h-full h-fit w-fit mix-blend-screen aspect-square object-cover"} autoPlay loop muted playsInline preload={"auto"}>
          <source src="/video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="h-16 aspect-183/99 w-auto sm:h-20 lg:hidden"/>
      <Image
        src="/logo.svg"
        alt="IT.Москва"
        width={183}
        height={99}
        className="h-16 w-auto sm:h-20 hidden lg:inline-block"
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
