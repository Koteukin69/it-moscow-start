"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

const GRAVITY = 0.45;
const JUMP_FORCE = -9;
const PIPE_SPEED = 2.8;
const PIPE_GAP = 175;
const PIPE_WIDTH = 65;
const PIPE_SPAWN_MS = 1800;
const BIRD_X = 110;
const BIRD_R = 18;
const CANVAS_W = 480;
const CANVAS_H = 640;
const GROUND_Y = CANVAS_H - 44;

type GameStatus = "idle" | "playing" | "dead";

interface Pipe {
  x: number;
  topH: number;
  scored: boolean;
}

function drawBackground(ctx: CanvasRenderingContext2D, offset: number) {
  const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  bg.addColorStop(0, "#080814");
  bg.addColorStop(1, "#0d1530");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.strokeStyle = "rgba(123,158,255,0.04)";
  ctx.lineWidth = 1;
  const gs = 60;
  const xOff = offset % gs;
  for (let x = -gs + xOff; x < CANVAS_W + gs; x += gs) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke();
  }
  for (let y = 0; y < CANVAS_H; y += gs) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke();
  }
}

function drawGround(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#0a1226";
  ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);
  ctx.fillStyle = "rgba(123,158,255,0.18)";
  ctx.fillRect(0, GROUND_Y, CANVAS_W, 2);
}

function drawPipe(ctx: CanvasRenderingContext2D, x: number, topH: number) {
  const bottomY = topH + PIPE_GAP;
  const bodyGrad = ctx.createLinearGradient(x, 0, x + PIPE_WIDTH, 0);
  bodyGrad.addColorStop(0, "#0b1e40");
  bodyGrad.addColorStop(0.45, "#163466");
  bodyGrad.addColorStop(1, "#0b1e40");

  ctx.fillStyle = bodyGrad;
  ctx.fillRect(x, 0, PIPE_WIDTH, topH - 10);
  ctx.fillRect(x, bottomY + 10, PIPE_WIDTH, CANVAS_H - bottomY - 10);

  const capColor = "#1e4a8e";
  ctx.fillStyle = capColor;
  ctx.beginPath();
  ctx.roundRect(x - 7, topH - 26, PIPE_WIDTH + 14, 22, 4);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(x - 7, bottomY + 4, PIPE_WIDTH + 14, 22, 4);
  ctx.fill();

  ctx.strokeStyle = "rgba(123,158,255,0.45)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x - 7, topH - 26, PIPE_WIDTH + 14, 22, 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(x - 7, bottomY + 4, PIPE_WIDTH + 14, 22, 4);
  ctx.stroke();
}

function drawBird(ctx: CanvasRenderingContext2D, y: number, dy: number) {
  const angle = Math.max(-0.4, Math.min(0.8, dy * 0.05));
  ctx.save();
  ctx.translate(BIRD_X, y);
  ctx.rotate(angle);

  const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, BIRD_R + 10);
  glow.addColorStop(0, "rgba(123,158,255,0.35)");
  glow.addColorStop(1, "rgba(123,158,255,0)");
  ctx.beginPath();
  ctx.arc(0, 0, BIRD_R + 10, 0, Math.PI * 2);
  ctx.fillStyle = glow;
  ctx.fill();

  const body = ctx.createRadialGradient(-4, -5, 2, 0, 0, BIRD_R);
  body.addColorStop(0, "#c0d4ff");
  body.addColorStop(0.55, "#7B9EFF");
  body.addColorStop(1, "#3a5acc");
  ctx.beginPath();
  ctx.arc(0, 0, BIRD_R, 0, Math.PI * 2);
  ctx.fillStyle = body;
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "bold 9px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("ИТ", 0, 0);
  ctx.restore();
}

export default function FlyGame({ userId }: { userId?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statusRef = useRef<GameStatus>("idle");
  const birdRef = useRef({ y: CANVAS_H / 2, dy: 0 });
  const pipesRef = useRef<Pipe[]>([]);
  const scoreRef = useRef(0);
  const bgOffRef = useRef(0);
  const lastPipeRef = useRef(0);
  const rafRef = useRef(0);

  const [status, setStatus] = useState<GameStatus>("idle");
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState<number | null>(null);
  const [coinsLoading, setCoinsLoading] = useState(false);

  const awardCoins = useCallback(async (finalScore: number) => {
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
  }, [userId]);

  const jump = useCallback(() => {
    if (statusRef.current === "dead") return;
    if (statusRef.current === "idle") {
      statusRef.current = "playing";
      setStatus("playing");
      lastPipeRef.current = performance.now();
    }
    birdRef.current.dy = JUMP_FORCE;
  }, []);

  const resetRefs = useCallback(() => {
    statusRef.current = "idle";
    birdRef.current = { y: CANVAS_H / 2, dy: 0 };
    pipesRef.current = [];
    scoreRef.current = 0;
    bgOffRef.current = 0;
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

      drawBackground(ctx, bgOffRef.current);
      bgOffRef.current += PIPE_SPEED * 0.5 * dt;

      const st = statusRef.current;
      const bird = birdRef.current;

      if (st === "playing") {
        bird.dy += GRAVITY * dt;
        bird.y += bird.dy * dt;

        if (ts - lastPipeRef.current > PIPE_SPAWN_MS) {
          const minTop = 80;
          const maxTop = GROUND_Y - PIPE_GAP - 80;
          pipesRef.current.push({
            x: CANVAS_W + 20,
            topH: minTop + Math.random() * (maxTop - minTop),
            scored: false,
          });
          lastPipeRef.current = ts;
        }

        for (const p of pipesRef.current) {
          p.x -= PIPE_SPEED * dt;
          if (!p.scored && p.x + PIPE_WIDTH < BIRD_X) {
            p.scored = true;
            scoreRef.current++;
            setScore(scoreRef.current);
          }
        }
        pipesRef.current = pipesRef.current.filter(p => p.x > -PIPE_WIDTH - 20);

        let dead = bird.y + BIRD_R >= GROUND_Y || bird.y - BIRD_R <= 0;
        for (const p of pipesRef.current) {
          const hitX = BIRD_X + (BIRD_R - 4) > p.x + 5 && BIRD_X - (BIRD_R - 4) < p.x + PIPE_WIDTH - 5;
          const hitY = bird.y - (BIRD_R - 4) < p.topH - 5 || bird.y + (BIRD_R - 4) > p.topH + PIPE_GAP + 5;
          if (hitX && hitY) dead = true;
        }

        if (dead) {
          statusRef.current = "dead";
          setStatus("dead");
          awardCoins(scoreRef.current);
        }
      }

      for (const p of pipesRef.current) drawPipe(ctx, p.x, p.topH);
      drawGround(ctx);
      drawBird(ctx, bird.y, bird.dy);

      if (st !== "idle") {
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.font = "bold 30px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(String(scoreRef.current), CANVAS_W / 2, 52);
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

  function handleRestart() {
    resetRefs();
    setStatus("idle");
    setScore(0);
    setCoins(null);
  }

  return (
    <div className="min-h-screen bg-[#080814] flex flex-col items-center justify-center gap-4 p-4">
      {!userId && (
        <div className="w-full max-w-[480px] px-4 py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm text-center">
          Войдите через ВКонтакте или Яндекс, чтобы зарабатывать ИтКоины
        </div>
      )}

      <div className="flex items-center justify-between w-full max-w-[480px]">
        <Link href="/store" className="text-white/40 hover:text-white text-sm transition-colors">
          ← Магазин
        </Link>
        <h1 className="text-white font-bold">ИТ.Флай</h1>
        <div className="w-16" />
      </div>

      <div className="relative w-full max-w-[480px]">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="rounded-2xl w-full cursor-pointer touch-none"
          style={{ aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}
          onClick={() => { if (status !== "dead") jump(); }}
          onTouchStart={(e) => { e.preventDefault(); if (status !== "dead") jump(); }}
        />

        {status === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 rounded-2xl bg-black/50">
            <p className="text-4xl font-black text-white">ИТ.Флай</p>
            <p className="text-white/50 text-sm">Нажми / пробел — прыжок</p>
            <button
              onClick={jump}
              className="px-8 py-3 rounded-xl bg-[#7B9EFF] text-[#080814] font-bold hover:bg-[#9ab8ff] transition-colors"
            >
              Начать
            </button>
          </div>
        )}

        {status === "dead" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 rounded-2xl bg-black/65 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-white/50 text-sm mb-1">Счёт</p>
              <p className="text-white text-6xl font-black">{score}</p>
            </div>
            {userId ? (
              <div className="h-8 flex items-center justify-center">
                {coinsLoading ? (
                  <p className="text-white/40 text-sm">Начисляем монеты…</p>
                ) : (
                  <p className="text-yellow-400 font-semibold text-lg">
                    +{coins ?? 0} ИтКоин{coins === 1 ? "" : coins && coins > 4 ? "ов" : "а"}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-white/35 text-xs text-center px-6">
                Войдите, чтобы зарабатывать ИтКоины
              </p>
            )}
            <div className="flex flex-col gap-3 items-center">
              <button
                onClick={handleRestart}
                className="px-8 py-2.5 rounded-xl bg-[#7B9EFF] text-[#080814] font-bold hover:bg-[#9ab8ff] transition-colors"
              >
                Ещё раз
              </button>
              <Link href="/store" className="text-white/30 hover:text-white/60 text-sm transition-colors">
                В магазин
              </Link>
            </div>
          </div>
        )}
      </div>

      <p className="text-white/20 text-xs">Уклоняйся от зданий и зарабатывай монеты</p>
    </div>
  );
}
