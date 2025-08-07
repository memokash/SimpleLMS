

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use static export if you need it
  // output: 'export',
  
  // Handle build errors
  typescript: {
    // Only if you need to ignore TypeScript errors during build
    // ignoreBuildErrors: false,
  },
  
  eslint: {
    // Only if you need to ignore ESLint errors during build
    // ignoreDuringBuilds: false,
  },

  // Add experimental features if needed
  experimental: {
    // esmExternals: true,
  },

  // Improve build performance
  swcMinify: true,
  
  // Handle trailing slashes
  trailingSlash: false,
  
  // Ensure proper image handling
  images: {
    unoptimized: true, // Required for static export
  },
};

module.exports = nextConfig; 