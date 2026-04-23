"use client";

import { useEffect, useRef, useState } from "react";
import Title from "@/components/_home/components/title";
import Image from "next/image";

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
  const itemRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState(2);

  useEffect(() => {
    const update = () => {
      const item = itemRef.current;
      const track = trackRef.current;
      if (!item || !track) {
        return;
      }

      const itemWidth = item.offsetWidth;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const singleCopyWidth = partners.length * itemWidth + (partners.length - 1) * gap;

      const requiredWidth = window.innerWidth * 2;
      const needed = Math.max(
        2,
        Math.ceil(requiredWidth / singleCopyWidth)
      );

      setCopies(needed);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const duplicated = Array.from({ length: copies }, () => partners).flat();

  return (
    <>
      <Title
        title="Партнёры — работодатели"
        description="Наши выпускники проходят стажировки и получают офферы от ведущих IT-компаний страны"
      />
      <div className="w-full">
        <div
          ref={trackRef}
          className="flex flex-row gap-8 sm:gap-12 lg:gap-16 w-max animate-marquee"
          style={{ "--copies": copies } as React.CSSProperties}
        >
          {duplicated.map((partner, i) => (
            <div
              ref={i === 0 ? itemRef : undefined}
              className="w-24 sm:w-28 lg:w-32 aspect-square relative shrink-0 [@media(hover:hover)]:opacity-70 transition-all hover:opacity-100 hover:grayscale-0"
              key={i}
            >
              <Image src={partner.logo} alt={partner.name} fill />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}