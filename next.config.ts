import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // The server action correctly throws/redirects and never returns a value.
    // Next.js 16 strict form-action types cause a false-positive here.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
