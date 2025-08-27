import { withPayload } from "@payloadcms/next/withPayload";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  turbopack: {
    rules: {
      "*.md": {
        as: "*.js",
        loaders: [
          {
            loader: "frontmatter-markdown-loader",
            options: {
              mode: ["react-component", "html", "body", "meta"],
            },
          },
        ],
      },
    },
  },
  experimental: {
    serverActions: {
      allowedOrigins: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",")
        : undefined,
    },
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      loader: "frontmatter-markdown-loader",
      options: { mode: ["react-component", "body"] },
    });

    return config;
  },
  images: {
    remotePatterns: [
      // {
      //   protocol: 'https',
      //   hostname: 'res.cloudinary.com',
      // },
      {
        hostname: "*",
      },
    ],
  },
};

export default withPayload(
  withFlowbiteReact(nextConfig, {
    devBundleServerPackages: false,
  }),
);
