"use client";

import { useEffect, useState } from "react";
import Title from "@/components/_home/components/title";
import Image from "next/image"

const ITEM_WIDTH = 128;
const GAP = 64;
const MIN_VIEWPORT_MULTIPLIER = 2;

const partners = [
  {name: "1С", logo: "/partners/1c.png"},
  {name: "Yandex", logo: "/partners/yandex.svg"},
  {name: "VK", logo: "/partners/vk.svg"},
  {name: "VTB", logo: "/partners/vtb.svg"},
  {name: "Kaspersky", logo: "/partners/kaspersky.svg"},
  {name: "MTC", logo: "/partners/mtc.svg"},
  {name: "Ozon", logo: "/partners/ozon.svg"},
  {name: "Sberbank", logo: "/partners/sberbank.png"},
];

export default function Partners() {
  const [copies, setCopies] = useState(2);

  useEffect(() => {
    const calculateCopies = () => {
      const singleCopyWidth = partners.length * ITEM_WIDTH + (partners.length - 1) * GAP;
      const requiredWidth = window.innerWidth * MIN_VIEWPORT_MULTIPLIER;
      const needed = Math.max(2, Math.ceil(requiredWidth / singleCopyWidth));
      setCopies(needed);
    };

    calculateCopies();
    window.addEventListener("resize", calculateCopies);
    return () => window.removeEventListener("resize", calculateCopies);
  }, []);

  const duplicated = Array.from({ length: copies }, () => partners).flat();

  return (<>
    <Title
      title={"Партнёры — работодатели"}
      description={"Наши выпускники проходят стажировки и получают офферы от ведущих IT-компаний страны"}
    />
    <div className="w-full">
      <div
        className="flex flex-row w-max animate-marquee"
        style={{ "--copies": copies, gap: `${GAP}px` } as React.CSSProperties}
      >
        {duplicated.map((partner, i) => (
          <div
            style={{width: `${ITEM_WIDTH}px`}}
            className="aspect-square relative shrink-0 [@media(hover:hover)]:opacity-70 transition-all hover:opacity-100 hover:grayscale-0"
            key={i}
          >
            <Image src={partner.logo} alt={partner.name} fill />
          </div>
        ))}
      </div>
    </div>
  </>);
}