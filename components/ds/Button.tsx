import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Icon, type IconName } from "./Icon";

type ButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** primary = orange CTA, dark = Instagram DM, secondary = outline, ghost = inline link */
  variant?: "primary" | "secondary" | "dark" | "ghost";
  size?: "md" | "lg";
  href: string;
  /** trailing icon */
  icon?: IconName;
  children?: ReactNode;
};

/** Pill-shaped call to action; the only way the site asks for anything. */
export function Button({ variant = "primary", size = "md", icon, children, className, ...rest }: ButtonProps) {
  return (
    <a {...rest} className={cx("gr-btn", `gr-btn-${variant}`, size === "lg" && "gr-btn-lg", className)}>
      {children}
      {icon ? <Icon name={icon} size={18} /> : null}
    </a>
  );
}
