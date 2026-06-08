import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/modules", destination: "/learn", permanent: true },
      { source: "/modules/:slug", destination: "/learn/:slug", permanent: true },
      { source: "/preview/module-1", destination: "/learn/setup-and-first-build", permanent: true },
      { source: "/preview/:slug", destination: "/learn", permanent: true },
      { source: "/library", destination: "/learn", permanent: true },
      { source: "/library/:slug", destination: "/learn/:slug", permanent: true },
      { source: "/guides", destination: "/learn", permanent: true },
      { source: "/guides/:slug", destination: "/learn/:slug", permanent: true },
      { source: "/agents", destination: "/system", permanent: true },
      { source: "/waitlist", destination: "/pricing", permanent: false },
      { source: "/resources", destination: "/learn", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // Ensure the OpenAPI spec is bundled into the /api/docs serverless function
  // so `readFileSync` can find it at runtime.
  outputFileTracingIncludes: {
    "/api/docs": ["./docs/api/openapi.yaml"],
  },
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|png|webp|avif|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "0" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Content-Security-Policy-Report-Only",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://vercel.live",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.supabase.co https://*.googleusercontent.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com https://generativelanguage.googleapis.com https://va.vercel-scripts.com https://vitals.vercel-insights.com",
              "font-src 'self'",
              "frame-src 'self' https://stackblitz.com",
              "report-uri /api/csp-report",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  widenClientFileUpload: true,
  disableLogger: true,
});
