import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

/**
 * This middleware handles internationalization routing:
 * - Detects the preferred locale based on URL and headers
 * - Redirects requests to the appropriate locale path
 * - Handles locale negotiation (e.g., / redirects to /ar by default)
 * 
 * Example: 
 * - /about redirects to /ar/about (since Arabic is default)
 * - /en/about remains as is
 */
export default createMiddleware({
  // A list of all locales that are supported
  locales,
  // The default locale to be used when visiting a non-locale prefixed path
  defaultLocale,
  // This is a list of paths that should not be internationalized
  localePrefix: 'as-needed',
  // Always redirect to the default locale path
  localeDetection: true
});

/**
 * Configure which routes should be processed by the middleware.
 * 
 * Specifically exclude:
 * - /api routes (API endpoints)
 * - /_next (Next.js internal routes)
 * - /_vercel (Vercel internal routes)
 * - Any path with a file extension (e.g., favicon.ico)
 */
export const config = {
  // Skip all paths that should not be internationalized
  matcher: [
    // Match all pathnames except for:
    // - Those starting with specified paths
    // - Those containing a dot (file extensions)
    '/((?!api|trpc|_next|_vercel|.*\\..*).*)' 
  ]
};
