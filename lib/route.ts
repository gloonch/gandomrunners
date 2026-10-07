/* The RouteWordMap engine, ported from the Gandom Runners design system bundle:
   a seeded GPS wobble, the A–Z route alphabet, the route layout and the abstract city. */

export type Pt = [number, number];
export type Box = { x: number; y: number; width: number; height: number };
export type WordBounds = { desktop?: Box; mobile?: Box };

export function clamp(v: number, a: number, b: number) {
  return v < a ? a : v > b ? b : v;
}
export function ramp(t: number, a: number, b: number) {
  return clamp((t - a) / (b - a), 0, 1);
}

/* ---------- seeded noise (deterministic GPS wobble) ---------- */
export function hashSeed(str: string) {
  let s = 2166136261;
  for (let i = 0; i < str.length; i++) { s ^= str.charCodeAt(i); s = Math.imul(s, 16777619); }
  return s >>> 0;
}
/** returns a generator of values in [-1, 1) */
export function rng(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (((t ^ (t >>> 14)) >>> 0) / 4294967296) * 2 - 1;
  };
}

/* Each glyph is ONE continuous polyline on a 0..w × 0..6 grid (y down).
   Entry sits on the left edge, exit on the right edge, so letters chain
   through the gap "street" between them. Retracing is allowed — GPS routes do. */
export const ALPHABET: Record<string, { w: number; p: Pt[] }> = {
  A: { w: 4, p: [[0, 6], [0, 2], [2, 0], [4, 2], [4, 3], [0, 3], [4, 3], [4, 6]] },
  B: { w: 4, p: [[0, 6], [0, 0], [3, 0], [4, 1], [4, 2], [3, 3], [0, 3], [3, 3], [4, 4], [4, 5], [3, 6], [0, 6], [4, 6]] },
  C: { w: 4, p: [[0, 3], [0, 1], [1, 0], [4, 0], [1, 0], [0, 1], [0, 5], [1, 6], [4, 6]] },
  D: { w: 4, p: [[0, 6], [0, 0], [3, 0], [4, 1], [4, 5], [3, 6], [0, 6], [3, 6], [4, 5]] },
  E: { w: 4, p: [[0, 3], [3, 3], [0, 3], [0, 0], [4, 0], [0, 0], [0, 6], [4, 6]] },
  F: { w: 4, p: [[0, 6], [0, 0], [4, 0], [0, 0], [0, 3], [3, 3]] },
  G: { w: 4, p: [[0, 3], [0, 1], [1, 0], [4, 0], [1, 0], [0, 1], [0, 5], [1, 6], [4, 6], [4, 3], [2, 3], [4, 3]] },
  H: { w: 4, p: [[0, 0], [0, 6], [0, 3], [4, 3], [4, 0], [4, 6]] },
  I: { w: 2, p: [[0, 0], [2, 0], [1, 0], [1, 6], [0, 6], [2, 6]] },
  J: { w: 4, p: [[0, 4], [0, 5], [1, 6], [3, 6], [4, 5], [4, 0]] },
  K: { w: 4, p: [[0, 0], [0, 6], [0, 3], [1, 3], [4, 0], [1, 3], [4, 6]] },
  L: { w: 4, p: [[0, 0], [0, 6], [4, 6]] },
  M: { w: 5, p: [[0, 6], [0, 0], [2.5, 3], [5, 0], [5, 6]] },
  N: { w: 4, p: [[0, 6], [0, 0], [4, 6], [4, 0]] },
  O: { w: 4, p: [[0, 5], [0, 1], [1, 0], [3, 0], [4, 1], [4, 5], [3, 6], [1, 6], [0, 5], [1, 6], [3, 6], [4, 5]] },
  P: { w: 4, p: [[0, 6], [0, 0], [3, 0], [4, 1], [4, 2], [3, 3], [0, 3], [3, 3]] },
  Q: { w: 4, p: [[0, 5], [0, 1], [1, 0], [3, 0], [4, 1], [4, 5], [3, 6], [1, 6], [0, 5], [1, 6], [3, 6], [2, 4], [4, 6]] },
  R: { w: 4, p: [[0, 6], [0, 0], [3, 0], [4, 1], [4, 2], [3, 3], [0, 3], [1, 3], [4, 6]] },
  S: { w: 4, p: [[0, 5], [1, 6], [3, 6], [4, 5], [4, 4], [3, 3], [1, 3], [0, 2], [0, 1], [1, 0], [4, 0]] },
  T: { w: 4, p: [[0, 0], [2, 0], [2, 6], [2, 0], [4, 0]] },
  U: { w: 4, p: [[0, 0], [0, 5], [1, 6], [3, 6], [4, 5], [4, 0]] },
  V: { w: 4, p: [[0, 0], [2, 6], [4, 0]] },
  W: { w: 5, p: [[0, 0], [1, 6], [2.5, 2], [4, 6], [5, 0]] },
  X: { w: 4, p: [[0, 6], [4, 0], [2, 3], [0, 0], [4, 6]] },
  Y: { w: 4, p: [[0, 0], [2, 3], [2, 6], [2, 3], [4, 0]] },
  Z: { w: 4, p: [[0, 0], [4, 0], [0, 6], [4, 6]] },
};
const LETTER_H = 6, LETTER_GAP = 2;

export function normalizeWord(w: string | undefined) {
  return String(w || "").toUpperCase().replace(/[^A-Z]/g, "");
}

function wordWidth(word: string) {
  let w = 0, n = 0;
  for (const ch of word) { const g = ALPHABET[ch]; if (g) { w += g.w; n++; } }
  return w + Math.max(0, n - 1) * LETTER_GAP;
}

/** points (grid units) of a whole word starting at (x0, y0); letters joined through the gap street */
export function buildWordPoints(word: string, x0: number, y0: number): Pt[] {
  const pts: Pt[] = [];
  let x = x0, prev: Pt | null = null;
  for (const ch of String(word || "").toUpperCase()) {
    const g = ALPHABET[ch];
    if (!g) continue;
    const glyph = g.p.map((p): Pt => [x + p[0], y0 + p[1]]);
    if (prev) {
      const gx = x - LETTER_GAP / 2;
      pts.push([gx, prev[1]], [gx, glyph[0][1]]);
    }
    pts.push(...glyph);
    prev = glyph[glyph.length - 1];
    x += g.w + LETTER_GAP;
  }
  return pts;
}

function dedupe(pts: Pt[]) {
  const out: Pt[] = [];
  for (const p of pts) {
    const l = out[out.length - 1];
    if (!l || Math.abs(l[0] - p[0]) > 1e-6 || Math.abs(l[1] - p[1]) > 1e-6) out.push(p);
  }
  return out;
}

/** subdivide + seeded jitter: the whole line wobbles a little, ends stay put */
function gpsify(pts: Pt[], step: number, amp: number, seed: number) {
  const r = rng(seed), out: Pt[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const n = Math.max(1, Math.round(len / step));
    for (let k = 1; k <= n; k++) {
      const t = k / n;
      let x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
      const edge = i === pts.length - 1 && k === n;
      if (!edge) { x += r() * amp; y += r() * amp; }
      out.push([x, y]);
    }
  }
  return out;
}

function cumulative(pts: Pt[]) {
  const c = [0];
  for (let i = 1; i < pts.length; i++) c.push(c[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return c;
}
export function pointAt(pts: Pt[], cum: number[], d: number): Pt {
  const total = cum[cum.length - 1];
  d = clamp(d, 0, total);
  for (let i = 1; i < cum.length; i++) {
    if (cum[i] >= d) {
      const seg = cum[i] - cum[i - 1] || 1, t = (d - cum[i - 1]) / seg;
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t];
    }
  }
  return pts[pts.length - 1];
}
function toPath(pts: Pt[]) {
  return pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(2) + " " + p[1].toFixed(2)).join(" ");
}

/* ---------- route layout — one continuous route, one centred line per word ----------
   Item i's segment: start (origin, or the previous item's waypoint) → left lane → word i →
   right lane → down to the street under the line → its centre (waypoint i). The last item ends
   at `finish` (above the wordmark under the map) and pulses there. */
const WORD_BOUNDS = { desktop: { x: 25, y: 16, width: 50, height: 60 }, mobile: { x: 6, y: 14, width: 88, height: 42 } };
const DEFAULT_FINISH_Y = { desktop: 86, mobile: 56 };

export type Route = { word: string; d: string; pts: Pt[]; cum: number[]; total: number; wordEnd: number; dest: Pt; last: boolean };
export type RouteLayout = {
  mobile: boolean; origin: Pt; finish: Pt; routes: Route[]; W: number; H: number; u: number;
  blockLeft: number; blockRight: number; keepOut: [number, number, number, number][];
};
export type LayoutOptions = {
  wobbleIntensity?: number;
  origin?: { x: number; y: number };
  finish?: { x?: number; y?: number };
  wordBounds?: WordBounds;
};

export function buildRouteLayout(words: string[], size: { w: number; h: number }, opts: LayoutOptions = {}): RouteLayout {
  const W = size.w, H = size.h, mobile = W < 768;
  const wb = opts.wordBounds || {};
  const b = mobile ? (wb.mobile || WORD_BOUNDS.mobile) : (wb.desktop || WORD_BOUNDS.desktop);
  const bx = b.x / 100 * W, by = b.y / 100 * H, bw = b.width / 100 * W, bh = b.height / 100 * H;
  const cx = bx + bw / 2;
  const n = Math.max(1, words.length), rowH = bh / n;
  let widest = 1;
  words.forEach((w) => { widest = Math.max(widest, wordWidth(normalizeWord(w))); });
  const u = Math.min(bw / (widest + 2), (rowH * 0.6) / LETTER_H);
  const wobble = opts.wobbleIntensity == null ? 1 : opts.wobbleIntensity;
  const y0first = by + (rowH - LETTER_H * u) / 2;
  const origin: Pt = opts.origin ? [opts.origin.x / 100 * W, opts.origin.y / 100 * H] : [cx, Math.max(H * 0.03, y0first - 1.6 * u)];
  const fin = opts.finish || {};
  const finish: Pt = [fin.x != null ? fin.x / 100 * W : cx, (fin.y != null ? fin.y : (mobile ? DEFAULT_FINISH_Y.mobile : DEFAULT_FINISH_Y.desktop)) / 100 * H];
  let start = origin;
  const lines: [number, number, number, number][] = [];
  const routes = words.map((w, i): Route => {
    const word = normalizeWord(w);
    const ww = Math.max(1, wordWidth(word));
    const x0 = cx - ww * u / 2, y0 = by + i * rowH + (rowH - LETTER_H * u) / 2;
    lines.push([x0 - u, y0 - u * 0.6, ww * u + 2 * u, LETTER_H * u + 1.2 * u]);
    let wordPts = buildWordPoints(word, 0, 0).map((p): Pt => [x0 + p[0] * u, y0 + p[1] * u]);
    if (!wordPts.length) wordPts = [[x0, y0 + 3 * u]];
    const entry = wordPts[0], exit = wordPts[wordPts.length - 1];
    const xl = x0 - u, xr = x0 + ww * u + u;
    const under = by + (i + 1) * rowH;              // the street between this line and the next
    const last = i === words.length - 1;
    const lead: Pt[] = [start, [xl, start[1]], [xl, entry[1]]];
    const tail: Pt[] = last
      ? [[xr, exit[1]], [xr, under], [finish[0], under], finish]
      : [[xr, exit[1]], [xr, under], [cx, under]];
    const dest = tail[tail.length - 1];
    const raw = dedupe(lead.concat(wordPts, tail));
    const pts = gpsify(raw, Math.max(4, u * 0.45), u * 0.06 * wobble, hashSeed(word + i));
    pts[0] = [start[0], start[1]];                  // segments join exactly
    const cum = cumulative(pts);
    const headLen = cumulative(dedupe(lead.concat(wordPts)));
    const allLen = cumulative(raw);
    const wordEnd = headLen[headLen.length - 1] / (allLen[allLen.length - 1] || 1) || 0.85;
    start = dest;
    return { word, d: toPath(pts), pts, cum, total: cum[cum.length - 1], wordEnd, dest, last };
  });
  return {
    mobile, origin, finish, routes, W, H, u, blockLeft: bx, blockRight: bx + bw,
    keepOut: lines.concat([[finish[0] - 3 * u, finish[1] - 3 * u, 6 * u, 6 * u]]),
  };
}

/** 0–.10 start · .10–.70 lane + word · .70–.85 down to the waypoint · .85–1 hold */
export const PHASES = { start: 0.10, word: 0.70, dest: 0.85 };
export function drawnFraction(t: number, wordEnd: number) {
  if (t <= PHASES.start) return 0;
  if (t <= PHASES.word) return wordEnd * ((t - PHASES.start) / (PHASES.word - PHASES.start));
  if (t <= PHASES.dest) return wordEnd + (1 - wordEnd) * ((t - PHASES.word) / (PHASES.dest - PHASES.word));
  return 1;
}

/* ---------- static abstract city, built once per size ----------
   streets on a 2-cell block grid, broken alleys, parks (no street crosses them)
   and small X-marked buildings 1×1 / 1×2 / 2×1 */
export type City = { parks: [number, number, number, number][]; streets: string; alleys: string; avenues: string; buildings: string; g: number };

export function buildCity(W: number, H: number, g: number, keepOut: [number, number, number, number][]): City {
  const r = rng(11), cols = Math.ceil(W / g) + 1, rows = Math.ceil(H / g) + 1;
  const pick = (len: number) => Math.floor((r() + 1) / 2 * len) % len;
  function hitsKeepOut(c: number, rw: number, wc: number, hc: number) {
    const x = c * g, y = rw * g, w = wc * g, hh = hc * g;
    return keepOut.some((k) => x < k[0] + k[2] && x + w > k[0] && y < k[1] + k[3] && y + hh > k[1]);
  }
  const owner: Record<string, number> = {}; // "c,r" → park index
  function free(c: number, rw: number, wc: number, hc: number) {
    for (let a = c - 1; a < c + wc + 1; a++) for (let bb = rw - 1; bb < rw + hc + 1; bb++) if (owner[a + "," + bb] != null) return false;
    return c >= 0 && rw >= 0 && c + wc <= cols && rw + hc <= rows && !hitsKeepOut(c, rw, wc, hc);
  }
  const parks: [number, number, number, number][] = [];
  const shapes: Pt[] = [[2, 2], [4, 2], [2, 4], [4, 4], [6, 2]];
  const target = Math.max(4, Math.round(cols * rows / 140));
  for (let tries = 0; tries < 400 && parks.length < target; tries++) {
    const s = shapes[pick(shapes.length)];
    const c = 2 * Math.floor((r() + 1) / 2 * (cols / 2)), rw = 2 * Math.floor((r() + 1) / 2 * (rows / 2));
    if (!free(c, rw, s[0], s[1])) continue;
    for (let a = c; a < c + s[0]; a++) for (let bb = rw; bb < rw + s[1]; bb++) owner[a + "," + bb] = parks.length;
    parks.push([c, rw, s[0], s[1]]);
  }
  const inner = (c1: number, r1: number, c2: number, r2: number) => {
    const p = owner[c1 + "," + r1];
    return p != null && p === owner[c2 + "," + r2];
  };
  let streets = "", alleys = "", avenues = "";
  const seg = (x1: number, y1: number, x2: number, y2: number) => "M" + x1 + " " + y1 + "L" + x2 + " " + y2;
  const keepAlley: Record<string, boolean> = {};
  for (let k = 0; k <= cols; k++) {
    const cls = k % 6 === 3 ? "av" : k % 2 === 0 ? "st" : "al";
    for (let a = 0; a < rows; a++) {
      if (inner(k - 1, a, k, a)) continue;
      if (cls === "al") {
        const key = "v" + k + "_" + (a >> 1);
        if (keepAlley[key] == null) keepAlley[key] = r() > -0.6;
        if (!keepAlley[key]) continue;
      }
      const d = seg(k * g, a * g, k * g, (a + 1) * g);
      if (cls === "av") avenues += d; else if (cls === "st") streets += d; else alleys += d;
    }
  }
  for (let k = 0; k <= rows; k++) {
    const cls = k % 6 === 3 ? "av" : k % 2 === 0 ? "st" : "al";
    for (let a = 0; a < cols; a++) {
      if (inner(a, k - 1, a, k)) continue;
      if (cls === "al") {
        const key = "h" + k + "_" + (a >> 1);
        if (keepAlley[key] == null) keepAlley[key] = r() > -0.6;
        if (!keepAlley[key]) continue;
      }
      const d = seg(a * g, k * g, (a + 1) * g, k * g);
      if (cls === "av") avenues += d; else if (cls === "st") streets += d; else alleys += d;
    }
  }
  // buildings: a plan-style rectangle with an X, inset inside its cells
  let bld = "";
  const taken: Record<string, 1> = {}, sizes: Pt[] = [[1, 1], [1, 1], [1, 2], [2, 1]];
  const nB = Math.round(cols * rows / 26);
  for (let t = 0, placed = 0; t < nB * 8 && placed < nB; t++) {
    const sz = sizes[pick(sizes.length)];
    // a 2×1 / 1×2 building must sit inside one 2×2 block so no street crosses it
    let bc = Math.floor((r() + 1) / 2 * cols), br = Math.floor((r() + 1) / 2 * rows);
    if (sz[0] === 2) bc = bc & ~1;
    if (sz[1] === 2) br = br & ~1;
    let clash = false;
    for (let a = bc; a < bc + sz[0]; a++) for (let b = br; b < br + sz[1]; b++) if (owner[a + "," + b] != null || taken[a + "," + b]) clash = true;
    if (clash || hitsKeepOut(bc, br, sz[0], sz[1])) continue;
    for (let a = bc; a < bc + sz[0]; a++) for (let b = br; b < br + sz[1]; b++) taken[a + "," + b] = 1;
    const pad = g * 0.2, x = bc * g + pad, y = br * g + pad, w = sz[0] * g - 2 * pad, hh = sz[1] * g - 2 * pad;
    bld += "M" + x + " " + y + "h" + w + "v" + hh + "h" + (-w) + "Z" + "M" + x + " " + y + "l" + w + " " + hh + "M" + (x + w) + " " + y + "l" + (-w) + " " + hh;
    placed++;
  }
  return { parks, streets, alleys, avenues, buildings: bld, g };
}
