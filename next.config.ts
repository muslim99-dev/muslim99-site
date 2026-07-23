import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Quran JSON in public/quran_data is read from the filesystem only at
  // build time (SSG) and otherwise served as static assets. Exclude it from
  // server output file tracing so the ~128k data files aren't bundled.
  outputFileTracingExcludes: {
    "*": ["public/quran_data/**"],
  },
};

export default nextConfig;
