"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { RotateCcw, Trophy } from "lucide-react";

type Board = number[][];
type Direction = "up" | "down" | "left" | "right";
type GameStatus = "playing" | "won" | "lost";

const BEST_KEY = "itmoscow-2048-best";
const SWIPE_MIN_PX = 20;
const SWIPE_MAX_MS = 500;

function emptyBoard(): Board {
  return Array.from({ length: 4 }, () => Array(4).fill(0));
}

function addTile(board: Board): Board {
  const empty: [number, number][] = [];
  board.forEach((row, i) => row.forEach((v, j) => { if (!v) empty.push([i, j]); }));
  if (!empty.length) return board;
  const [i, j] = empty[Math.floor(Math.random() * empty.length)];
  const next = board.map(r => [...r]);
  next[i][j] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

function initBoard(): Board {
  return addTile(addTile(emptyBoard()));
}

function slideRow(row: number[]): { row: number[]; score: number } {
  const tiles = row.filter(v => v !== 0);
  let score = 0;
  const merged: number[] = [];
  let i = 0;
  while (i < tiles.length) {
    if (i + 1 < tiles.length && tiles[i] === tiles[i + 1]) {
      const val = tiles[i] * 2;
      merged.push(val);
      score += val;
      i += 2;
    } else {
      merged.push(tiles[i]);
      i++;
    }
  }
  while (merged.length < 4) merged.push(0);
  return { row: merged, score };
}

function transpose(b: Board): Board {
  return b[0].map((_, j) => b.map(row => row[j]));
}

function applyMove(board: Board, dir: Direction): { board: Board; score: number } {
  let b = board.map(r => [...r]);
  let totalScore = 0;
  const slideAll = (rows: Board) =>
    rows.map(r => { const res = slideRow(r); totalScore += res.score; return res.row; });

  if (dir === "left") { b = slideAll(b); }
  else if (dir === "right") { b = slideAll(b.map(r => [...r].reverse())).map(r => [...r].reverse()); }
  else if (dir === "up") { b = transpose(slideAll(transpose(b))); }
  else { b = transpose(slideAll(transpose(b).map(r => [...r].reverse())).map(r => [...r].reverse())); }

  return { board: b, score: totalScore };
}

function boardsEqual(a: Board, b: Board): boolean {
  return a.every((row, i) => row.every((v, j) => v === b[i][j]));
}

function maxTile(board: Board): number {
  return Math.max(...board.flat());
}

function hasValidMove(board: Board): boolean {
  if (board.some(r => r.some(v => v === 0))) return true;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (j < 3 && board[i][j] === board[i][j + 1]) return true;
      if (i < 3 && board[i][j] === board[i + 1][j]) return true;
    }
  }
  return false;
}

interface TileStyle {
  background: string;
  color: string;
  fontSize: string;
  shadow: string;
  glow: boolean;
}

function tileStyle(value: number): TileStyle {
  const map: Record<number, Omit<TileStyle, "fontSize">> = {
    2:    { background: "linear-gradient(135deg, #1a2744 0%, #14203a 100%)", color: "#8ba8d4", shadow: "0 2px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)", glow: false },
    4:    { background: "linear-gradient(135deg, #213466 0%, #1a2a55 100%)", color: "#9ab4e8", shadow: "0 2px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)", glow: false },
    8:    { background: "linear-gradient(135deg, #244a90 0%, #1c3a76 100%)", color: "#b0c8ff", shadow: "0 3px 8px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.1)", glow: false },
    16:   { background: "linear-gradient(135deg, #2a5fb2 0%, #214d96 100%)", color: "#c4d8ff", shadow: "0 3px 10px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12)", glow: false },
    32:   { background: "linear-gradient(135deg, #3470cc 0%, #275ab0 100%)", color: "#d8e8ff", shadow: "0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.14)", glow: false },
    64:   { background: "linear-gradient(135deg, #4080dc 0%, #316bc0 100%)", color: "#ffffff", shadow: "0 4px 14px rgba(64,128,220,0.3), inset 0 1px 0 rgba(255,255,255,0.18)", glow: false },
    128:  { background: "linear-gradient(135deg, #5290ec 0%, #3e7ad6 100%)", color: "#ffffff", shadow: "0 5px 16px rgba(82,144,236,0.4), inset 0 1px 0 rgba(255,255,255,0.22)", glow: false },
    256:  { background: "linear-gradient(135deg, #6aa0f8 0%, #5290ec 100%)", color: "#ffffff", shadow: "0 5px 18px rgba(106,160,248,0.45), inset 0 1px 0 rgba(255,255,255,0.25)", glow: false },
    512:  { background: "linear-gradient(135deg, #7B9EFF 0%, #6088f0 100%)", color: "#070716", shadow: "0 6px 20px rgba(123,158,255,0.5), inset 0 1px 0 rgba(255,255,255,0.3)", glow: false },
    1024: { background: "linear-gradient(135deg, #a0c4ff 0%, #7B9EFF 100%)", color: "#070716", shadow: "0 6px 22px rgba(160,196,255,0.55), inset 0 1px 0 rgba(255,255,255,0.4)", glow: false },
    2048: { background: "linear-gradient(135deg, #ffe082 0%, #ffc940 100%)", color: "#070716", shadow: "0 0 30px rgba(255,201,64,0.6), 0 6px 20px rgba(255,201,64,0.4), inset 0 1px 0 rgba(255,255,255,0.5)", glow: true },
    4096: { background: "linear-gradient(135deg, #ffb074 0%, #ff7b3c 100%)", color: "#070716", shadow: "0 0 35px rgba(255,123,60,0.7), 0 6px 22px rgba(255,123,60,0.45), inset 0 1px 0 rgba(255,255,255,0.5)", glow: true },
    8192: { background: "linear-gradient(135deg, #ff7080 0%, #ff3850 100%)", color: "#ffffff", shadow: "0 0 40px rgba(255,80,100,0.7), 0 8px 24px rgba(255,80,100,0.5), inset 0 1px 0 rgba(255,255,255,0.4)", glow: true },
  };
  const base = map[value] ?? { background: "linear-gradient(135deg, #2a3060 0%, #1d2348 100%)", color: "#ffffff", shadow: "0 3px 10px rgba(0,0,0,0.4)", glow: false };
  const fontSize =
    value >= 10000 ? "1.1rem" :
    value >= 1000  ? "1.3rem" :
    value >= 100   ? "1.6rem" :
                     "1.9rem";
  if (value === 0) {
    return { background: "rgba(255,255,255,0.035)", color: "transparent", fontSize, shadow: "inset 0 1px 2px rgba(0,0,0,0.2)", glow: false };
  }
  return { ...base, fontSize };
}

function coinLabel(c: number): string {
  if (c === 1) return "1 ИтКоин";
  if (c >= 5) return `${c} ИтКоинов`;
  return `${c} ИтКоина`;
}

export default function Game2048({ userId }: { userId?: string }) {
  const [board, setBoard] = useState<Board>(initBoard);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [status, setStatus] = useState<GameStatus>("playing");
  const [coins, setCoins] = useState<number | null>(null);
  const [coinsLoading, setCoinsLoading] = useState(false);
  const [wonDismissed, setWonDismissed] = useState(false);
  const [newBestFlash, setNewBestFlash] = useState(false);
  const [tickKey, setTickKey] = useState(0);
  const awardedRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number; t: number } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(BEST_KEY);
    if (stored) setBest(parseInt(stored, 10) || 0);
  }, []);

  const awardCoins = useCallback(async (topTile: number) => {
    if (!userId || awardedRef.current) return;
    awardedRef.current = true;
    setCoinsLoading(true);
    try {
      const res = await fetch("/api/games/reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game: "2048", score: topTile }),
      });
      const data = await res.json() as { coins?: number };
      setCoins(data.coins ?? 0);
    } catch {
      setCoins(0);
    } finally {
      setCoinsLoading(false);
    }
  }, [userId]);

  const move = useCallback((dir: Direction) => {
    if (status === "lost") return;
    if (status === "won" && !wonDismissed) return;

    setBoard(prev => {
      const { board: next, score: gained } = applyMove(prev, dir);
      if (boardsEqual(prev, next)) return prev;

      const withTile = addTile(next);
      const top = maxTile(withTile);
      setTickKey(k => k + 1);

      setScore(s => {
        const newScore = s + gained;
        setBest(b => {
          if (newScore > b) {
            localStorage.setItem(BEST_KEY, String(newScore));
            setNewBestFlash(true);
            return newScore;
          }
          return b;
        });
        return newScore;
      });

      if (top >= 2048 && status !== "won") {
        setStatus("won");
        awardCoins(top);
      } else if (!hasValidMove(withTile)) {
        setStatus("lost");
        awardCoins(top);
      }

      return withTile;
    });
  }, [status, wonDismissed, awardCoins]);

  useEffect(() => {
    if (!newBestFlash) return;
    const id = setTimeout(() => setNewBestFlash(false), 1200);
    return () => clearTimeout(id);
  }, [newBestFlash, score]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Direction> = {
        ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
        w: "up", s: "down", a: "left", d: "right",
      };
      if (map[e.key]) { e.preventDefault(); move(map[e.key]); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  function restart() {
    setBoard(initBoard());
    setScore(0);
    setStatus("playing");
    setCoins(null);
    setWonDismissed(false);
    setTickKey(k => k + 1);
    awardedRef.current = false;
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() };
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!touchStartRef.current) return;
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (Date.now() - start.t > SWIPE_MAX_MS) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) < SWIPE_MIN_PX && Math.abs(dy) < SWIPE_MIN_PX) return;
    if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? "right" : "left");
    else move(dy > 0 ? "down" : "up");
  }

  const showOverlay = (status === "won" && !wonDismissed) || status === "lost";

  return (
    <div className="min-h-dvh bg-[#0a0a14] flex flex-col items-center justify-center gap-4 p-4 select-none overflow-hidden">
      {!userId && (
        <div className="w-full max-w-sm px-4 py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs sm:text-sm text-center">
          Войдите через ВКонтакте или Яндекс, чтобы зарабатывать ИтКоины
        </div>
      )}

      <div className="w-full max-w-sm flex items-center justify-between">
        <Link href="/store" className="text-white/40 hover:text-white text-sm transition-colors">
          ← В магазин
        </Link>
        <h1 className="text-white font-black text-xl tracking-tight">
          ИТ.<span className="text-[#7B9EFF]">2048</span>
        </h1>
        <div className="w-16" />
      </div>

      <div className="w-full max-w-sm flex items-center justify-between gap-3">
        <div className="flex gap-2.5">
          <div className="px-4 py-2 rounded-xl bg-gradient-to-b from-white/8 to-white/4 border border-white/10 text-center min-w-[78px] shadow-md">
            <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold">Счёт</p>
            <p className="text-white font-black text-lg leading-tight">{score}</p>
          </div>
          <div className={`px-4 py-2 rounded-xl bg-gradient-to-b border text-center min-w-[78px] shadow-md transition-all duration-300 ${
            newBestFlash
              ? "from-yellow-400/30 to-yellow-500/10 border-yellow-400/50 shadow-yellow-400/30"
              : "from-white/8 to-white/4 border-white/10"
          }`}>
            <p className={`text-[10px] uppercase tracking-wider font-bold flex items-center justify-center gap-1 ${newBestFlash ? "text-yellow-300" : "text-white/40"}`}>
              <Trophy size={9} />
              Лучший
            </p>
            <p className={`font-black text-lg leading-tight ${newBestFlash ? "text-yellow-200" : "text-white"}`}>{best}</p>
          </div>
        </div>
        <button
          onClick={restart}
          className="px-3 py-2 rounded-xl bg-white/8 hover:bg-white/14 text-white/60 hover:text-white text-sm transition-colors border border-white/10 flex items-center gap-1.5"
          aria-label="Заново"
        >
          <RotateCcw size={14} />
          <span className="hidden sm:inline">Заново</span>
        </button>
      </div>

      <div
        className="relative w-full max-w-sm aspect-square rounded-2xl p-3 touch-none"
        style={{
          background: "linear-gradient(135deg, #0d1024 0%, #080b1a 100%)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
          border: "1px solid rgba(123,158,255,0.08)",
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="grid grid-cols-4 gap-2 h-full">
          {board.flat().map((val, idx) => {
            const style = tileStyle(val);
            const key = val === 0 ? `empty-${idx}` : `${idx}-${val}-${tickKey}`;
            return (
              <div
                key={key}
                className={`rounded-xl flex items-center justify-center font-black ${val !== 0 ? "animate-in zoom-in-50 duration-150" : ""} ${style.glow ? "animate-pulse" : ""}`}
                style={{
                  background: style.background,
                  color: style.color,
                  fontSize: style.fontSize,
                  boxShadow: style.shadow,
                }}
              >
                {val !== 0 ? val : ""}
              </div>
            );
          })}
        </div>

        {showOverlay && (
          <div className="absolute inset-0 rounded-2xl bg-black/75 backdrop-blur-md flex flex-col items-center justify-center gap-4 p-4">
            {status === "won" && (
              <>
                <div className="text-5xl">🏆</div>
                <p className="text-4xl font-black bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">Победа!</p>
                <p className="text-white/60 text-sm">Ты достиг 2048</p>
              </>
            )}
            {status === "lost" && (
              <>
                <p className="text-4xl font-black text-white">Игра окончена</p>
                <p className="text-white/50 text-sm">Счёт: {score}</p>
              </>
            )}

            {userId ? (
              <div className="h-8 flex items-center justify-center">
                {coinsLoading ? (
                  <p className="text-white/40 text-sm">Начисляем монеты…</p>
                ) : coins !== null && coins > 0 ? (
                  <p className="text-yellow-400 font-bold text-lg">+{coinLabel(coins)}</p>
                ) : null}
              </div>
            ) : (
              <p className="text-white/35 text-xs text-center px-6">
                Войдите, чтобы зарабатывать ИтКоины
              </p>
            )}

            <div className="flex flex-col gap-2 items-center">
              {status === "won" && (
                <button
                  onClick={() => setWonDismissed(true)}
                  className="px-8 py-2.5 rounded-xl bg-[#7B9EFF] text-[#070716] font-black hover:bg-[#9ab8ff] transition-colors shadow-lg shadow-[#7B9EFF]/30"
                >
                  Продолжить
                </button>
              )}
              <button
                onClick={restart}
                className="px-8 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/16 font-bold transition-colors text-sm border border-white/15"
              >
                Заново
              </button>
              <Link href="/store" className="text-white/30 hover:text-white/60 text-xs transition-colors">
                В магазин
              </Link>
            </div>
          </div>
        )}
      </div>

      <p className="text-white/20 text-xs text-center">Стрелки / WASD / свайп — управление</p>
    </div>
  );
}
