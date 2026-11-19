import type { Metadata, Viewport } from "next";
import "@fontsource/anton/latin-400.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tomato Throw",
  description: "Upload any picture, get a link, throw tomatoes at it.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f3ead7",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
