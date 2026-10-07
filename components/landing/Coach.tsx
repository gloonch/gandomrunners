"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ds/Icon";
import { clamp } from "@/lib/route";
import { frameHeight, useScrollFrame, useViewport } from "@/lib/scroll";

const ease = (x: number) => {
  x = clamp(x, 0, 1);
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
};

/** Stadium → logo: the track turns into the logo in place while the section scrolls in, and on round while it scrolls out. */
export function Coach() {
  const ref = useRef<HTMLElement>(null);
  const [q, setQ] = useState(0);
  const { vw, vh } = useViewport();
  const mobile = vw < 768;
  const fh = frameHeight(vh);

  useScrollFrame(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect(), h = window.innerHeight || 820;
    const qIn = clamp((h - r.top) / h, 0, 1);           // 0 → 1 while the section scrolls in from the bottom
    const qOut = 1 - clamp(r.bottom / r.height, 0, 1);  // 0 → 1 while it scrolls out at the top
    setQ(qIn + qOut);                                   // 0 … 2
  });

  // stadium and logo turn together about one fixed centre: one revolution, never reversing
  const a = ease(Math.min(1, q)), bOut = ease(Math.max(0, q - 1));
  const rot = Math.round((90 - 90 * a - 270 * bOut) * 10) / 10;
  const logoVis = a * (1 - bOut);
  const boxH = mobile ? Math.round(vw * 0.56) : Math.min(Math.round(fh * 0.6), 520);
  // stadium and logo drawn at the SAME size: their outer ovals match through the cross-fade
  const imgH = Math.round(boxH * 1.25);
  const imgW = Math.round(imgH * 303 / 430);
  const logoH = Math.round(imgH * (414 / 430) / (383 / 403)); // the logo's drawn oval = the stadium's (crops differ by their padding)
  const boxW = imgH;
  // the shared centre sits a quarter of the horizontal stadium inside the edge, or further in
  // if the upright logo would otherwise be cut by the right edge
  const inset = Math.max(boxW / 4, logoH * (284 / 403) / 2 + 16);
  const bleed = Math.round(boxW / 2 - inset);
  const visible = boxW - bleed;
  const leftPad = mobile ? 16 : Math.min(80, Math.max(16, vw * 0.05));
  const copyW = Math.round(mobile ? vw - 32 : Math.max(280, Math.min(460, vw - visible - leftPad - 72)));

  return (
    <section ref={ref} id="coach" className="coach" style={{ height: fh }}>
      <div className="coach-stage">
        <div className="coach-mark" style={{ top: mobile ? "34%" : "50%", right: -bleed, width: boxW, height: boxH }}>
          <img
            src="/images/track.png"
            alt=""
            style={{ width: imgW, height: imgH, transform: `translate(-50%, -50%) rotate(${rot}deg)`, opacity: (1 - logoVis).toFixed(3) }}
          />
          <img
            src="/images/logo.png"
            alt="Gandom Runners logo"
            style={{ height: logoH, width: "auto", transform: `translate(-50%, -50%) rotate(${rot}deg)`, opacity: logoVis.toFixed(3) }}
          />
        </div>

        <div className={mobile ? "coach-copy is-bottom" : "coach-copy"} style={{ width: copyW }}>
          <div className="eyebrow">Coach-led</div>
          <h2>
            From the track
            <br />
            <span>to your own route.</span>
          </h2>
          <p>
            Gandom is an official athletics federation coach and the team’s manager. Her coaching goes past the body — fear, motivation, habits, and the confidence to keep showing up.
          </p>
          <div className="credential">
            <Icon name="rosette-discount-check" size={16} />
            Official Athletics Federation coach
          </div>
        </div>
      </div>
    </section>
  );
}
