"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ds/Icon";
import { MESSAGE_HREF } from "@/lib/content";
import { cx } from "@/lib/cx";
import { useScrollFrame } from "@/lib/scroll";

const LINKS = [
  { id: "top", num: "01", label: "Route" },
  { id: "coach", num: "02", label: "Coach" },
  { id: "schedule", num: "03", label: "Schedule" },
] as const;
type LinkId = (typeof LINKS)[number]["id"];

/** Floating glass navbar; a dark pill slides under the link of the section in view. */
export function Nav() {
  const linkRefs = useRef<Partial<Record<LinkId, HTMLAnchorElement | null>>>({});
  const [active, setActive] = useState<LinkId>("top");
  const [pill, setPill] = useState({ x: 0, w: 0 });

  useScrollFrame(() => {
    const probe = window.innerHeight * 0.45;
    const reached = (id: string) => (document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) <= probe;
    // the final CTA has no link of its own: it keeps "Schedule" lit
    const next: LinkId = reached("schedule") ? "schedule" : reached("coach") ? "coach" : "top";
    setActive(next);
    const link = linkRefs.current[next];
    if (link && link.offsetWidth) {
      const x = link.offsetLeft, w = link.offsetWidth;
      setPill((p) => (p.x === x && p.w === w ? p : { x, w }));
    }
  });

  return (
    <div className="nav-dock">
      <nav className="nav glass" aria-label="Main">
        <a className="nav-brand" href="#top" aria-label="Gandom Runners — home">
          <img src="/images/logo.png" alt="" />
          <span className="brand-name">Gandom Runners</span>
        </a>
        <div className="nav-links">
          <span className="nav-pill" aria-hidden="true" style={{ left: pill.x, width: pill.w, opacity: pill.w ? 1 : 0 }} />
          {LINKS.map((l) => (
            <a
              key={l.id}
              ref={(el) => { linkRefs.current[l.id] = el; }}
              className={cx("nav-link", active === l.id && "on")}
              href={"#" + l.id}
              aria-current={active === l.id ? "location" : undefined}
            >
              <span className="dot" />
              <span className="num">{l.num}</span>
              {l.label}
            </a>
          ))}
        </div>
        <a className="nav-cta" href={MESSAGE_HREF} aria-label="Message us on Instagram">
          <Icon name="brand-instagram" size={20} />
          <span className="cta-long">Message on Instagram</span>
          <span className="cta-short">Message</span>
        </a>
      </nav>
    </div>
  );
}
