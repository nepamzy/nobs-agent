import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NOBS AGENT",
    short_name: "NOBS AGENT",
    description: "Full-stack software engineering studio, Kaduna, Nigeria, remote-first.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0d12",
    theme_color: "#e4b343",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
