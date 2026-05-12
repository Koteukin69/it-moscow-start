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
}

export default function ShowcasePanel({ image, color, title, description, buttonText, buttonHref }: ShowcasePanelProps) {
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
        className="w-full h-50 sm:h-100 rounded-[40px] relative"
        style={{ backgroundColor: color, zIndex: 0 }}
      >
        {hasContent && (
          <div className="absolute inset-0 flex flex-col justify-between pl-8 sm:pl-12 pr-[45%] sm:pr-[50%] py-6 sm:py-10">
            {description && (
              <p className="text-white/90 font-medium text-xs sm:text-sm md:text-base leading-snug line-clamp-5 sm:line-clamp-none">
                {description}
              </p>
            )}
            {buttonText && buttonHref && (
              <Link
                href={buttonHref}
                className="mt-3 self-start px-5 py-2 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 text-white font-semibold text-sm transition-colors backdrop-blur-sm border border-white/30"
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
