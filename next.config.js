/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'image.tmdb.org' },
      { protocol: 'https', hostname: 'media.rawg.io' },
    ],
    unoptimized: false,
  },
  eslint: { ignoreDuringBuilds: true },
}
module.exports = nextConfig
