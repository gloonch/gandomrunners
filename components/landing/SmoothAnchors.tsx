"use client";

import { useEffect } from "react";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** Every in-page link (#top, #coach, #schedule, #contact) glides to its section instead of jumping. */
export function SmoothAnchors() {
  useEffect(() => {
    let glide = 0;
    const onClick = (ev: MouseEvent) => {
      const a = (ev.target as Element | null)?.closest?.('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href")!.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      ev.preventDefault();
      const offset = id === "schedule" ? 88 : 0; // clear the floating navbar where the section starts with copy
      const from = window.scrollY;
      const to = Math.max(0, from + target.getBoundingClientRect().top - offset);
      cancelAnimationFrame(glide);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.scrollTo(0, to);
        return;
      }
      const dur = Math.min(1500, Math.max(550, Math.abs(to - from) * 0.35)), t0 = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / dur);
        window.scrollTo(0, from + (to - from) * ease(k));
        if (k < 1) glide = requestAnimationFrame(step);
      };
      glide = requestAnimationFrame(step);
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      cancelAnimationFrame(glide);
    };
  }, []);
  return null;
}
