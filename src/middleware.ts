import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/verify-email',
  // Add other public routes
];

// Define protected routes that require authentication
const PROTECTED_ROUTES = [
  '/account',
  '/history',
  '/settings',
  '/chat',
  // Add other protected routes
];

/**
 * This middleware handles both internationalization routing and authentication:
 * - Detects the preferred locale based on URL and headers
 * - Redirects requests to the appropriate locale path
 * - Handles locale negotiation (e.g., / redirects to /ar by default)
 * - Validates authentication for protected routes
 * - Redirects unauthenticated users to login
 */
async function middleware(request: NextRequest) {
  // Create the internationalization middleware
  const intlMiddleware = createIntlMiddleware({
    locales,
    defaultLocale,
    localePrefix: 'always',
    localeDetection: false
  });
  
  // Get the pathname without the locale prefix
  const pathname = request.nextUrl.pathname;
  
  // Get the locale from the pathname
  const locale = locales.find(locale => 
    pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  ) || defaultLocale;
  
  // Check if the route requires authentication
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname === `/${locale}${route}` || 
    pathname.startsWith(`/${locale}${route}/`)
  );
  
  // Allow public routes to proceed with just i18n handling
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === `/${locale}${route}` || 
    pathname.startsWith(`/${locale}${route}/`)
  );
  
  // If it's not a protected route, just handle i18n
  if (!isProtectedRoute) {
    return intlMiddleware(request);
  }
  
  // For protected routes, check authentication
  try {
    // Create a Supabase client for the request
    const supabase = createClient();
    
    // Get the session
    const { data: { session } } = await supabase.auth.getSession();
    
    // If there's a session, allow the request to proceed with i18n handling
    if (session) {
      return intlMiddleware(request);
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
  }
  
  // No session, redirect to login with the return URL
  const url = request.nextUrl.clone();
  
  // Redirect to the login page with the return URL
  url.pathname = `/${locale}/auth/login`;
  url.searchParams.set('returnUrl', pathname);
  
  return NextResponse.redirect(url);
}

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
  // Skip all paths that should not be internationalized or protected
  matcher: [
    // Match all pathnames except for:
    // - Those starting with specified paths
    // - Those containing a dot (file extensions)
    '/((?!api|trpc|_next|_vercel|.*\\..*).*)' 
  ]
};

export default middleware;
