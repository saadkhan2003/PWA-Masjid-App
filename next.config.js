/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use standalone for consistent build
  output: 'standalone',
  trailingSlash: true,
  images: {
    domains: ['supabase.co'],
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    esmExternals: 'loose',
  },
  // Configure build settings
  generateBuildId: () => 'build',
};

module.exports = nextConfig;