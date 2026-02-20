"use client";

import Image from "next/image";
import {OrbAnimation} from "@/components/orb";
import type {OrbAnimationProps} from "@/components/orb";
import {
  Code, Globe, LayoutTemplate, Monitor,
  Shield, Lock, Eye, KeyRound,
  Gamepad2, Swords, MonitorPlay, Box,
  Cpu, HardDrive, Server, MemoryStick,
  Network, Wifi, Cloud, Router,
  Brain, Zap, Cog, Bot,
  Palette, PenTool, Figma, Brush,
  TramFront, Building2, Settings, Gauge,
} from "lucide-react";
import type {LucideIcon} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Code, Globe, LayoutTemplate, Monitor,
  Shield, Lock, Eye, KeyRound,
  Gamepad2, Swords, MonitorPlay, Box,
  Cpu, HardDrive, Server, MemoryStick,
  Network, Wifi, Cloud, Router,
  Brain, Zap, Cog, Bot,
  Palette, PenTool, Figma, Brush,
  TramFront, Building2, Settings, Gauge,
};

const iconPositions = [
  {top: 8, left: 6, size: 36, rotate: -12},
  {top: 18, left: 38, size: 28, rotate: 20},
  {top: 55, left: 12, size: 42, rotate: -8},
  {top: 68, left: 42, size: 30, rotate: 15},
  {top: 35, left: 24, size: 34, rotate: -20},
  {top: 10, left: 58, size: 26, rotate: 10},
  {top: 78, left: 28, size: 32, rotate: -5},
  {top: 45, left: 52, size: 38, rotate: 25},
];

const iconPositionsRight = [
  {top: 8, right: 6, size: 36, rotate: 12},
  {top: 18, right: 38, size: 28, rotate: -20},
  {top: 55, right: 12, size: 42, rotate: 8},
  {top: 68, right: 42, size: 30, rotate: -15},
  {top: 35, right: 24, size: 34, rotate: 20},
  {top: 10, right: 58, size: 26, rotate: -10},
  {top: 78, right: 28, size: 32, rotate: 5},
  {top: 45, right: 52, size: 38, rotate: -25},
];

function buildDashPath(count: number, align: "left" | "right") {
  const pts = (align === "right" ? iconPositions : iconPositionsRight).slice(0, count).map((pos) => {
    const x = "left" in pos ? pos.left + 4 : 100 - pos.right - 4;
    const y = pos.top + 4;
    return {x, y};
  });

  if (pts.length < 2) return "";

  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cpx1 = prev.x + (curr.x - prev.x) * 0.5;
    const cpy1 = prev.y;
    const cpx2 = prev.x + (curr.x - prev.x) * 0.5;
    const cpy2 = curr.y;
    d += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${curr.x} ${curr.y}`;
  }
  return d;
}

interface SpecialtyCardVisualProps {
  image: string;
  imageAlign: "left" | "right";
  alt: string;
  iconNames: string[];
  orbPreset: OrbAnimationProps["preset"];
}

export default function SpecialtyCardVisual({image, imageAlign, alt, iconNames, orbPreset}: SpecialtyCardVisualProps) {
  const positions = imageAlign === "right" ? iconPositions : iconPositionsRight;
  const dashPath = buildDashPath(iconNames.length, imageAlign);

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-muted">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 z-[1] h-full w-full"
      >
        <path
          d={dashPath}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeDasharray="6 4"
          opacity={0.35}
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {iconNames.map((name, i) => {
        const Icon = iconMap[name];
        if (!Icon) return null;
        const pos = positions[i % positions.length];
        return (
          <Icon
            key={name}
            size={pos.size}
            strokeWidth={1.2}
            className="absolute z-[2] opacity-20"
            style={{
              top: `${pos.top}%`,
              left: "left" in pos ? `${pos.left}%` : undefined,
              right: "right" in pos ? `${pos.right}%` : undefined,
              transform: `rotate(${pos.rotate}deg)`,
            }}
          />
        );
      })}

      <div
        className="absolute z-10 h-[200%] w-[200%] opacity-60"
        style={{
          top: "-50%",
          [imageAlign === "right" ? "right" : "left"]: "-100%",
        }}
      >
        <OrbAnimation preset={orbPreset} speed={1.2} saturate={1.6} blurMin={2} blurMax={6}/>
      </div>

      <Image
        src={image}
        alt={alt}
        fill
        className={`relative z-20 object-contain ${imageAlign === "right" ? "object-right-bottom" : "object-left-bottom"}`}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    </div>
  );
}
