import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { buildLocaleRewrites } from "./src/i18n/routing";
import { assertValidEnvironment } from "./src/utils/env";

assertValidEnvironment();

// Non-production deployments (e.g. staging) must not be indexed by search engines.
const noIndex = process.env.SITE_NOINDEX === "true";

type RemotePattern = NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
>[number];

const FIXED_IMAGE_HOSTS = new Set([
  "cdn.dongdaminhgovap.org",
  "dongdaminhgovap.org",
]);

function addRemotePatternsFromUrl(
  patterns: RemotePattern[],
  rawUrl: string | undefined,
  includeBucketSubdomain = false,
) {
  if (!rawUrl) return;
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return;
    const protocol = parsed.protocol.replace(":", "") as "http" | "https";

    const hostnames = new Set<string>();
    if (parsed.hostname && !FIXED_IMAGE_HOSTS.has(parsed.hostname)) {
      hostnames.add(parsed.hostname);
      if (
        includeBucketSubdomain &&
        process.env.S3_BUCKET &&
        !parsed.hostname.startsWith(`${process.env.S3_BUCKET}.`)
      ) {
        hostnames.add(`${process.env.S3_BUCKET}.${parsed.hostname}`);
      }
    }

    for (const hostname of hostnames) {
      const exists = patterns.some(
        (p) =>
          p.protocol === protocol &&
          p.hostname === hostname &&
          p.port === (parsed.port || undefined),
      );
      if (!exists) {
        patterns.push({
          protocol,
          hostname,
          port: parsed.port || undefined,
        });
      }
    }
  } catch {
    // Ignore invalid URL
  }
}

const dynamicRemotePatterns: RemotePattern[] = [];
addRemotePatternsFromUrl(dynamicRemotePatterns, process.env.S3_ENDPOINT, true);
addRemotePatternsFromUrl(
  dynamicRemotePatterns,
  process.env.NEXT_PUBLIC_MEDIA_CDN_URL,
);
addRemotePatternsFromUrl(
  dynamicRemotePatterns,
  process.env.NEXT_PUBLIC_BASE_URL,
);
addRemotePatternsFromUrl(dynamicRemotePatterns, process.env.S3_PUBLIC_URL);

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
        protocol: "https",
        hostname: "cdn.dongdaminhgovap.org",
      },
      {
        protocol: "https",
        hostname: "dongdaminhgovap.org",
      },
      ...dynamicRemotePatterns,
    ],
  },
};

const withNextIntl = createNextIntlPlugin();

export default withPayload(withNextIntl(nextConfig));
