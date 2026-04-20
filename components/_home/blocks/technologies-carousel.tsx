"use client";

import type { Card } from "../components/technologies-types";
import { MobileCarousel } from "../components/mobile-carousel";
import { DesktopCarousel } from "../components/desktop-carousel";
import { DEFAULT_TITLE_TEXT } from "../components/technologies-constants";

type Props = {
  cards: Card[];
  titleText?: string;
};

export function TechnologiesCarousel({ cards, titleText = DEFAULT_TITLE_TEXT }: Props) {
  if (cards.length === 0) return null;

  return (
    <>
      <div className="block md:hidden w-full">
        <MobileCarousel cards={cards} titleText={titleText} />
      </div>
      <div className="hidden md:block w-full">
        <DesktopCarousel cards={cards} titleText={titleText} />
      </div>
    </>
  );
}

export type { Card } from "../components/technologies-types";
