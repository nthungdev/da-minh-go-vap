/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
    loader: 'frontmatter-markdown-loader',
      options: { mode: ['react-component', 'body'] },
    })
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            // disable removing viewBox
            icon: true,
          },
        },
      ],
    })

    return config
  },
  redirects: async () => {
    return [
      {
        source: '/admin',
        destination: '/admin/index.html',
        permanent: false,
      },
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

export default nextConfig
