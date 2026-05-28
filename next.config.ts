import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.config.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https' as const, hostname: 'images.unsplash.com' },
      { protocol: 'https' as const, hostname: 'images.pexels.com' },
      { protocol: 'https' as const, hostname: 'me7aitdbxq.ufs.sh' },
      { protocol: 'https' as const, hostname: 'pub-d7644b642eac47ff870ffc1898696475.r2.dev' },
    ],
  },
};

export default withNextIntl(nextConfig);