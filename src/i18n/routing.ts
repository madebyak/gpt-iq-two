import {defineRouting} from 'next-intl/routing';

/**
 * Define the supported locales and default locale for our application.
 * This configuration is used by the middleware and navigation APIs.
 * 
 * Arabic is set as the default language.
 */
export const routing = defineRouting({
  // Set supported locales in order of preference
  locales: ['ar', 'en'],
  
  // Use Arabic as the default language
  defaultLocale: 'ar'
});
