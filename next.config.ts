import type { NextConfig } from "next";

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://accounts.google.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://*.supabase.co https://*.supabase.in https://js.stripe.com https://*.vercel.app https://app.kitface.app;
  font-src 'self' data:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  frame-src 'self' https://js.stripe.com https://accounts.google.com;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://accounts.google.com https://vitals.vercel-insights.com;
`.replace(/\s{2,}/g, " ").trim();

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
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=*, microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
        ],
      },
    ];
  }
};

export default nextConfig;
