/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin';

// Create the next-intl plugin
const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  // Add any other Next.js configuration options here
};

// Apply the next-intl plugin to the Next.js configuration
export default withNextIntl(nextConfig);
