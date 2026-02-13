"use client";

import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface OrbBlob {
  ox: number;
  oy: number;
  radius: number;
  color: [number, number, number];
  alpha?: number;
  blur?: number;
}

export type OrbScaleMode = "min" | "max" | "width" | "height";

export interface OrbAnimationProps {
  resolution?: number;
  speed?: number;
  blurMin?: number;
  blurMax?: number;
  saturate?: number;
  blobs?: OrbBlob[];
  preset?: "cyan" | "sunset" | "aurora" | "neon";
  className?: string;
  paused?: boolean;
  scaleMode?: OrbScaleMode;
}

// ─── Presets ─────────────────────────────────────────────────────────────────

const PRESETS: Record<string, OrbBlob[]> = {
  cyan: [
    { ox: 0, oy: 0, radius: 0.3, color: [0, 245, 255], alpha: 0.95 },
    { ox: 0, oy: 0.02, radius: 0.18, color: [180, 255, 255], alpha: 0.8 },
    { ox: 0.15, oy: -0.07, radius: 0.28, color: [30, 50, 255], alpha: 0.85 },
    { ox: 0.1, oy: -0.17, radius: 0.25, color: [20, 80, 255], alpha: 0.7 },
    { ox: 0.13, oy: 0.13, radius: 0.2, color: [140, 20, 255], alpha: 0.65 },
    { ox: -0.18, oy: -0.03, radius: 0.22, color: [0, 220, 180], alpha: 0.6 },
    { ox: -0.13, oy: 0.1, radius: 0.19, color: [0, 200, 220], alpha: 0.5 },
  ],
  sunset: [
    { ox: 0, oy: 0, radius: 0.3, color: [255, 160, 50], alpha: 0.95 },
    { ox: 0, oy: 0.02, radius: 0.18, color: [255, 240, 180], alpha: 0.8 },
    { ox: 0.15, oy: -0.07, radius: 0.28, color: [255, 60, 80], alpha: 0.85 },
    { ox: 0.1, oy: -0.17, radius: 0.25, color: [255, 100, 0], alpha: 0.7 },
    { ox: 0.13, oy: 0.13, radius: 0.2, color: [200, 30, 100], alpha: 0.65 },
    { ox: -0.18, oy: -0.03, radius: 0.22, color: [255, 200, 0], alpha: 0.6 },
    { ox: -0.13, oy: 0.1, radius: 0.19, color: [255, 80, 50], alpha: 0.5 },
  ],
  aurora: [
    { ox: 0, oy: 0, radius: 0.3, color: [0, 255, 140], alpha: 0.9 },
    { ox: 0, oy: 0.02, radius: 0.18, color: [180, 255, 220], alpha: 0.75 },
    { ox: 0.15, oy: -0.07, radius: 0.28, color: [0, 180, 255], alpha: 0.85 },
    { ox: 0.1, oy: -0.17, radius: 0.25, color: [100, 0, 255], alpha: 0.7 },
    { ox: 0.13, oy: 0.13, radius: 0.2, color: [0, 255, 220], alpha: 0.65 },
    { ox: -0.18, oy: -0.03, radius: 0.22, color: [50, 200, 100], alpha: 0.6 },
    { ox: -0.13, oy: 0.1, radius: 0.19, color: [0, 120, 255], alpha: 0.5 },
  ],
  neon: [
    { ox: 0, oy: 0, radius: 0.3, color: [255, 0, 200], alpha: 0.95 },
    { ox: 0, oy: 0.02, radius: 0.18, color: [255, 200, 255], alpha: 0.8 },
    { ox: 0.15, oy: -0.07, radius: 0.28, color: [0, 255, 200], alpha: 0.85 },
    { ox: 0.1, oy: -0.17, radius: 0.25, color: [0, 100, 255], alpha: 0.7 },
    { ox: 0.13, oy: 0.13, radius: 0.2, color: [255, 255, 0], alpha: 0.65 },
    { ox: -0.18, oy: -0.03, radius: 0.22, color: [255, 0, 100], alpha: 0.6 },
    { ox: -0.13, oy: 0.1, radius: 0.19, color: [0, 255, 100], alpha: 0.5 },
  ],
};

// ─── Internal ────────────────────────────────────────────────────────────────

interface BlobState {
  ox: number;
  oy: number;
  radius: number;
  color: [number, number, number];
  targetColor: [number, number, number];
  alpha: number;
  targetAlpha: number;
  blur: number;
  orbitR: number;
  speed: number;
  phase: number;
}

function getScale(W: number, H: number, mode: OrbScaleMode): number {
  switch (mode) {
    case "max": return Math.max(W, H);
    case "width": return W;
    case "height": return H;
    default: return Math.min(W, H);
  }
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpColor(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [
    Math.round(lerp(a[0], b[0], t)),
    Math.round(lerp(a[1], b[1], t)),
    Math.round(lerp(a[2], b[2], t)),
  ];
}

// ─── Component ───────────────────────────────────────────────────────────────

export function OrbAnimation({
                               resolution = 1,
                               speed = 1,
                               blurMin = 1,
                               blurMax = 6,
                               saturate = 1.4,
                               blobs: customBlobs,
                               preset = "cyan",
                               className,
                               paused = false,
                               scaleMode = "min",
                             }: OrbAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef<{
    blobs: BlobState[];
    layers: HTMLCanvasElement[];
    W: number;
    H: number;
    t: number;
  } | null>(null);

  const propsRef = useRef({ speed, paused, saturate, blurMin, blurMax });
  propsRef.current = { speed, paused, saturate, blurMin, blurMax };

  const blobDefs = customBlobs && customBlobs.length > 0
    ? customBlobs
    : PRESETS[preset] ?? PRESETS.cyan;

  // Sync colors without restarting animation
  useEffect(() => {
    if (!stateRef.current) return;
    const s = stateRef.current;
    const short = getScale(s.W, s.H, scaleMode);
    s.blobs.forEach((b, i) => {
      const def = blobDefs[i % blobDefs.length];
      b.targetColor = [...def.color];
      b.targetAlpha = def.alpha ?? 0.8;
      b.ox = def.ox * short;
      b.oy = def.oy * short;
      b.radius = def.radius * short;
    });
  }, [blobDefs]);

  // Main loop — runs once
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // alpha: true for transparent background
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const W = Math.round(rect.width * resolution);
      const H = Math.round(rect.height * resolution);
      canvas.width = W;
      canvas.height = H;
      return { W, H };
    };

    let { W, H } = resize();
    const short = getScale(W, H, scaleMode);
    const { blurMin: bMin, blurMax: bMax } = propsRef.current;

    const blobStates: BlobState[] = blobDefs.map((def) => ({
      ox: def.ox * short,
      oy: def.oy * short,
      radius: def.radius * short,
      color: [...def.color],
      targetColor: [...def.color],
      alpha: def.alpha ?? 0.8,
      targetAlpha: def.alpha ?? 0.8,
      blur: def.blur ?? bMin + Math.random() * (bMax - bMin),
      orbitR: 8 + Math.random() * 12,
      speed: 0.006 + Math.random() * 0.008,
      phase: Math.random() * Math.PI * 2,
    }));

    const layers = blobStates.map(() => {
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      return c;
    });

    stateRef.current = { blobs: blobStates, layers, W, H, t: 0 };

    const draw = () => {
      const s = stateRef.current!;
      const p = propsRef.current;

      if (!p.paused) s.t += p.speed;

      const cx = s.W / 2;
      const cy = s.H / 2;

      // Clear to fully transparent
      ctx.clearRect(0, 0, s.W, s.H);

      for (let i = 0; i < s.blobs.length; i++) {
        const b = s.blobs[i];
        const layer = s.layers[i];
        if (!layer) continue;

        b.color = lerpColor(b.color, b.targetColor, 0.04);
        b.alpha = lerp(b.alpha, b.targetAlpha, 0.04);

        const lCtx = layer.getContext("2d")!;
        lCtx.clearRect(0, 0, s.W, s.H);

        const wobbleX = Math.sin(s.t * b.speed * 2 + b.phase) * b.orbitR;
        const wobbleY = Math.cos(s.t * b.speed * 1.6 + b.phase + 1) * b.orbitR;
        const pulse = b.radius + Math.sin(s.t * 0.024 + b.phase) * (b.radius * 0.06);

        const x = cx + b.ox + wobbleX;
        const y = cy + b.oy + wobbleY;

        const [cr, cg, cb] = b.color;
        const g = lCtx.createRadialGradient(x, y, 0, x, y, pulse);
        g.addColorStop(0, `rgba(${cr},${cg},${cb},${b.alpha})`);
        g.addColorStop(0.3, `rgba(${cr},${cg},${cb},${b.alpha * 0.6})`);
        g.addColorStop(0.6, `rgba(${cr},${cg},${cb},${b.alpha * 0.2})`);
        g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);

        lCtx.fillStyle = g;
        lCtx.beginPath();
        lCtx.arc(x, y, pulse, 0, Math.PI * 2);
        lCtx.fill();

        const dynBlur = b.blur + Math.sin(s.t * 0.01 + b.phase);
        ctx.globalCompositeOperation = "screen";
        ctx.filter = `blur(${dynBlur}px)`;
        ctx.drawImage(layer, 0, 0);
        ctx.filter = "none";
      }

      ctx.globalCompositeOperation = "source-over";
      animRef.current = requestAnimationFrame(draw);
    };

    const observer = new ResizeObserver(() => {
      ({ W, H } = resize());
      const s = stateRef.current!;
      s.W = W;
      s.H = H;
      s.layers.forEach((c) => {
        c.width = W;
        c.height = H;
      });
      const newShort = getScale(W, H, scaleMode);
      const defs = customBlobs && customBlobs.length > 0
        ? customBlobs
        : PRESETS[preset] ?? PRESETS.cyan;
      s.blobs.forEach((b, i) => {
        const def = defs[i % defs.length];
        b.ox = def.ox * newShort;
        b.oy = def.oy * newShort;
        b.radius = def.radius * newShort;
      });
    });
    observer.observe(container);

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      observer.disconnect();
      stateRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolution]);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden w-full h-full", className)}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ filter: `saturate(${saturate})` }}
      />
    </div>
  );
}

export default OrbAnimation;