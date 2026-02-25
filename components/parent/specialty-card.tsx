"use client";

import {useState} from "react";
import {X, Users, Target, Lightbulb, Heart, Star, Rocket, BookOpen, Code2, Terminal, Layers, Cpu, Wrench, type LucideIcon} from "lucide-react";

const audienceIcons: LucideIcon[] = [Users, Target, Lightbulb, Heart, Star, Rocket];
const curriculumIcons: LucideIcon[] = [BookOpen, Code2, Terminal, Layers, Cpu, Wrench];
import {Card} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {Dialog, DialogClose, DialogContent, DialogTitle} from "@/components/ui/dialog";
import type {GuideSpecialty} from "@/lib/guide-data";
import type {OrbAnimationProps} from "@/components/orb";
import SpecialtyCardVisual from "@/components/parent/specialty-card-visual";
import styles from "./speciality-card.module.css";

export default function SpecialtyCard({specialty, image, imageAlign = "left", iconNames, orbPreset = "cyan"}: {
  specialty: GuideSpecialty;
  image: string;
  imageAlign?: "left" | "right";
  iconNames: string[];
  orbPreset?: OrbAnimationProps["preset"];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={`${styles.rainbowGradient} w-full`} onClick={() => setOpen(true)}>
        <Card className={`w-full cursor-pointer overflow-hidden ${styles.innerSquare}`}>
          <div className="relative">
            <SpecialtyCardVisual
              image={image}
              imageAlign={imageAlign}
              alt={specialty.title}
              iconNames={iconNames}
              orbPreset={orbPreset}
            />
            <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pb-4 pt-10">
              <Badge variant="outline" className="mb-1.5 border-white/20 font-mono text-xs text-white/70">
                {specialty.code}
              </Badge>
              <p className="text-sm font-semibold leading-snug text-white">{specialty.title}</p>
            </div>
          </div>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0"
        >
          <DialogClose className="absolute right-4 top-4 z-50 rounded-sm bg-black/40 p-1 opacity-80 backdrop-blur-sm transition-opacity hover:opacity-100">
            <X className="size-4 text-white" />
            <span className="sr-only">Закрыть</span>
          </DialogClose>

          <div className="relative shrink-0">
            <SpecialtyCardVisual
              image={image}
              imageAlign={imageAlign}
              alt={specialty.title}
              iconNames={iconNames}
              orbPreset={orbPreset}
            />
            <div className="absolute inset-0 z-30 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 z-40 px-6 pb-5 pt-20">
              <Badge variant="outline" className="mb-2 border-white/25 font-mono text-xs text-white/60">
                {specialty.code}
              </Badge>
              <DialogTitle className="text-xl font-bold leading-snug text-white">
                {specialty.title}
              </DialogTitle>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-5 p-6">
              <div className="flex flex-col gap-1.5">
                <p className="text-sm text-muted-foreground">{specialty.description}</p>
                <p className="text-sm text-muted-foreground">{specialty.relevance}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Для кого</span>
                  <ul className="flex flex-col gap-2">
                    {specialty.targetAudience.map((item, i) => {
                      const Icon = audienceIcons[i % audienceIcons.length];
                      return (
                        <li key={item} className="flex gap-2 text-sm">
                          <Icon className="mt-0.5 size-3.5 shrink-0 text-primary" />
                          {item}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="flex flex-col gap-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Программа</span>
                  <ul className="flex flex-col gap-2">
                    {specialty.curriculum.map((item, i) => {
                      const Icon = curriculumIcons[i % curriculumIcons.length];
                      return (
                        <li key={item} className="flex gap-2 text-sm">
                          <Icon className="mt-0.5 size-3.5 shrink-0 text-primary" />
                          {item}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-2.5 pb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Кем станешь</span>
                <div className="flex flex-wrap gap-2">
                  {specialty.careers.map((career) => (
                    <Badge key={career} variant="secondary" className="px-3 py-1 text-sm">
                      {career}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
