import type { ReactNode } from "react";

/** Uppercase English kicker above a title, in route-orange-text. */
export function Eyebrow({ children }: { children?: ReactNode }) {
  return <span className="gr-eyebrow">{children}</span>;
}
