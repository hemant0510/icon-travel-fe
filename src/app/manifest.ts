import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Icon Fly - Travel Booking",
    short_name: "Icon Fly",
    description:
      "Book flights, hotels, and cabs at the best prices with Icon Fly",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#1a56db",
    icons: [
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  };
}
