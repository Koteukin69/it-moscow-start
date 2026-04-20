"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { Card } from "./technologies-types";
import { MobileCard } from "./mobile-card";
import {
  EDGE_RESISTANCE_RATIO,
  SNAP_TRANSITION_MS,
  SWIPE_DISTANCE_THRESHOLD_RATIO,
  SWIPE_MAX_STEP,
  SWIPE_VELOCITY_THRESHOLD_PX_PER_MS,
} from "./technologies-constants";

type Props = {
  cards: Card[];
  titleText: string;
};

type DragState = {
  pointerId: number;
  startX: number;
  lastX: number;
  lastTimestamp: number;
  velocityPxPerMs: number;
};

export function MobileCarousel({ cards, titleText }: Props) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [dragOffsetPx, setDragOffsetPx] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<DragState | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (element === null) return;

    const update = (): void => setContainerWidth(element.clientWidth);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const clampIndex = useCallback(
    (next: number): number => {
      if (next < 0) return 0;
      if (next > cards.length - 1) return cards.length - 1;
      return next;
    },
    [cards.length],
  );

  const finishDrag = useCallback((): void => {
    const state = dragStateRef.current;
    if (state === null || containerWidth === 0) {
      setDragOffsetPx(0);
      setIsDragging(false);
      dragStateRef.current = null;
      return;
    }

    const totalDelta = state.lastX - state.startX;
    const distanceRatio = totalDelta / containerWidth;

    const absVelocity = Math.abs(state.velocityPxPerMs);
    const velocitySteps =
      absVelocity >= SWIPE_VELOCITY_THRESHOLD_PX_PER_MS
        ? Math.min(
            SWIPE_MAX_STEP,
            Math.max(1, Math.round(absVelocity / SWIPE_VELOCITY_THRESHOLD_PX_PER_MS)),
          ) * Math.sign(state.velocityPxPerMs)
        : 0;

    const absDistance = Math.abs(distanceRatio);
    const distanceSteps =
      absDistance >= SWIPE_DISTANCE_THRESHOLD_RATIO
        ? Math.min(SWIPE_MAX_STEP, Math.max(1, Math.round(absDistance))) * Math.sign(distanceRatio)
        : 0;

    const pickedSteps =
      Math.abs(velocitySteps) >= Math.abs(distanceSteps) ? velocitySteps : distanceSteps;

    const indexDelta = -pickedSteps;
    setActiveIndex((current) => clampIndex(current + indexDelta));
    setDragOffsetPx(0);
    setIsDragging(false);
    dragStateRef.current = null;
  }, [containerWidth, clampIndex]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (!event.isPrimary) return;
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      lastX: event.clientX,
      lastTimestamp: performance.now(),
      velocityPxPerMs: 0,
    };
    setIsDragging(true);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const state = dragStateRef.current;
    if (state === null || state.pointerId !== event.pointerId) return;

    const now = performance.now();
    const deltaX = event.clientX - state.lastX;
    const deltaT = Math.max(1, now - state.lastTimestamp);
    state.velocityPxPerMs = deltaX / deltaT;
    state.lastX = event.clientX;
    state.lastTimestamp = now;

    const rawOffset = event.clientX - state.startX;
    const atStart = activeIndex === 0 && rawOffset > 0;
    const atEnd = activeIndex === cards.length - 1 && rawOffset < 0;
    const resistedOffset = atStart || atEnd ? rawOffset * EDGE_RESISTANCE_RATIO : rawOffset;

    setDragOffsetPx(resistedOffset);
  };

  const onPointerEnd = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const state = dragStateRef.current;
    if (state === null || state.pointerId !== event.pointerId) return;
    finishDrag();
  };

  const baseTranslatePx = -activeIndex * (containerWidth + 20);
  const translatePx = baseTranslatePx + dragOffsetPx;

  return (
    <div
      ref={containerRef}
      className="relative h-[calc(100dvh-80px)] max-h-[780px] min-h-[560px] w-full touch-pan-y select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
    >
      <div
        className="flex h-full gap-5"
        style={{
          width: `${cards.length * 100}%`,
          transform: `translate3d(${translatePx}px, 0, 0)`,
          transition: isDragging
            ? "none"
            : `transform ${SNAP_TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          willChange: "transform",
        }}
      >
        {cards.map((card) => (
          <div key={card.id} className="h-full shrink-0" style={{ width: `${containerWidth}px` }}>
            <MobileCard card={card} titleText={titleText} />
          </div>
        ))}
      </div>
    </div>
  );
}
