import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const s3RemotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] =
  [];

if (process.env.S3_ENDPOINT) {
  try {
    const s3Url = new URL(process.env.S3_ENDPOINT);
    const protocol =
      s3Url.protocol === "http:" || s3Url.protocol === "https:"
        ? (s3Url.protocol.replace(":", "") as "http" | "https")
        : undefined;

    const hostnames = new Set<string>();
    if (
      s3Url.hostname &&
      s3Url.hostname !== "cdn.dongdaminhgovap.org" &&
      s3Url.hostname !== "dongdaminhgovap.org"
    ) {
      hostnames.add(s3Url.hostname);
      if (
        process.env.S3_BUCKET &&
        !s3Url.hostname.startsWith(`${process.env.S3_BUCKET}.`)
      ) {
        hostnames.add(`${process.env.S3_BUCKET}.${s3Url.hostname}`);
      }
    }

    for (const hostname of hostnames) {
      s3RemotePatterns.push({
        protocol,
        hostname,
        port: s3Url.port || undefined,
      });
    }
  } catch {
    // Ignore invalid S3_ENDPOINT URL
  }
}

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",")
        : undefined,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.dongdaminhgovap.org",
      },
      {
        protocol: "https",
        hostname: "dongdaminhgovap.org",
      },
      ...s3RemotePatterns,
    ],
  },
};

const withNextIntl = createNextIntlPlugin();

export default withPayload(withNextIntl(nextConfig));
