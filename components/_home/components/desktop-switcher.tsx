"use client";

import Image from "next/image";
import type { Card } from "./technologies-types";

type Props = {
  cards: Card[];
  activeId: string;
  progress: number;
  onSelect: (id: string) => void;
  onHoverActiveChange: (hovered: boolean) => void;
  card: Card;
};

const INACTIVE_SIZE_PX = 88;
const ACTIVE_SIZE_PX = 108;

export function DesktopSwitcher({
  cards,
  activeId,
  progress,
  onSelect,
  onHoverActiveChange,
  card
}: Props) {
  return (
    <div
      style={{ "--card-color": card.color } as React.CSSProperties}
      className="h-[40dvh] flex w-full items-center justify-center gap-4 bg-linear-to-b from-(--card-color) to-transparent"
    >
      {cards.map((card) => {
        const isActive = card.id === activeId;
        const size = isActive ? ACTIVE_SIZE_PX : INACTIVE_SIZE_PX;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelect(card.id)}
            onMouseEnter={isActive ? () => onHoverActiveChange(true) : undefined}
            onMouseLeave={isActive ? () => onHoverActiveChange(false) : undefined}
            className="group flex flex-col items-center gap-3 outline-none"
            aria-pressed={isActive}
            style={{ width: `${ACTIVE_SIZE_PX}px` }}
          >
            <div
              className="relative flex items-center justify-center overflow-hidden rounded-[22px] transition-all duration-300 ease-out"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: card.color,
                boxShadow: isActive ? "0 12px 32px rgba(0,0,0,0.25)" : "none",
                opacity: isActive ? 1 : 0.75,
              }}
            >
              <div className="absolute inset-2">
                <Image
                  src={card.image.src}
                  alt={card.image.alt}
                  fill
                  sizes={`${ACTIVE_SIZE_PX}px`}
                  className="object-contain"
                  draggable={false}
                />
              </div>

              {isActive ? (
                <div className="pointer-events-none absolute inset-x-2 bottom-2 h-[3px] overflow-hidden rounded-full bg-white/25">
                  <div
                    className="h-full bg-white"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              ) : null}
            </div>

            <span
              className="text-center text-[11px] font-black uppercase leading-[1.15] tracking-wide transition-opacity duration-300"
              style={{ opacity: isActive ? 1 : .5 }}
            >
              {card.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
