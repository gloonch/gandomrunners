"use client";

import { useRef, useState } from "react";
import { RouteWordMap } from "@/components/ds/RouteWordMap";
import { HERO_ITEMS } from "@/lib/content";
import { cx } from "@/lib/cx";
import { clamp } from "@/lib/route";
import { frameHeight, useScrollFrame, useViewport } from "@/lib/scroll";

/** The map stays pinned for 3.4 frames of scroll while the route writes one word per frame. */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const hpRef = useRef(0);
  const idle = useRef<number | undefined>(undefined);
  const [hp, setHp] = useState(0);
  const [scrolling, setScrolling] = useState(false);
  const { vw, vh } = useViewport();
  const mobile = vw < 768;
  const fh = frameHeight(vh);

  useScrollFrame(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const span = r.height - frameHeight(window.innerHeight || 820);
    const next = span > 0 ? clamp(-r.top / span, 0, 1) : 0;
    if (Math.abs(next - hpRef.current) <= 0.0005) return;
    hpRef.current = next;
    setHp(next);
    // the runner in the scroll cue shimmers while the route moves
    setScrolling(true);
    clearTimeout(idle.current);
    idle.current = window.setTimeout(() => setScrolling(false), 450);
  });

  // the route enters with the first word already drawn and ends pulsing near the bottom centre
  const progress = 0.86 + hp * (HERO_ITEMS.length - 0.86);
  const finishY = mobile ? 84 : 88;
  const topY = (132 / fh) * 100; // clear of the navbar and its fade

  return (
    <section ref={ref} id="top" className="hero" style={{ height: Math.round(fh * 3.4) }}>
      <div className="hero-frame" style={{ height: fh }}>
        <RouteWordMap
          items={HERO_ITEMS}
          progress={progress}
          height={fh}
          finish={{ x: 50, y: finishY }}
          wordBounds={{
            desktop: { x: 25, y: topY, width: 50, height: Math.max(30, finishY - 6 - topY) },
            mobile: { x: 6, y: topY, width: 88, height: Math.max(26, Math.min(44, finishY - 34 - topY)) },
          }}
          className="gr-hero-map"
        />

        {/* the map fades out under the navbar */}
        <div className="hero-fade" />

        <div className="scroll-cue">
          Scroll to
          <svg className={cx("runner", scrolling && "on")} width="15" height="15" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="run">
            <defs>
              <linearGradient id="runShimmer" x1="-1" y1="0" x2="0" y2="0" gradientUnits="objectBoundingBox">
                <stop offset="0" stopColor="#f36b21" />
                <stop offset="0.45" stopColor="#f36b21" />
                <stop offset="0.5" stopColor="#ffd9bf" />
                <stop offset="0.55" stopColor="#f36b21" />
                <stop offset="1" stopColor="#f36b21" />
                <animate attributeName="x1" values="-1;1" dur="0.9s" repeatCount="indefinite" />
                <animate attributeName="x2" values="0;2" dur="0.9s" repeatCount="indefinite" />
              </linearGradient>
            </defs>
            <path d="M13 4m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
            <path d="M4 17l5 1l.75 -1.5" />
            <path d="M15 21l0 -4l-4 -3l1 -6" />
            <path d="M7 12l0 -3l5 -1l3 3l3 1" />
          </svg>
        </div>
        <h1 className="sr-only">Gandom Runners — run with direction</h1>
      </div>
    </section>
  );
}
