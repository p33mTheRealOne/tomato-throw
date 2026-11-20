import type { CSSProperties } from "react";
import TomatoArt from "./TomatoArt";

/** Cartoon tomato drawn in SVG (no image assets needed). */
export default function Tomato({ style, className }: { style?: CSSProperties; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden="true">
      <TomatoArt />
    </svg>
  );
}
