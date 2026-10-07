"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import {
  buildCity, buildRouteLayout, clamp, drawnFraction, normalizeWord, PHASES, pointAt, ramp,
  type City, type Pt, type RouteLayout, type WordBounds,
} from "@/lib/route";
import { Button } from "./Button";
import { Eyebrow } from "./Eyebrow";

export type RouteWordMapItem = {
  /** normalized to A–Z uppercase; an item that normalizes to empty is skipped */
  word: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

type RouteWordMapProps = {
  items: RouteWordMapItem[];
  /** 0 … items.length. The component doesn't scroll by itself: pin its wrapper and pass the scroll progress */
  progress?: number;
  /** percent of the map view; default: centred above the first line */
  origin?: { x: number; y: number };
  /** percent of the map view; default: centred, 86% down on desktop, 56% on mobile */
  finish?: { x?: number; y?: number };
  wordBounds?: WordBounds;
  routeColor?: string;
  /** default 0.32 (route-completed-opacity) */
  completedOpacity?: number;
  /** multiplier on the seeded GPS jitter; default 1 */
  wobbleIntensity?: number;
  /** CSS px; default 4, or 3 when the component is under 768px wide */
  lineWidth?: number;
  height?: number | string;
  className?: string;
};

function CityMap({ city }: { city: City }) {
  const g = city.g;
  return (
    <g>
      {city.parks.map((p, i) => (
        <rect key={"p" + i} className="park" x={p[0] * g + 3} y={p[1] * g + 3} width={p[2] * g - 6} height={p[3] * g - 6} rx={4} />
      ))}
      <path className="street-minor" d={city.alleys} />
      <path className="street" d={city.streets} />
      <path className="avenue" d={city.avenues} />
      <path className="building" d={city.buildings} />
    </g>
  );
}

/* the step copy opens as a glass popup from its destination marker.
   Desktop: alternating halves (item 0 left, 1 right, 2 left…), in the margin beside the word column.
   Mobile, or a margin too narrow: below the marker (above it when there is no room). */
const POP_W = 300;
type Placement =
  | { mode: "left" | "right"; w: number; edge: number; cy: number }
  | { mode: "above" | "below"; w: number; left: number };

function popPlacement(L: RouteLayout, d: Pt, i: number): Placement {
  if (!L.mobile) {
    const leftRoom = L.blockLeft - 64, rightRoom = L.W - L.blockRight - 64;
    let side: "left" | "right" = i % 2 === 0 ? "left" : "right";
    let room = side === "left" ? leftRoom : rightRoom;
    if (room < 220) { side = side === "left" ? "right" : "left"; room = side === "left" ? leftRoom : rightRoom; }
    if (room >= 220) {
      const w = Math.min(POP_W, room);
      const edge = side === "left" ? L.blockLeft - 36 : L.blockRight + 36;   // the card edge the leader reaches
      return { mode: side, w, edge, cy: clamp(d[1], 120, L.H - 120) };
    }
  }
  const w = Math.min(L.W * 0.88, 420), left = clamp(d[0] - w / 2, L.W * 0.06, L.W * 0.94 - w);
  return { mode: d[1] + 230 > L.H ? "above" : "below", w, left };
}

type StepPopupProps = { item: RouteWordMapItem; dest: Pt; place: Placement; open: number; last?: boolean; hidden?: boolean };

function StepPopup({ item, dest: d, place: pl, open, last, hidden }: StepPopupProps) {
  if (open <= 0.001) return null;
  const st: Record<string, string | number> = { width: pl.w, opacity: open, pointerEvents: open > 0.6 ? "auto" : "none" };
  const sc = `scale(${0.92 + 0.08 * open})`;
  if ("edge" in pl) {
    st.top = pl.cy;
    st.left = pl.mode === "left" ? pl.edge - pl.w : pl.edge;
    st.transform = "translateY(-50%) " + sc;
    st.transformOrigin = (pl.mode === "left" ? "100%" : "0") + " 50%";
    st["--tail-y"] = d[1] - pl.cy + "px";
  } else {
    const up = pl.mode === "above";
    st.left = pl.left;
    st.top = up ? d[1] - 20 : d[1] + 20;
    st.transform = (up ? "translateY(-100%) " : "") + sc;
    st.transformOrigin = d[0] - pl.left + "px " + (up ? "100%" : "0");
    st["--tail"] = d[0] - pl.left + "px";
  }
  return (
    <div className={cx("gr-rwm-pop", pl.mode)} style={st as CSSProperties} role="group" aria-hidden={hidden || undefined} aria-label={item.title || item.word}>
      {item.eyebrow ? <Eyebrow>{item.eyebrow}</Eyebrow> : null}
      {item.title ? <h3>{item.title}</h3> : null}
      {item.description ? <p>{item.description}</p> : null}
      {item.ctaLabel ? (
        <div style={{ marginTop: 4 }}>
          <Button variant={last ? "primary" : "secondary"} href={item.ctaHref || "#"} icon="arrow-forward" tabIndex={open < 0.9 ? -1 : undefined}>
            {item.ctaLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/** the dashed leader from the destination to the side popup */
function Leader({ dest: d, place: pl, open }: { dest: Pt; place: Placement; open: number }) {
  if (!("edge" in pl) || open <= 0.001) return null;
  return (
    <path className="pop-leader" d={`M${d[0]} ${d[1]}H${pl.edge}`} pathLength={100} strokeDasharray="100 100" strokeDashoffset={100 * (1 - open)} style={{ opacity: open }} />
  );
}

/** Pinned scrollytelling map: one continuous orange GPS route writes one uppercase English word per line through an abstract city. */
export function RouteWordMap(props: RouteWordMapProps) {
  const { progress, origin, finish, wordBounds, wobbleIntensity } = props;
  const items = props.items.filter((it) => normalizeWord(it.word).length);
  const n = Math.max(1, items.length);
  const p = clamp(progress == null ? n : progress, 0, n);
  const rootRef = useRef<HTMLElement>(null);
  const [size, setSize] = useState({ w: 960, h: 540 });

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      const b = el.getBoundingClientRect();
      if (b.width && b.height) {
        setSize((s) => (Math.abs(s.w - b.width) < 1 && Math.abs(s.h - b.height) < 1 ? s : { w: Math.round(b.width), h: Math.round(b.height) }));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // callers pass fresh objects on every scroll frame, so the layout is keyed on their contents
  const words = items.map((it) => it.word);
  const key = JSON.stringify([words, origin, finish, wordBounds]);
  const layout = useMemo(
    () => buildRouteLayout(words, size, { wobbleIntensity, origin, finish, wordBounds }),
    [key, size.w, size.h, wobbleIntensity],
  );
  const cityEl = useMemo(
    () => <CityMap city={buildCity(layout.W, layout.H, layout.mobile ? 22 : 28, layout.keepOut)} />,
    [layout],
  );

  const idx = Math.min(Math.floor(p), n - 1);
  const t = p - idx;
  const route = layout.routes[idx];
  const f = route ? drawnFraction(t, route.wordEnd) : 0;
  const lineW = props.lineWidth || (layout.mobile ? 3 : 4);
  const doneOp = props.completedOpacity == null ? 0.32 : props.completedOpacity;
  const color = props.routeColor ? { stroke: props.routeColor } : undefined;
  const mk = layout.mobile ? 6 : 7;

  const layers: ReactNode[] = [];
  layout.routes.forEach((r, i) => {
    if (i >= idx) return;
    layers.push(<path key={"done" + i} className="route route-done" d={r.d} strokeWidth={lineW - 1} style={{ opacity: doneOp }} />);
  });
  layout.routes.forEach((r, i) => {
    if (i >= idx) return;
    layers.push(<circle key={"wp" + i} className="waypoint done" cx={r.dest[0]} cy={r.dest[1]} r={mk * 0.55} style={{ opacity: Math.max(doneOp, 0.6) }} />);
  });
  const finished = route && route.last && f >= 1;
  if (route) {
    layers.push(
      <path key="active" className="route route-active" d={route.d} strokeWidth={lineW} pathLength={1000} strokeDasharray="1000 1000" strokeDashoffset={1000 * (1 - f)} style={color} />,
    );
    const destOp = ramp(t, PHASES.word - 0.04, PHASES.word + 0.02);
    if (destOp > 0 && !route.last) {
      layers.push(
        <g key="ad" style={{ opacity: destOp }}>
          <circle className="dest-ring" cx={route.dest[0]} cy={route.dest[1]} r={mk} />
          <circle className="dest" cx={route.dest[0]} cy={route.dest[1]} r={mk * 0.42} />
        </g>,
      );
    }
    if (f > 0 && f < 1) {
      const hp = pointAt(route.pts, route.cum, f * route.total);
      layers.push(<circle key="head" className="head" cx={hp[0]} cy={hp[1]} r={mk * 0.7} />);
    }
  }
  const o = layout.origin, fz = layout.finish;
  const waiting = idx === 0 && f === 0;

  // popups: the current one opens as the route reaches its destination; the previous one closes as the next word starts
  const pops: ReactNode[] = [], leaders: ReactNode[] = [];
  if (idx > 0) {
    const prevOpen = 1 - ramp(t, 0, 0.12);
    const pr = layout.routes[idx - 1], ppl = popPlacement(layout, pr.dest, idx - 1);
    leaders.push(<Leader key="lp" dest={pr.dest} place={ppl} open={prevOpen} />);
    pops.push(<StepPopup key={"pop" + (idx - 1)} item={items[idx - 1]} dest={pr.dest} place={ppl} open={prevOpen} hidden />);
  }
  if (route) {
    const curOpen = ramp(t, PHASES.dest - 0.08, PHASES.dest);
    const cpl = popPlacement(layout, route.dest, idx);
    leaders.push(<Leader key="lc" dest={route.dest} place={cpl} open={curOpen} />);
    pops.push(<StepPopup key={"pop" + idx} item={items[idx]} dest={route.dest} place={cpl} open={curOpen} last={idx === n - 1} />);
  }

  return (
    <section
      ref={rootRef}
      className={cx("gr-rwm", layout.mobile && "is-mobile", props.className)}
      style={{ height: props.height || 540 }}
      aria-label={"Route: " + items.map((i) => normalizeWord(i.word)).join(" · ")}
    >
      <svg className="gr-rwm-map" width={layout.W} height={layout.H} viewBox={`0 0 ${layout.W} ${layout.H}`} aria-hidden="true">
        {cityEl}
        {leaders}
        {layers}
        {waiting ? <circle className="origin-pulse" cx={o[0]} cy={o[1]} r={mk * 1.1} /> : null}
        <circle className="origin" cx={o[0]} cy={o[1]} r={mk * 1.1} style={props.routeColor ? { fill: props.routeColor } : undefined} />
        <circle className="origin-core" cx={o[0]} cy={o[1]} r={mk * 0.42} />
        {finished ? (
          <g>
            <circle className="origin-pulse" cx={fz[0]} cy={fz[1]} r={mk * 1.2} />
            <circle className="origin" cx={fz[0]} cy={fz[1]} r={mk * 1.2} />
            <circle className="origin-core" cx={fz[0]} cy={fz[1]} r={mk * 0.45} />
          </g>
        ) : null}
      </svg>
      <div className="gr-rwm-pops" aria-live="polite">
        {pops}
      </div>
    </section>
  );
}
