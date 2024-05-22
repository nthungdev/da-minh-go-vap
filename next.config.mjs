/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (cfg) => {
    cfg.module.rules.push(
      {
        test: /\.md$/,
        loader: 'frontmatter-markdown-loader',
        options: { mode: ['react-component'] }
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
      // {
      //   source: '/',
      //   has: [{ type: 'query', key: '#invite_token' }],
      //   destination: '/admin/index.html',
      //   permanent: true,
      // },
      // {
      //   source: '/#',
      //   has: [{ type: 'query', key: 'confirmation_token' }],
      //   destination: '/admin/index.html',
      //   permanent: true,
      // },
      // {
      //   source: '/#',
      //   has: [{ type: 'query', key: 'invite_token' }],
      //   destination: '/admin/index.html',
      //   permanent: true,
      // },
    ]
  },
};

export default nextConfig;
