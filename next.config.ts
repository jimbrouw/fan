import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  devIndicators: false,
  turbopack: {
    root: __dirname
  }
};

export default nextConfig;
