import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  devIndicators: false,
  allowedDevOrigins: [
    "127.0.0.1",
    "192.168.1.237",
    "*.ngrok-free.app"
  ],
  turbopack: {
    root: __dirname
  }
};

export default nextConfig;
