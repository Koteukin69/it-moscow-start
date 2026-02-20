"use client";

import Image from "next/image";
import {OrbAnimation} from "@/components/orb";
import type {OrbAnimationProps} from "@/components/orb";

interface CourseCardVisualProps {
  image: string;
  alt: string;
  orbPreset: OrbAnimationProps["preset"];
}

export default function CourseCardVisual({image, alt, orbPreset}: CourseCardVisualProps) {
  return (
    <div className="relative aspect-square overflow-hidden">
      <div className="absolute inset-0 opacity-50">
        <OrbAnimation preset={orbPreset} speed={1.2} saturate={1.4} blurMin={3} blurMax={8}/>
      </div>
      <div className="absolute inset-0 z-10 p-5">
        <div className="relative h-full w-full">
          <Image
            src={image}
            alt={alt}
            fill
            className="object-contain"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      </div>
    </div>
  );
}
