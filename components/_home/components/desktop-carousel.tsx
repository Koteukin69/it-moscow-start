"use client";

import { useCallback, useState } from "react";
import type { Card } from "./technologies-types";
import { DesktopCard } from "./desktop-card";
import { DesktopSwitcher } from "./desktop-switcher";
import { useAutoSwitchProgress } from "./use-auto-switch-progress";
import { AUTO_SWITCH_DURATION_MS } from "./technologies-constants";

type Props = {
  cards: Card[];
  titleText: string;
};

export function DesktopCarousel({ cards, titleText }: Props) {
  const [activeId, setActiveId] = useState<string>(cards[0].id);
  const [hoveringActive, setHoveringActive] = useState<boolean>(false);

  const goNext = useCallback((): void => {
    setActiveId((currentId) => {
      const currentIndex = cards.findIndex((card) => card.id === currentId);
      const nextIndex = (currentIndex + 1) % cards.length;
      return cards[nextIndex].id;
    });
  }, [cards]);

  const progress = useAutoSwitchProgress({
    durationMs: AUTO_SWITCH_DURATION_MS,
    paused: hoveringActive,
    resetKey: activeId,
    onComplete: goNext,
  });

  const handleSelect = useCallback((id: string): void => {
    setActiveId(id);
    setHoveringActive(false);
  }, []);

  const activeCard = cards.find((card) => card.id === activeId) ?? cards[0];

  return (
    <div className="flex w-full flex-col items-center">
      <DesktopCard key={activeCard.id} card={activeCard} titleText={titleText} />
      <DesktopSwitcher
        cards={cards}
        activeId={activeId}
        progress={progress}
        onSelect={handleSelect}
        onHoverActiveChange={setHoveringActive}
        card={activeCard}
      />
    </div>
  );
}
