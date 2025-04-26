/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin';

// Create the next-intl plugin
const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  // Add any other Next.js configuration options here
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        // port: '', // Optional: add if needed
        // pathname: '/a/**', // Optional: be more specific if needed
      },
      // Add other patterns here if needed
    ],
  },
};

// Apply the next-intl plugin to the Next.js configuration
export default withNextIntl(nextConfig);
