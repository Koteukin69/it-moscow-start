"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

type Board = number[][];
type Direction = "up" | "down" | "left" | "right";
type GameStatus = "playing" | "won" | "lost";

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

function tileStyle(value: number): { background: string; color: string; fontSize: string } {
  const map: Record<number, [string, string]> = {
    0:    ["rgba(255,255,255,0.04)", "transparent"],
    2:    ["#1a2744", "#8ba8d4"],
    4:    ["#1e3060", "#9ab4e8"],
    8:    ["#1e3d7a", "#b0c8ff"],
    16:   ["#1e4e96", "#c4d8ff"],
    32:   ["#1e60b2", "#d8e8ff"],
    64:   ["#2070cc", "#e8f0ff"],
    128:  ["#3480dc", "#ffffff"],
    256:  ["#4a90ec", "#ffffff"],
    512:  ["#5ba0f8", "#080814"],
    1024: ["#7B9EFF", "#080814"],
    2048: ["#a0c4ff", "#080814"],
  };
  const [bg, color] = map[value] ?? ["#2a3060", "#ffffff"];
  const fontSize = value >= 1024 ? "1.1rem" : value >= 128 ? "1.4rem" : "1.7rem";
  return { background: bg, color, fontSize };
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
  const awardedRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

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

      setScore(s => {
        const newScore = s + gained;
        setBest(b => Math.max(b, newScore));
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
    awardedRef.current = false;
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
    if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? "right" : "left");
    else move(dy > 0 ? "down" : "up");
  }

  const showOverlay = (status === "won" && !wonDismissed) || status === "lost";

  return (
    <div className="min-h-screen bg-[#0f0f13] flex flex-col items-center justify-center gap-5 p-4 select-none">
      {!userId && (
        <div className="w-full max-w-sm px-4 py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm text-center">
          Войдите через ВКонтакте или Яндекс, чтобы зарабатывать ИтКоины
        </div>
      )}

      <div className="w-full max-w-sm flex items-center justify-between">
        <Link href="/store" className="text-white/40 hover:text-white text-sm transition-colors">
          ← Магазин
        </Link>
        <h1 className="text-white font-black text-xl">ИТ.2048</h1>
        <div className="w-16" />
      </div>

      <div className="w-full max-w-sm flex items-center justify-between gap-3">
        <div className="flex gap-3">
          <div className="px-4 py-2 rounded-xl bg-white/6 border border-white/8 text-center min-w-[72px]">
            <p className="text-white/40 text-xs">Счёт</p>
            <p className="text-white font-bold text-lg leading-tight">{score}</p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/6 border border-white/8 text-center min-w-[72px]">
            <p className="text-white/40 text-xs">Лучший</p>
            <p className="text-white font-bold text-lg leading-tight">{best}</p>
          </div>
        </div>
        <button
          onClick={restart}
          className="px-4 py-2 rounded-xl bg-white/8 hover:bg-white/14 text-white/60 hover:text-white text-sm transition-colors border border-white/8"
        >
          Заново
        </button>
      </div>

      <div
        className="relative w-full max-w-sm aspect-square rounded-2xl bg-[#0d1020] border border-white/8 p-3 touch-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="grid grid-cols-4 gap-2 h-full">
          {board.flat().map((val, idx) => {
            const style = tileStyle(val);
            return (
              <div
                key={idx}
                className="rounded-xl flex items-center justify-center font-black transition-all duration-100"
                style={{
                  background: style.background,
                  color: style.color,
                  fontSize: style.fontSize,
                }}
              >
                {val !== 0 ? val : ""}
              </div>
            );
          })}
        </div>

        {showOverlay && (
          <div className="absolute inset-0 rounded-2xl bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-5">
            {status === "won" && (
              <>
                <p className="text-4xl font-black text-[#7B9EFF]">Победа!</p>
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
                  <p className="text-yellow-400 font-semibold">+{coinLabel(coins)}</p>
                ) : null}
              </div>
            ) : (
              <p className="text-white/35 text-xs text-center px-6">
                Войдите, чтобы зарабатывать ИтКоины
              </p>
            )}

            <div className="flex flex-col gap-3 items-center">
              {status === "won" && (
                <button
                  onClick={() => setWonDismissed(true)}
                  className="px-6 py-2.5 rounded-xl bg-[#7B9EFF] text-[#0f0f13] font-bold hover:bg-[#9ab8ff] transition-colors"
                >
                  Продолжить
                </button>
              )}
              <button
                onClick={restart}
                className="px-6 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/16 font-semibold transition-colors text-sm"
              >
                Заново
              </button>
              <Link href="/store" className="text-white/30 hover:text-white/60 text-sm transition-colors">
                В магазин
              </Link>
            </div>
          </div>
        )}
      </div>

      <p className="text-white/20 text-xs">Стрелки / WASD / свайп — управление</p>
    </div>
  );
}
