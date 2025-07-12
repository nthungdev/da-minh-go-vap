import { withPayload } from '@payloadcms/next/withPayload'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      loader: 'frontmatter-markdown-loader',
      options: { mode: ['react-component', 'body'] },
    })

    return config
  },
  images: {
    remotePatterns: [
      // {
      //   protocol: 'https',
      //   hostname: 'res.cloudinary.com',
      // },
      {
        hostname: '*',
      },
    ],
  },
}

export default withPayload(nextConfig, {
  devBundleServerPackages: false
})
