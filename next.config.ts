import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { buildLocaleRewrites } from "./src/i18n/routing";
import { assertValidEnvironment } from "./src/utils/env";

assertValidEnvironment();

// Non-production deployments (e.g. staging) must not be indexed by search engines.
const noIndex = process.env.SITE_NOINDEX === "true";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  async rewrites() {
    return { beforeFiles: buildLocaleRewrites(), afterFiles: [], fallback: [] };
  },
  async headers() {
    if (!noIndex) return [];
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  experimental: {
    optimizePackageImports: ["@base-ui/react", "date-fns"],
    serverActions: {
      allowedOrigins: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",")
        : undefined,
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        hostname: "*",
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();

export default withPayload(withNextIntl(nextConfig));
