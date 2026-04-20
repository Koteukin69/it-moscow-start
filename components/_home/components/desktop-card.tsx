"use client";

import Image from "next/image";
import { X, Plus } from "lucide-react";
import { useState } from "react";
import type { Card } from "./technologies-types";
import { TitleBackdrop } from "./title-backdrop";

type Props = {
  card: Card;
  titleText: string;
};

export function DesktopCard({ card, titleText }: Props) {
  const [expanded, setExpanded] = useState<boolean>(true);

  const toggle = (): void => setExpanded((prev) => !prev);

  const objectPosition = card.imagePosition?.objectPosition ?? "bottom right";
  const scale = card.imagePosition?.scale ?? 1;

  return (
    <div
      className="relative h-[50dvh] w-full overflow-hidden rounded-t-[40px]"
      style={{ backgroundColor: card.color }}
    >
      <TitleBackdrop text={titleText} variant="desktop" />

      <div className="absolute inset-0 flex items-center justify-end pr-[3%]">
        <div
          className="absolute -inset-20 mr-20"
          style={{ transform: `scale(${scale})`, transformOrigin: "center right" }}
        >
          <Image
            src={card.image.src}
            alt={card.image.alt}
            fill
            className="object-contain"
            style={{ objectPosition }}
            draggable={false}
            priority
          />
        </div>
      </div>

      <div className="absolute left-10 top-1/2 flex -translate-y-1/2 items-start gap-3">
        <div
          className="grid overflow-hidden rounded-[28px] bg-white text-black shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-[grid-template-columns] duration-400 ease-out"
          style={{
            gridTemplateColumns: expanded ? "1fr" : "0fr",
          }}
        >
          <div className="overflow-hidden">
            <div className="w-[340px] p-7">
              <h3 className="text-[26px] font-black uppercase leading-[0.95] tracking-tight">
                {card.name}
              </h3>
              <p className="mt-4 text-[14px] font-medium leading-[1.4] text-neutral-800">
                {card.description}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={toggle}
          aria-label={expanded ? "Свернуть описание" : "Развернуть описание"}
          aria-expanded={expanded}
          className="mt-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-black shadow-[0_6px_20px_rgba(0,0,0,0.15)] transition-transform active:scale-95"
        >
          {expanded ? <X size={20} strokeWidth={2.5} /> : <Plus size={20} strokeWidth={2.5} />}
        </button>
      </div>
    </div>
  );
}
