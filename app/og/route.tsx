import { ImageResponse } from "next/og";
import { tomatoElements } from "@/components/TomatoArt";
import { OG_SIZE, OgSplat, loadAnton } from "@/lib/og";

export const runtime = "nodejs";

/** OG image for the home page. */
export async function GET() {
  const font = await loadAnton();
  return new ImageResponse(
    (
      <div style={{ display: "flex", position: "relative", width: OG_SIZE.width, height: OG_SIZE.height, background: "#f3ead7", overflow: "hidden", fontFamily: "Anton" }}>
        <OgSplat seed={42} size={270} x={1135} y={95} rot={200} />
        <OgSplat seed={77} size={300} x={60} y={560} rot={95} />
        <OgSplat seed={11} size={170} x={1148} y={590} rot={20} />
        <OgSplat seed={5} size={210} x={470} y={40} rot={300} />

        <div style={{ display: "flex", position: "absolute", left: 60, top: 150, width: 360, height: 360, transform: "rotate(-10deg)" }}>
          <svg width="360" height="360" viewBox="0 0 100 100">
            {tomatoElements()}
          </svg>
        </div>

        <div style={{ display: "flex", flexDirection: "column", position: "absolute", left: 480, top: 110, color: "#141210" }}>
          <div style={{ display: "flex", fontSize: 200, lineHeight: 0.92, letterSpacing: 2 }}>TOMATO</div>
          <div style={{ display: "flex", fontSize: 200, lineHeight: 0.92, letterSpacing: 2, color: "#e2291d" }}>THROW</div>
          <div style={{ display: "flex", fontSize: 36, letterSpacing: 2, marginTop: 28 }}>UPLOAD ANY PIC. THROW TOMATOES AT IT.</div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: [{ name: "Anton", data: font, weight: 400, style: "normal" }], headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400" } },
  );
}
