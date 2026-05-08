"use client";

import { useEffect, useMemo, useRef } from "react";
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
  presetTransitionMs?: number;
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
  fromOx: number;
  targetOx: number;
  oy: number;
  fromOy: number;
  targetOy: number;
  radius: number;
  fromRadius: number;
  targetRadius: number;
  color: [number, number, number];
  fromColor: [number, number, number];
  targetColor: [number, number, number];
  alpha: number;
  fromAlpha: number;
  targetAlpha: number;
  blur: number;
  fromBlur: number;
  targetBlur: number;
  transitionStart: number;
  transitionDuration: number;
  orbitR: number;
  speed: number;
  phase: number;
}

function getScale(W: number, H: number, mode: OrbScaleMode): number {
  switch (mode) {
    case "max":
      return Math.max(W, H);
    case "width":
      return W;
    case "height":
      return H;
    default:
      return Math.min(W, H);
  }
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpColor(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

function copyColor(color: [number, number, number]): [number, number, number] {
  return [color[0], color[1], color[2]];
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function isBlobSettled(b: BlobState, now: number) {
  return now - b.transitionStart >= b.transitionDuration;
}

function createBlobState(
  def: OrbBlob,
  short: number,
  blurMin: number,
  blurMax: number,
  transitionMs: number,
  from?: BlobState,
  now = performance.now(),
): BlobState {
  const ox = def.ox * short;
  const oy = def.oy * short;
  const radius = def.radius * short;
  const color = copyColor(def.color);
  const alpha = def.alpha ?? 0.8;
  const blur = def.blur ?? from?.targetBlur ?? blurMin + Math.random() * (blurMax - blurMin);
  const duration = Math.max(0, transitionMs);

  return {
    ox: from?.ox ?? ox,
    fromOx: from?.ox ?? ox,
    targetOx: ox,
    oy: from?.oy ?? oy,
    fromOy: from?.oy ?? oy,
    targetOy: oy,
    radius: from?.radius ?? radius,
    fromRadius: from?.radius ?? radius,
    targetRadius: radius,
    color: from ? copyColor(from.color) : color,
    fromColor: from ? copyColor(from.color) : color,
    targetColor: color,
    alpha: from?.alpha ?? alpha,
    fromAlpha: from?.alpha ?? alpha,
    targetAlpha: alpha,
    blur: from?.blur ?? blur,
    fromBlur: from?.blur ?? blur,
    targetBlur: blur,
    transitionStart: from ? now : now - duration,
    transitionDuration: duration,
    orbitR: from?.orbitR ?? 8 + Math.random() * 12,
    speed: from?.speed ?? 0.006 + Math.random() * 0.008,
    phase: from?.phase ?? Math.random() * Math.PI * 2,
  };
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
  presetTransitionMs = 700,
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

  const propsRef = useRef({
    speed,
    paused,
    saturate,
    blurMin,
    blurMax,
    presetTransitionMs,
    scaleMode,
  });
  propsRef.current = {
    speed,
    paused,
    saturate,
    blurMin,
    blurMax,
    presetTransitionMs,
    scaleMode,
  };

  const drawFnRef = useRef<(() => void) | null>(null);

  const blobDefs = useMemo(
    () =>
      customBlobs && customBlobs.length > 0
        ? customBlobs
        : (PRESETS[preset] ?? PRESETS.cyan),
    [customBlobs, preset],
  );

  const blobDefsRef = useRef(blobDefs);
  blobDefsRef.current = blobDefs;

  // Sync targets without restarting animation
  useEffect(() => {
    const s = stateRef.current;
    if (!s) return;

    const p = propsRef.current;
    const short = getScale(s.W, s.H, p.scaleMode);
    const now = performance.now();

    s.blobs = blobDefs.map((def, i) => {
      const prev = s.blobs[i];
      return createBlobState(
        def,
        short,
        p.blurMin,
        p.blurMax,
        p.presetTransitionMs,
        prev,
        now,
      );
    });

    while (s.layers.length < s.blobs.length) {
      const c = document.createElement("canvas");
      c.width = s.W;
      c.height = s.H;
      s.layers.push(c);
    }

    s.layers.length = s.blobs.length;

    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(() => drawFnRef.current?.());
  }, [blobDefs, scaleMode]);

  // Restart RAF loop when unpaused
  useEffect(() => {
    if (!paused && drawFnRef.current && stateRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = requestAnimationFrame(drawFnRef.current);
    }
  }, [paused]);

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
    const p0 = propsRef.current;
    const short = getScale(W, H, p0.scaleMode);
    const now = performance.now();

    const blobStates: BlobState[] = blobDefs.map((def) =>
      createBlobState(
        def,
        short,
        p0.blurMin,
        p0.blurMax,
        p0.presetTransitionMs,
        undefined,
        now,
      ),
    );

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

      if (s.W === 0 || s.H === 0) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      if (!p.paused) s.t += p.speed;

      const now = performance.now();

      const cx = s.W / 2;
      const cy = s.H / 2;

      // Clear to fully transparent
      ctx.clearRect(0, 0, s.W, s.H);

      for (let i = 0; i < s.blobs.length; i++) {
        const b = s.blobs[i];
        const layer = s.layers[i];
        if (!layer || layer.width === 0 || layer.height === 0) continue;

        const progress = b.transitionDuration <= 0
          ? 1
          : Math.min(1, (now - b.transitionStart) / b.transitionDuration);
        const transition = easeOutCubic(progress);

        b.color = lerpColor(b.fromColor, b.targetColor, transition);
        b.alpha = lerp(b.fromAlpha, b.targetAlpha, transition);
        b.ox = lerp(b.fromOx, b.targetOx, transition);
        b.oy = lerp(b.fromOy, b.targetOy, transition);
        b.radius = lerp(b.fromRadius, b.targetRadius, transition);
        b.blur = lerp(b.fromBlur, b.targetBlur, transition);

        if (progress >= 1) {
          b.color = copyColor(b.targetColor);
          b.fromColor = copyColor(b.targetColor);
          b.alpha = b.fromAlpha = b.targetAlpha;
          b.ox = b.fromOx = b.targetOx;
          b.oy = b.fromOy = b.targetOy;
          b.radius = b.fromRadius = b.targetRadius;
          b.blur = b.fromBlur = b.targetBlur;
        }

        const lCtx = layer.getContext("2d")!;
        lCtx.clearRect(0, 0, s.W, s.H);

        const wobbleX = Math.sin(s.t * b.speed * 2 + b.phase) * b.orbitR;
        const wobbleY = Math.cos(s.t * b.speed * 1.6 + b.phase + 1) * b.orbitR;
        const pulse =
          b.radius + Math.sin(s.t * 0.024 + b.phase) * (b.radius * 0.06);

        const x = cx + b.ox + wobbleX;
        const y = cy + b.oy + wobbleY;

        const [cr, cg, cb] = b.color.map(Math.round);
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

      const isTransitioning = s.blobs.some((b) => !isBlobSettled(b, now));

      if (!p.paused || isTransitioning) {
        animRef.current = requestAnimationFrame(draw);
      }
    };

    drawFnRef.current = draw;

    const observer = new ResizeObserver(() => {
      ({ W, H } = resize());
      const s = stateRef.current!;
      s.W = W;
      s.H = H;
      s.layers.forEach((c) => {
        c.width = W;
        c.height = H;
      });
      const p = propsRef.current;
      const newShort = getScale(W, H, p.scaleMode);
      const now = performance.now();
      s.blobs = blobDefsRef.current.map((def, i) =>
        createBlobState(
          def,
          newShort,
          p.blurMin,
          p.blurMax,
          p.presetTransitionMs,
          s.blobs[i],
          now,
        ),
      );
      if (propsRef.current.paused) {
        cancelAnimationFrame(animRef.current);
        animRef.current = requestAnimationFrame(draw);
      }
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
        className="absolute inset-0 w-full h-full transition-[filter] duration-700 ease-out"
        style={{ filter: `saturate(${saturate})` }}
      />
    </div>
  );
}

export default OrbAnimation;
