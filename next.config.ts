import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
};

export default nextConfig;
