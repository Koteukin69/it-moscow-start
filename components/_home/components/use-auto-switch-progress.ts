import { useEffect, useRef, useState } from "react";

type Params = {
  durationMs: number;
  paused: boolean;
  resetKey: string;
  onComplete: () => void;
};

export function useAutoSwitchProgress({ durationMs, paused, resetKey, onComplete }: Params): number {
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const pausedRef = useRef<boolean>(paused);
  const onCompleteRef = useRef<() => void>(onComplete);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setElapsedMs(0);
    let rafId = 0;
    let lastTimestamp: number | null = null;
    let accumulated = 0;

    const tick = (timestamp: number): void => {
      if (lastTimestamp !== null) {
        const delta = timestamp - lastTimestamp;
        if (!pausedRef.current) {
          accumulated += delta;
          if (accumulated >= durationMs) {
            setElapsedMs(durationMs);
            onCompleteRef.current();
            return;
          }
          setElapsedMs(accumulated);
        }
      }
      lastTimestamp = timestamp;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [durationMs, resetKey]);

  return Math.min(elapsedMs / durationMs, 1);
}
