import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: currentDir,
  },
  async rewrites() {
    return [
      {
        source: "/flutter",
        destination: "/flutter/index.html",
      },
      {
        source: "/flutter/:path*",
        destination: "/flutter/index.html",
      },
    ];
  },
};

export default nextConfig;
