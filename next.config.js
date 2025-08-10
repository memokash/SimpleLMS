

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  swcMinify: true,
  compress: true,
  
  // Handle trailing slashes
  trailingSlash: false,
  
  // Image optimization for production
  images: {
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
    formats: ['image/webp', 'image/avif'],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
        ],
      },
    ];
  },

  // Environment-specific settings
  env: {
    CUSTOM_KEY: process.env.NODE_ENV,
  },

  // Build-time optimizations
  experimental: {
    scrollRestoration: true,
  },
};

module.exports = nextConfig; 