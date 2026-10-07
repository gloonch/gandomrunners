"use client";

import { useEffect, useEffectEvent, useState } from "react";

/** The pinned frames are one viewport tall, kept between 560 and 860px. */
export function frameHeight(vh: number) {
  return Math.max(560, Math.min(vh, 860));
}

/** Runs `onFrame` once per animation frame while anything scrolls or the window resizes, and once on mount. */
export function useScrollFrame(onFrame: () => void) {
  const frame = useEffectEvent(onFrame);
  useEffect(() => {
    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => frame());
    };
    window.addEventListener("scroll", schedule, { passive: true, capture: true });
    window.addEventListener("resize", schedule);
    schedule();
    document.fonts?.ready.then(schedule);
    return () => {
      window.removeEventListener("scroll", schedule, { capture: true });
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(raf);
    };
  }, []);
}

/** Window size; the server render assumes a 1440 × 820 desktop. */
export function useViewport() {
  const [size, setSize] = useState({ vw: 1440, vh: 820 });
  useScrollFrame(() => {
    const vw = window.innerWidth || 1440, vh = window.innerHeight || 820;
    setSize((s) => (s.vw === vw && s.vh === vh ? s : { vw, vh }));
  });
  return size;
}
