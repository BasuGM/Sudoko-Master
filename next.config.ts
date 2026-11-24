import type { NextConfig } from "next";

const githubPages = process.env.GITHUB_PAGES === "true";
const pagesBasePath = process.env.NEXT_PUBLIC_BASE_PATH;

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  // A static export cannot run with cache components.
  cacheComponents: !githubPages,
  partialPrefetching: !githubPages,
  ...(githubPages
    ? {
        output: "export" as const,
        // GitHub Pages serves a folder's index.html, so /game/ must be a directory.
        trailingSlash: true,
        ...(pagesBasePath ? { basePath: pagesBasePath } : {}),
      }
    : {}),
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
