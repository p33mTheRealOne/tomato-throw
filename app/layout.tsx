import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "🍅 THROW TOMATO — ปามะเขือเทศใส่รูปอะไรก็ได้",
  description: "อัปโหลดรูป สร้างเว็บ แล้วปามะเขือเทศใส่ได้เลย",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffe600",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
