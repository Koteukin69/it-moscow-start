import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import CourseCardVisual from "@/components/parent/course-card-visual";
import {MapPin, Clock, CalendarDays, GraduationCap, Gamepad2, Network, Palette, Globe, Code, Camera, Coins} from "lucide-react";
import type {LucideIcon} from "lucide-react";
import type {OrbAnimationProps} from "@/components/orb";
import Link from "next/link";

interface CourseEntry {
  id: string;
  title: string;
  venue: string;
  schedule: string;
  time: string;
  age: string;
  price: number;
  icon: LucideIcon;
  image: string;
  orb: OrbAnimationProps["preset"];
}

const displayCourses: CourseEntry[] = [
  {
    id: "gamestart",
    title: "Геймстарт",
    venue: "Центр программирования и кибербезопасности",
    schedule: "среда, пятница",
    time: "17:00–17:45",
    age: "12–18 лет",
    price: 150,
    icon: Gamepad2,
    image: "/courses/GameStart.png",
    orb: "neon",
  },
  {
    id: "networks",
    title: "Мастерская технологий: сети и системы изнутри",
    venue: "Центр городских технологий",
    schedule: "вторник, среда",
    time: "17:00–17:45",
    age: "12–18 лет",
    price: 120,
    icon: Network,
    image: "/courses/System.png",
    orb: "cyan",
  },
  {
    id: "design",
    title: "Лаборатория дизайна: основы визуального мышления",
    venue: "Дизайн колледж / IT Бирюлево",
    schedule: "понедельник, вторник",
    time: "16:20–17:05",
    age: "12–18 лет",
    price: 100,
    icon: Palette,
    image: "/courses/Visual_Thinking.png",
    orb: "sunset",
  },
  {
    id: "web",
    title: "Веб-разработка: с нуля до сайта",
    venue: "Центр программирования и кибербезопасности",
    schedule: "понедельник, среда",
    time: "17:00–17:45",
    age: "12–18 лет",
    price: 130,
    icon: Globe,
    image: "/courses/Web.png",
    orb: "cyan",
  },
  {
    id: "python",
    title: "Код будущего: программирование на Python",
    venue: "Центр программирования и кибербезопасности",
    schedule: "вторник, четверг",
    time: "17:30–18:15",
    age: "9–11 лет",
    price: 140,
    icon: Code,
    image: "/courses/Python.png",
    orb: "aurora",
  },
  {
    id: "photo",
    title: "Искусство кадра",
    venue: "Дизайн колледж",
    schedule: "понедельник, среда",
    time: "17:00–17:45",
    age: "12–18 лет",
    price: 110,
    icon: Camera,
    image: "/courses/Composition.png",
    orb: "sunset",
  },
];

export default function ParentCourses() {
  return (
    <section id="courses" className="mx-auto max-w-6xl px-10 py-20 sm:px-20">
      <div className="mb-12 flex flex-col gap-3 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Курсы Digital Art Academy
        </h2>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Бесплатные кружки для школьников — попробуй IT до поступления
          и заработай свои первые it.coin
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {displayCourses.map((course) => {
          const Icon = course.icon;
          return (
            <Card key={course.id} className="flex flex-col overflow-hidden">
              <CourseCardVisual image={course.image} alt={course.title} orbPreset={course.orb}/>
              <CardContent className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4.5"/>
                  </div>
                  <h3 className="text-base font-bold leading-tight">
                    {course.title}
                  </h3>
                </div>

                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-3.5 shrink-0"/>
                    <span>{course.venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="size-3.5 shrink-0"/>
                    <span>{course.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="size-3.5 shrink-0"/>
                    <span>{course.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="size-3.5 shrink-0"/>
                    <span>{course.age}</span>
                  </div>
                </div>

                <div className="mt-auto flex items-center gap-1.5 pt-2 text-sm font-semibold text-blue-400">
                  <Coins className="size-4"/>
                  {course.price} it.coin
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Button variant="outline" size="lg" asChild>
          <Link href="/courses">Все курсы</Link>
        </Button>
      </div>
    </section>
  );
}
