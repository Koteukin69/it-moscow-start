'use client';

import {useState, useRef, useCallback} from "react";
import {ChevronLeft, ChevronRight, ShoppingBag} from "lucide-react";

interface ImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  mode?: "hover" | "arrows";
}

function EmptyPlaceholder({className = ""}: {className?: string}) {
  return (
    <div className={`flex items-center justify-center bg-muted/30 ${className}`}>
      <ShoppingBag size={48} className="text-muted-foreground/30"/>
    </div>
  );
}

function HoverCarousel({images, alt, className = ""}: {images: string[]; alt: string; className?: string}) {
  const [current, setCurrent] = useState(0);
  const [offset, setOffset] = useState(0);
  const [animate, setAnimate] = useState(false);
  const touchRef = useRef<{startX: number; startY: number; moving: boolean} | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const n = images.length;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const zone = Math.max(0, Math.min(Math.floor((x / rect.width) * n), n - 1));
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      setAnimate(false);
      setCurrent(zone);
    }, 20);
  }, [n]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchRef.current = {startX: touch.clientX, startY: touch.clientY, moving: false};
    setOffset(0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchRef.current || !containerRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchRef.current.startX;
    const dy = touch.clientY - touchRef.current.startY;
    if (!touchRef.current.moving && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 5) {
      touchRef.current.moving = true;
    }
    if (touchRef.current.moving) {
      e.preventDefault();
      const w = containerRef.current.offsetWidth;
      setOffset(Math.max(-w, Math.min(w, dx)));
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchRef.current || !containerRef.current) { touchRef.current = null; return; }
    const w = containerRef.current.offsetWidth;
    setAnimate(true);
    if (offset < -w * 0.2) setCurrent(c => (c + 1) % n);
    else if (offset > w * 0.2) setCurrent(c => (c - 1 + n) % n);
    setOffset(0);
    touchRef.current = null;
  }, [offset, n]);

  const transition = offset !== 0 ? "none" : animate ? "transform 300ms cubic-bezier(0.25, 1, 0.5, 1)" : "none";

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden select-none touch-pan-y ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex h-full"
        style={{
          width: `${n * 100}%`,
          transform: `translateX(calc(-${current * (100 / n)}% + ${offset}px))`,
          transition,
        }}
      >
        {images.map((src, i) => (
          <img key={i} src={src} alt={`${alt} ${i + 1}`} className="h-full object-cover shrink-0" style={{width: `${100 / n}%`}} draggable={false}/>
        ))}
      </div>

      {n > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <span key={i} className={`h-1 rounded-full transition-all duration-200 ${i === current ? "w-4 bg-white" : "w-1.5 bg-white/40"}`}/>
          ))}
        </div>
      )}
    </div>
  );
}

function ArrowCarousel({images, alt, className = ""}: {images: string[]; alt: string; className?: string}) {
  const [current, setCurrent] = useState(0);
  const touchRef = useRef<{startX: number; startY: number; moving: boolean} | null>(null);
  const n = images.length;

  const prev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrent(i => (i - 1 + n) % n);
  }, [n]);

  const next = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrent(i => (i + 1) % n);
  }, [n]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    if (x <= 0.2) prev();
    else if (x >= 0.8) next();
  }, [prev, next]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchRef.current = {startX: touch.clientX, startY: touch.clientY, moving: false};
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchRef.current.startX;
    const dy = touch.clientY - touchRef.current.startY;
    if (!touchRef.current.moving && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 5) {
      touchRef.current.moving = true;
    }
    if (touchRef.current.moving) {
      e.preventDefault();
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchRef.current.startX;
    if (touchRef.current.moving) {
      if (dx < -30) setCurrent(i => (i + 1) % n);
      else if (dx > 30) setCurrent(i => (i - 1 + n) % n);
    }
    touchRef.current = null;
  }, [n]);

  return (
    <div
      className={`relative overflow-hidden group select-none touch-pan-y ${className}`}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <img src={images[current]} alt={`${alt} ${current + 1}`} className="w-full h-full object-cover" draggable={false}/>

      <button
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur rounded-full p-1.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
        onClick={prev}
      >
        <ChevronLeft size={16}/>
      </button>
      <button
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur rounded-full p-1.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
        onClick={next}
      >
        <ChevronRight size={16}/>
      </button>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, i) => (
          <span key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === current ? "bg-white" : "bg-white/40"}`}/>
        ))}
      </div>
    </div>
  );
}

export default function ImageCarousel({images, alt, className = "", mode = "hover"}: ImageCarouselProps) {
  if (images.length === 0) return <EmptyPlaceholder className={className}/>;
  if (images.length === 1) {
    return (
      <div className={`overflow-hidden ${className}`}>
        <img src={images[0]} alt={alt} className="w-full h-full object-cover" draggable={false}/>
      </div>
    );
  }
  if (mode === "arrows") return <ArrowCarousel images={images} alt={alt} className={className}/>;
  return <HoverCarousel images={images} alt={alt} className={className}/>;
}
