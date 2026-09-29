import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { assertValidEnvironment } from "./src/utils/env";

assertValidEnvironment();

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
        hostname: "*",
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();

export default withPayload(withNextIntl(nextConfig));
