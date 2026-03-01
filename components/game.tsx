"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Maximize, Minimize, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Game({ userId, isMobile }: { userId: string; isMobile: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    if (isFullscreen) {
      const exit =
        document.exitFullscreen ??
        (document as any).webkitExitFullscreen ??
        (document as any).msExitFullscreen;
      exit?.call(document).catch(() => {});
    } else {
      const req =
        el.requestFullscreen ??
        (el as any).webkitRequestFullscreen ??
        (el as any).msRequestFullscreen;
      req?.call(el).catch(() => {});
    }
  }, [isFullscreen]);

  useEffect(() => {
    const onChange = () => {
      const active = !!(
        document.fullscreenElement ?? (document as any).webkitFullscreenElement
      );
      setIsFullscreen(active);
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, [isMobile]);

  return (
    <div ref={containerRef} className="relative w-screen h-dvh bg-background">
      <button
        onClick={toggleFullscreen}
        className="absolute right-4 bottom-4 z-3 rounded-xl bg-black/50 p-2.5 text-white backdrop-blur-sm active:scale-90 transition-transform"
      >
        {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
      </button>
      <Link
        href="/applicant"
        className="absolute left-4 top-4 z-1 rounded-xl bg-black/50 p-2.5 text-white backdrop-blur-sm active:scale-90 transition-transform"
      >
        <ArrowLeft size={22} />
      </Link>
      <iframe
        src={`/api/game-assets/index.html?user=${userId}`}
        className="w-full h-full border-none block bg-transparent"
      />
    </div>
  );
}