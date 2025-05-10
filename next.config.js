/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  output: 'export', // Use static export for all pages
  // Optional: Add redirects if you need specific routing behavior
  async redirects() {
    return [
      // You can add redirects if needed
    ];
  }
}

module.exports = nextConfig 