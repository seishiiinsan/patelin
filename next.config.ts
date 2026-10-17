import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Commune photos and postcards come from Wikimedia Commons thumbnails. next/image fetches
    // and caches them on our server, so browsers never call Wikimedia directly.
    remotePatterns: [
      new URL("https://thumb.wikimedia.org/wikipedia/commons/thumb/**"),
      new URL("https://upload.wikimedia.org/wikipedia/commons/**"),
    ],
    // Commons thumbnails never change at a given URL: keep optimized copies for 30 days.
    minimumCacheTTL: 2_592_000,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
