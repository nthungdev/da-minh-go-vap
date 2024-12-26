import { withPayload } from '@payloadcms/next/withPayload'
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      loader: 'frontmatter-markdown-loader',
      options: { mode: ['react-component', 'body'] },
    })

    return config
  },
  redirects: async () => {
    return [
      // TODO remove this redirect
      // {
      //   source: '/admin',
      //   destination: '/admin/index.html',
      //   permanent: false,
      // },
      {
        source: '/vocation',
        destination: '/vocation/introduction',
        permanent: true,
      },
    ]
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

export default withPayload(nextConfig)
