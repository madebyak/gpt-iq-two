import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * Create locale-aware navigation APIs using the routing configuration.
 * 
 * These wrapper components and functions automatically handle locale prefixes in URLs:
 * - Link: A wrapper around Next.js Link that preserves the current locale
 * - redirect: Redirects to another page while preserving the locale
 * - usePathname: Returns the current pathname without the locale prefix
 * - useRouter: Router that preserves the locale when navigating
 * - getPathname: Gets a pathname for a specific locale
 */
export const {
  Link,
  redirect,
  usePathname,
  useRouter,
  getPathname
} = createNavigation(routing);
