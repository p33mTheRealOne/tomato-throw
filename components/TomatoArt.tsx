import type { ReactElement } from "react";

/**
 * The tomato drawing as a plain array of SVG elements, so non-React-DOM renderers (the OG image
 * renderer only accepts intrinsic elements inside <svg>) can use it too.
 */
export function tomatoElements(gradientId = "tm-body"): ReactElement[] {
  return [
    <defs key="defs">
      <radialGradient id={gradientId} cx="38%" cy="32%" r="75%">
        <stop offset="0%" stopColor="#ff8a73" />
        <stop offset="35%" stopColor="#f0392a" />
        <stop offset="100%" stopColor="#9e0f0c" />
      </radialGradient>
    </defs>,
    <path
      key="body"
      d="M50 22 C72 12 96 28 95 54 C94 78 74 94 50 94 C26 94 6 78 5 54 C4 28 28 12 50 22 Z"
      fill={`url(#${gradientId})`}
      stroke="#6d0907"
      strokeWidth="2.5"
    />,
    <ellipse key="shine" cx="31" cy="38" rx="11" ry="6.5" fill="#fff" opacity="0.55" transform="rotate(-35 31 38)" />,
    <g key="leaves" fill="#2f9e3a" stroke="#1b6a24" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M50 24 L40 10 L47 21 L36 16 L45 26 Z" />
      <path d="M50 24 L60 10 L53 21 L64 16 L55 26 Z" />
      <path d="M50 25 L28 24 L42 30 Z" />
      <path d="M50 25 L72 24 L58 30 Z" />
      <path d="M44 27 L56 27 L50 38 Z" />
    </g>,
    <path key="stem" d="M50 22 L51 6" stroke="#1b6a24" strokeWidth="4" strokeLinecap="round" />,
  ];
}

export default function TomatoArt({ gradientId = "tm-body" }: { gradientId?: string }) {
  return <>{tomatoElements(gradientId)}</>;
}
