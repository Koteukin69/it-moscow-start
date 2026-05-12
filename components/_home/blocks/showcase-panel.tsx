"use client";

import { ImageData } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface ShowcasePanelProps {
  image?: ImageData;
  color: string;
  title: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
  textLarge?: boolean;
  centeredContent?: boolean;
}

export default function ShowcasePanel({ image, color, title, description, buttonText, buttonHref, textLarge = false, centeredContent = false }: ShowcasePanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [parallaxY, setParallaxY] = useState(0);

  useEffect(() => {
    const STRENGTH = 0.18;

    function onScroll() {
      if (window.innerWidth < 768) { setParallaxY(0); return; }
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const offset = center - window.innerHeight / 2;
      setParallaxY(offset * STRENGTH);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const hasContent = description || (buttonText && buttonHref);

  return (
    <div ref={containerRef} className="w-full relative overflow-hidden">
      {/* Image with parallax — clipped to block, z-index below header (z-50) */}
      {image && (
        <div
          className="absolute right-0 bottom-0 h-[80%] sm:h-full pointer-events-none"
          style={{ transform: `translateY(${parallaxY}px)`, willChange: "transform", zIndex: 1 }}
        >
          <Image
            className="h-full w-auto max-w-none"
            src={image.src}
            alt={image.alt}
            width={832}
            height={447}
          />
        </div>
      )}

      {/* Title */}
      <div
        className="text-[8dvw] sm:text-[5dvw] font-black leading-none -mb-[1.2dvw] sm:-mb-[0.6dvw] pl-10"
        style={{ color }}
      >
        {title}
      </div>

      {/* Card */}
      <div
        className={`w-full rounded-[40px] relative ${hasContent ? "h-64 sm:h-100" : "h-50 sm:h-100"}`}
        style={{ backgroundColor: color, zIndex: 0 }}
      >
        {hasContent && (
          <div className={`absolute inset-0 flex flex-col pl-8 sm:pl-12 pr-[42%] sm:pr-[48%] py-6 sm:py-10 ${centeredContent ? "justify-center gap-6" : "justify-between"}`}>
            {description && (
              <p className={`text-white/90 font-semibold leading-snug ${textLarge ? "text-xl sm:text-2xl md:text-3xl lg:text-4xl" : "text-sm sm:text-base md:text-lg lg:text-xl"}`}>
                {description}
              </p>
            )}
            {buttonText && buttonHref && (
              <Link
                href={buttonHref}
                className="self-start px-10 py-4 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 text-white font-bold text-xl sm:text-2xl transition-colors backdrop-blur-sm border border-white/30"
              >
                {buttonText}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
