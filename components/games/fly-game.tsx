"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

const GRAVITY = 0.45;
const JUMP_FORCE = -9;
const PIPE_SPEED_BASE = 2.8;
const PIPE_SPEED_MAX = 5.0;
const PIPE_GAP_BASE = 175;
const PIPE_GAP_MIN = 130;
const PIPE_SPAWN_MS_BASE = 1800;
const PIPE_SPAWN_MS_MIN = 1500;
const PIPE_WIDTH = 65;
const BIRD_X = 110;
const BIRD_R = 18;
const CANVAS_W = 480;
const CANVAS_H = 640;
const GROUND_Y = CANVAS_H - 56;
const BEST_KEY = "itmoscow-fly-best";

type GameStatus = "idle" | "playing" | "dead";

interface Pipe {
  x: number;
  topH: number;
  scored: boolean;
  windowSeed: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
}

interface FlashEffect {
  x: number;
  y: number;
  life: number;
}

function speedFor(score: number): number {
  return Math.min(PIPE_SPEED_BASE + Math.floor(score / 5) * 0.1, PIPE_SPEED_MAX);
}

function gapFor(score: number): number {
  return Math.max(PIPE_GAP_BASE - Math.floor(score / 5) * 3, PIPE_GAP_MIN);
}

function spawnMsFor(score: number): number {
  const t = Math.min(score / 30, 1);
  return PIPE_SPAWN_MS_BASE - (PIPE_SPAWN_MS_BASE - PIPE_SPAWN_MS_MIN) * t;
}

function drawBackground(ctx: CanvasRenderingContext2D, farOff: number, nearOff: number) {
  const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  bg.addColorStop(0, "#070716");
  bg.addColorStop(0.5, "#0a1228");
  bg.addColorStop(1, "#10183a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  for (let i = 0; i < 28; i++) {
    const x = ((i * 73 + farOff * 0.3) % (CANVAS_W + 40)) - 20;
    const y = (i * 47) % 200 + 30;
    ctx.fillStyle = `rgba(255,255,255,${0.15 + (i % 3) * 0.08})`;
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  const farSkyline = [
    { w: 60, h: 120 }, { w: 45, h: 80 }, { w: 80, h: 160 },
    { w: 50, h: 100 }, { w: 70, h: 140 }, { w: 55, h: 110 },
    { w: 90, h: 180 }, { w: 40, h: 70 }, { w: 65, h: 130 },
    { w: 75, h: 150 }, { w: 50, h: 90 },
  ];
  const farTotalW = farSkyline.reduce((s, b) => s + b.w + 8, 0);
  let fx = -((farOff * 0.15) % farTotalW);
  while (fx < CANVAS_W) {
    for (const b of farSkyline) {
      ctx.fillStyle = "rgba(40,60,120,0.55)";
      ctx.fillRect(fx, GROUND_Y - b.h, b.w, b.h);
      fx += b.w + 8;
      if (fx > CANVAS_W) break;
    }
  }

  const nearSkyline = [
    { w: 70, h: 180 }, { w: 55, h: 130 }, { w: 95, h: 220 },
    { w: 60, h: 150 }, { w: 80, h: 200 }, { w: 50, h: 110 },
    { w: 100, h: 240 }, { w: 65, h: 170 },
  ];
  const nearTotalW = nearSkyline.reduce((s, b) => s + b.w + 4, 0);
  let nx = -((nearOff * 0.35) % nearTotalW);
  while (nx < CANVAS_W) {
    for (const b of nearSkyline) {
      ctx.fillStyle = "rgba(20,35,75,0.85)";
      ctx.fillRect(nx, GROUND_Y - b.h, b.w, b.h);
      ctx.fillStyle = "rgba(255,210,120,0.18)";
      for (let wy = GROUND_Y - b.h + 12; wy < GROUND_Y - 8; wy += 14) {
        for (let wx = nx + 6; wx < nx + b.w - 6; wx += 12) {
          if ((wx * 7 + wy * 3) % 17 < 11) ctx.fillRect(wx, wy, 4, 6);
        }
      }
      nx += b.w + 4;
      if (nx > CANVAS_W) break;
    }
  }
}

function drawGround(ctx: CanvasRenderingContext2D, offset: number) {
  const groundGrad = ctx.createLinearGradient(0, GROUND_Y, 0, CANVAS_H);
  groundGrad.addColorStop(0, "#0d1530");
  groundGrad.addColorStop(1, "#060814");
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);

  ctx.fillStyle = "rgba(123,158,255,0.4)";
  ctx.fillRect(0, GROUND_Y, CANVAS_W, 2);

  ctx.fillStyle = "rgba(255,220,140,0.6)";
  const dashW = 28;
  const dashGap = 18;
  const cycle = dashW + dashGap;
  const startX = -(offset % cycle);
  const lineY = GROUND_Y + (CANVAS_H - GROUND_Y) / 2 - 1.5;
  for (let x = startX; x < CANVAS_W; x += cycle) {
    ctx.fillRect(x, lineY, dashW, 3);
  }
}

function drawBuilding(ctx: CanvasRenderingContext2D, x: number, topH: number, gap: number, seed: number) {
  const bottomY = topH + gap;

  function paintBuilding(yStart: number, yEnd: number) {
    const bodyGrad = ctx.createLinearGradient(x, 0, x + PIPE_WIDTH, 0);
    bodyGrad.addColorStop(0, "#0a1838");
    bodyGrad.addColorStop(0.4, "#1a2f5c");
    bodyGrad.addColorStop(0.7, "#15264c");
    bodyGrad.addColorStop(1, "#080f24");
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(x, yStart, PIPE_WIDTH, yEnd - yStart);

    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(x, yStart, 3, yEnd - yStart);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(x + PIPE_WIDTH - 3, yStart, 3, yEnd - yStart);

    const windowCols = 4;
    const windowW = 8;
    const windowH = 10;
    const colSpacing = (PIPE_WIDTH - 8 - windowCols * windowW) / (windowCols - 1);
    const rowSpacing = 16;
    let row = 0;
    for (let wy = yStart + 14; wy < yEnd - windowH - 4; wy += rowSpacing) {
      for (let c = 0; c < windowCols; c++) {
        const wx = x + 4 + c * (windowW + colSpacing);
        const lit = (seed * 31 + row * 7 + c * 13) % 11 < 7;
        ctx.fillStyle = lit ? "rgba(255,220,140,0.9)" : "rgba(40,60,110,0.6)";
        ctx.fillRect(wx, wy, windowW, windowH);
        if (lit) {
          ctx.fillStyle = "rgba(255,255,255,0.4)";
          ctx.fillRect(wx, wy, windowW, 2);
        }
      }
      row++;
    }
  }

  paintBuilding(0, topH);
  paintBuilding(bottomY, GROUND_Y);

  const capGrad = ctx.createLinearGradient(x, 0, x + PIPE_WIDTH, 0);
  capGrad.addColorStop(0, "#7B9EFF");
  capGrad.addColorStop(0.5, "#a0b8ff");
  capGrad.addColorStop(1, "#5b7be0");

  ctx.fillStyle = capGrad;
  ctx.fillRect(x - 6, topH - 8, PIPE_WIDTH + 12, 8);
  ctx.fillRect(x - 6, bottomY, PIPE_WIDTH + 12, 8);

  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.fillRect(x - 6, topH - 8, PIPE_WIDTH + 12, 1);
  ctx.fillRect(x - 6, bottomY, PIPE_WIDTH + 12, 1);
}

function drawBird(ctx: CanvasRenderingContext2D, y: number, dy: number, flapPhase: number) {
  const angle = Math.max(-0.4, Math.min(0.9, dy * 0.06));
  ctx.save();
  ctx.translate(BIRD_X, y);
  ctx.rotate(angle);

  const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, BIRD_R + 14);
  glow.addColorStop(0, "rgba(123,158,255,0.5)");
  glow.addColorStop(0.5, "rgba(123,158,255,0.15)");
  glow.addColorStop(1, "rgba(123,158,255,0)");
  ctx.beginPath();
  ctx.arc(0, 0, BIRD_R + 14, 0, Math.PI * 2);
  ctx.fillStyle = glow;
  ctx.fill();

  const wingY = Math.sin(flapPhase) * 4;
  ctx.fillStyle = "rgba(160,184,255,0.85)";
  ctx.beginPath();
  ctx.ellipse(-4, wingY - 2, 10, 5, -0.3, 0, Math.PI * 2);
  ctx.fill();

  const body = ctx.createRadialGradient(-5, -6, 2, 0, 0, BIRD_R);
  body.addColorStop(0, "#e8efff");
  body.addColorStop(0.5, "#7B9EFF");
  body.addColorStop(1, "#3a5acc");
  ctx.beginPath();
  ctx.arc(0, 0, BIRD_R, 0, Math.PI * 2);
  ctx.fillStyle = body;
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, BIRD_R, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.98)";
  ctx.font = "bold 10px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("ИТ", 0, 0);
  ctx.restore();
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = `hsl(${p.hue}, 80%, 70%)`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawFlashes(ctx: CanvasRenderingContext2D, flashes: FlashEffect[]) {
  for (const f of flashes) {
    const r = (1 - f.life) * 80;
    const alpha = f.life * 0.6;
    ctx.strokeStyle = `rgba(255,220,140,${alpha})`;
    ctx.lineWidth = 3 * f.life;
    ctx.beginPath();
    ctx.arc(f.x, f.y, r, 0, Math.PI * 2);
    ctx.stroke();
  }
}

export default function FlyGame({ userId }: { userId?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statusRef = useRef<GameStatus>("idle");
  const birdRef = useRef({ y: CANVAS_H / 2, dy: 0 });
  const pipesRef = useRef<Pipe[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const flashesRef = useRef<FlashEffect[]>([]);
  const scoreRef = useRef(0);
  const farOffRef = useRef(0);
  const nearOffRef = useRef(0);
  const groundOffRef = useRef(0);
  const flapPhaseRef = useRef(0);
  const lastPipeRef = useRef(0);
  const rafRef = useRef(0);

  const [status, setStatus] = useState<GameStatus>("idle");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [coins, setCoins] = useState<number | null>(null);
  const [coinsLoading, setCoinsLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(BEST_KEY);
    if (stored) setBest(parseInt(stored, 10) || 0);
  }, []);

  const awardCoins = useCallback(async (finalScore: number) => {
    if (finalScore > best) {
      setBest(finalScore);
      localStorage.setItem(BEST_KEY, String(finalScore));
    }
    if (!userId) return;
    setCoinsLoading(true);
    try {
      const res = await fetch("/api/games/reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game: "fly", score: finalScore }),
      });
      const data = await res.json() as { coins?: number };
      setCoins(data.coins ?? 0);
    } catch {
      setCoins(0);
    } finally {
      setCoinsLoading(false);
    }
  }, [userId, best]);

  const jump = useCallback(() => {
    if (statusRef.current === "dead") return;
    if (statusRef.current === "idle") {
      statusRef.current = "playing";
      setStatus("playing");
      lastPipeRef.current = performance.now();
    }
    birdRef.current.dy = JUMP_FORCE;
    for (let i = 0; i < 4; i++) {
      particlesRef.current.push({
        x: BIRD_X - 8,
        y: birdRef.current.y,
        vx: -1.5 - Math.random() * 1.5,
        vy: -0.5 + Math.random(),
        life: 1,
        maxLife: 1,
        size: 2 + Math.random() * 2,
        hue: 220 + Math.random() * 20,
      });
    }
  }, []);

  const resetRefs = useCallback(() => {
    statusRef.current = "idle";
    birdRef.current = { y: CANVAS_H / 2, dy: 0 };
    pipesRef.current = [];
    particlesRef.current = [];
    flashesRef.current = [];
    scoreRef.current = 0;
    lastPipeRef.current = 0;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    let lastTs = 0;

    function loop(ts: number) {
      const dt = lastTs ? Math.min((ts - lastTs) / 16.67, 3) : 1;
      lastTs = ts;

      const st = statusRef.current;
      const bird = birdRef.current;
      const currentSpeed = st === "playing" ? speedFor(scoreRef.current) : PIPE_SPEED_BASE;

      farOffRef.current += currentSpeed * 0.5 * dt;
      nearOffRef.current += currentSpeed * 0.5 * dt;
      groundOffRef.current += currentSpeed * dt;
      flapPhaseRef.current += dt * 0.4;

      drawBackground(ctx, farOffRef.current, nearOffRef.current);

      if (st === "playing") {
        bird.dy += GRAVITY * dt;
        bird.y += bird.dy * dt;

        const spawnInterval = spawnMsFor(scoreRef.current);
        if (ts - lastPipeRef.current > spawnInterval) {
          const currentGap = gapFor(scoreRef.current);
          const minTop = 80;
          const maxTop = GROUND_Y - currentGap - 80;
          pipesRef.current.push({
            x: CANVAS_W + 20,
            topH: minTop + Math.random() * (maxTop - minTop),
            scored: false,
            windowSeed: Math.floor(Math.random() * 1000),
          });
          lastPipeRef.current = ts;
        }

        for (const p of pipesRef.current) {
          p.x -= currentSpeed * dt;
          if (!p.scored && p.x + PIPE_WIDTH < BIRD_X) {
            p.scored = true;
            scoreRef.current++;
            setScore(scoreRef.current);
            flashesRef.current.push({
              x: p.x + PIPE_WIDTH / 2,
              y: bird.y,
              life: 1,
            });
            for (let i = 0; i < 8; i++) {
              const ang = Math.random() * Math.PI * 2;
              particlesRef.current.push({
                x: BIRD_X,
                y: bird.y,
                vx: Math.cos(ang) * (1 + Math.random() * 2),
                vy: Math.sin(ang) * (1 + Math.random() * 2),
                life: 1,
                maxLife: 1,
                size: 1.5 + Math.random() * 1.5,
                hue: 50 + Math.random() * 30,
              });
            }
          }
        }
        pipesRef.current = pipesRef.current.filter(p => p.x > -PIPE_WIDTH - 20);

        let dead = bird.y + BIRD_R >= GROUND_Y || bird.y - BIRD_R <= 0;
        for (const p of pipesRef.current) {
          const currentGap = gapFor(scoreRef.current);
          const hitX = BIRD_X + (BIRD_R - 4) > p.x + 5 && BIRD_X - (BIRD_R - 4) < p.x + PIPE_WIDTH - 5;
          const hitY = bird.y - (BIRD_R - 4) < p.topH - 5 || bird.y + (BIRD_R - 4) > p.topH + currentGap + 5;
          if (hitX && hitY) dead = true;
        }

        if (dead) {
          statusRef.current = "dead";
          setStatus("dead");
          awardCoins(scoreRef.current);
          for (let i = 0; i < 20; i++) {
            const ang = Math.random() * Math.PI * 2;
            particlesRef.current.push({
              x: BIRD_X,
              y: bird.y,
              vx: Math.cos(ang) * (2 + Math.random() * 3),
              vy: Math.sin(ang) * (2 + Math.random() * 3),
              life: 1,
              maxLife: 1,
              size: 2 + Math.random() * 2,
              hue: 0 + Math.random() * 40,
            });
          }
        }
      }

      for (const p of pipesRef.current) {
        const currentGap = gapFor(scoreRef.current);
        drawBuilding(ctx, p.x, p.topH, currentGap, p.windowSeed);
      }

      drawGround(ctx, groundOffRef.current);

      for (const p of particlesRef.current) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 0.1 * dt;
        p.life -= 0.025 * dt;
      }
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      drawParticles(ctx, particlesRef.current);

      for (const f of flashesRef.current) f.life -= 0.04 * dt;
      flashesRef.current = flashesRef.current.filter(f => f.life > 0);
      drawFlashes(ctx, flashesRef.current);

      drawBird(ctx, bird.y, bird.dy, flapPhaseRef.current);

      if (st !== "idle") {
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.beginPath();
        ctx.roundRect(CANVAS_W / 2 - 50, 18, 100, 56, 12);
        ctx.fill();
        ctx.strokeStyle = "rgba(123,158,255,0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(CANVAS_W / 2 - 50, 18, 100, 56, 12);
        ctx.stroke();

        ctx.fillStyle = "rgba(255,255,255,0.98)";
        ctx.font = "bold 36px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(scoreRef.current), CANVAS_W / 2, 46);
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [awardCoins]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") { e.preventDefault(); jump(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [jump]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (statusRef.current !== "dead") jump();
    };
    const onTouchMove = (e: TouchEvent) => e.preventDefault();
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
    };
  }, [jump]);

  function handleRestart() {
    resetRefs();
    setStatus("idle");
    setScore(0);
    setCoins(null);
  }

  const isNewBest = status === "dead" && score > 0 && score >= best;

  return (
    <div className="min-h-dvh bg-[#070716] flex flex-col items-center justify-center gap-3 p-4 overflow-hidden">
      {!userId && (
        <div className="w-full max-w-[480px] px-4 py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs sm:text-sm text-center">
          Войдите через ВКонтакте или Яндекс, чтобы зарабатывать ИтКоины
        </div>
      )}

      <div className="flex items-center justify-between w-full max-w-[480px]">
        <Link href="/store" className="text-white/40 hover:text-white text-sm transition-colors">
          ← В магазин
        </Link>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
          <span className="text-white/40 text-xs">Рекорд</span>
          <span className="text-[#7B9EFF] font-bold text-sm">{best}</span>
        </div>
      </div>

      <div className="relative w-full max-w-[480px]" style={{ maxHeight: "min(75dvh, 640px)" }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="rounded-2xl w-full cursor-pointer touch-none shadow-2xl shadow-[#7B9EFF]/10"
          style={{ aspectRatio: `${CANVAS_W}/${CANVAS_H}`, maxHeight: "min(75dvh, 640px)" }}
          onClick={() => { if (status !== "dead") jump(); }}
        />

        {status === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 rounded-2xl bg-black/50 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-5xl font-black text-white tracking-tight">ИТ.Флай</p>
              <p className="text-[#7B9EFF] text-sm mt-1">Лети сквозь корпуса колледжа</p>
            </div>
            <p className="text-white/50 text-xs">Тап / пробел — взмах</p>
            <button
              onClick={jump}
              className="px-10 py-3 rounded-xl bg-[#7B9EFF] text-[#070716] font-black text-lg hover:bg-[#9ab8ff] transition-colors shadow-lg shadow-[#7B9EFF]/30"
            >
              Старт
            </button>
          </div>
        )}

        {status === "dead" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl bg-black/70 backdrop-blur-md">
            {isNewBest && (
              <div className="px-4 py-1.5 rounded-full bg-yellow-500/20 border border-yellow-400/40 text-yellow-300 text-xs font-bold tracking-wider">
                НОВЫЙ РЕКОРД
              </div>
            )}
            <div className="text-center">
              <p className="text-white/50 text-sm mb-1">Счёт</p>
              <p className="text-white text-7xl font-black leading-none">{score}</p>
              <p className="text-white/30 text-xs mt-2">Лучший: {best}</p>
            </div>
            {userId ? (
              <div className="h-8 flex items-center justify-center">
                {coinsLoading ? (
                  <p className="text-white/40 text-sm">Начисляем монеты…</p>
                ) : (
                  <p className="text-yellow-400 font-bold text-lg">
                    +{coins ?? 0} ИтКоин{coins === 1 ? "" : coins && coins > 4 ? "ов" : "а"}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-white/35 text-xs text-center px-6">
                Войдите, чтобы зарабатывать ИтКоины
              </p>
            )}
            <div className="flex flex-col gap-2 items-center">
              <button
                onClick={handleRestart}
                className="px-10 py-3 rounded-xl bg-[#7B9EFF] text-[#070716] font-black hover:bg-[#9ab8ff] transition-colors shadow-lg shadow-[#7B9EFF]/30"
              >
                Ещё раз
              </button>
              <Link href="/store" className="text-white/30 hover:text-white/60 text-xs transition-colors">
                В магазин
              </Link>
            </div>
          </div>
        )}
      </div>

      <p className="text-white/20 text-xs text-center">Уворачивайся от корпусов и зарабатывай монеты</p>
    </div>
  );
}
