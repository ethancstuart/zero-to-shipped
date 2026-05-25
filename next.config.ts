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
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https://lh3.googleusercontent.com",
              "font-src 'self'",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://*.vercel-insights.com https://*.vercel-analytics.com https://*.sentry.io https://*.ingest.sentry.io",
              "frame-src 'self' https://js.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
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
