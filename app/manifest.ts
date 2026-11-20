import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tomato Throw",
    short_name: "Tomato Throw",
    description: "Upload any picture, get a link, throw tomatoes at it.",
    start_url: "/",
    display: "standalone",
    background_color: "#f3ead7",
    theme_color: "#f3ead7",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
