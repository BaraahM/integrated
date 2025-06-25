/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
  // TODO: to be revised when all the CI/CD is done
  output: 'standalone',
  eslint: {
    // Disable ESLint during builds in production
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip type checking during builds in production
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
