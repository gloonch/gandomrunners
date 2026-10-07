import { cx } from "@/lib/cx";
import { ICON_PATHS } from "./icon-paths";

/** `arrow-forward` is the logical "next": it points right in English and mirrors itself in Persian */
export type IconName = keyof typeof ICON_PATHS | "arrow-forward";

type IconProps = {
  name: IconName;
  size?: number;
  /** announced label; omit for decorative */
  label?: string;
  strokeWidth?: number;
  className?: string;
};

export function Icon({ name, size = 24, label, strokeWidth = 2, className }: IconProps) {
  const flip = name === "arrow-forward";
  const paths = ICON_PATHS[flip ? "arrow-right" : (name as keyof typeof ICON_PATHS)];
  if (!paths) return null;
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };
  return (
    <svg
      className={cx("gr-icon", flip && "gr-flip-rtl", className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      {...a11y}
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
