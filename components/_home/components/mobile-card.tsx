"use client";

import Image from "next/image";
import { Plus, X } from "lucide-react";
import { useState, useLayoutEffect, useRef } from "react";
import type { Card } from "./technologies-types";
import { TitleBackdrop } from "./title-backdrop";

type Props = {
  card: Card;
  titleText: string;
};

export function MobileCard({ card, titleText }: Props) {
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleToggle = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  };

  const objectPosition = card.imagePosition?.objectPosition ?? "center";
  const scale = card.imagePosition?.scale ?? 1;

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-[36px]"
      style={{ backgroundColor: card.color }}
    >
      <TitleBackdrop text={titleText} variant="mobile" />

      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div className="relative h-full w-full" style={{ transform: `scale(${scale})` }}>
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

      <div className="z-1 absolute inset-x-0 bottom-0 rounded-t-[32px] bg-white px-6 pb-8 pt-7 text-black">
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={handleToggle}
          aria-label={expanded ? "Свернуть описание" : "Развернуть описание"}
          aria-expanded={expanded}
          className="z-2 absolute -top-7 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-transform active:scale-95"
        >
          {expanded ? <X size={26} strokeWidth={2.5} /> : <Plus size={26} strokeWidth={2.5} />}
        </button>

        <h3 className="pr-16 text-[28px] font-black uppercase leading-[0.95] tracking-tight">
          {card.name}
        </h3>

        <Description text={card.description} expanded={expanded} />
      </div>
    </div>
  );
}

const COLLAPSED_HEIGHT = "1rem";

export function Description({
                              text,
                              expanded,
                            }: {
  text: string;
  expanded: boolean;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [fullHeight, setFullHeight] = useState<number>(0);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const updateHeight = () => {
      setFullHeight(Math.ceil(el.getBoundingClientRect().height));
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(el);

    document.fonts?.ready.then(updateHeight);

    return () => {
      resizeObserver.disconnect();
    };
  }, [text]);

  return (
    <div
      className="relative overflow-hidden transition-[height] duration-300 ease-out"
      style={{
        height: expanded
          ? fullHeight > 0
            ? `${fullHeight}px`
            : "auto"
          : COLLAPSED_HEIGHT,
      }}
    >
      <div ref={contentRef}>
        <p className="pt-4 text-[15px] font-medium leading-[1.35] text-neutral-800">
          {text}
        </p>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/85 to-transparent"
        style={{
          opacity: expanded ? 0 : 1,
          transition: "opacity 140ms linear",
        }}
      />
    </div>
  );
}