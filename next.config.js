/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Remove the static export option which was causing issues with dynamic routes
  // output: 'export', 

  // Add any redirects if needed
  async redirects() {
    return [
      // You can add redirects if needed
    ];
  },
  
  // Add custom headers to disable SSR for specific routes if needed
  async headers() {
    return [
      {
        source: '/(account|settings|history)/:path*',
        headers: [
          {
            key: 'x-middleware-cache',
            value: 'no-cache',
          },
        ],
      },
    ];
  }
}

module.exports = nextConfig 