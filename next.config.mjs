/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (cfg) => {
    cfg.module.rules.push(
      {
        test: /\.md$/,
        loader: 'frontmatter-markdown-loader',
        options: { mode: ['react-component', 'body'] }
      }
    )
    return cfg
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
      }
    ]
  }
};

export default nextConfig;
