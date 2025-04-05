import { getRequestConfig } from 'next-intl/server';
 
// Define the locales supported by the application
export const locales = ['ar', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ar';
 
// Create the configuration for next-intl
export default getRequestConfig(async ({ locale }) => {
  // If locale is undefined or not in our list, use default
  const validLocale: Locale = (locale && locales.includes(locale as Locale)) 
    ? (locale as Locale) 
    : defaultLocale;
  
  // Import the messages for the locale
  return {
    locale: validLocale, // This is now guaranteed to be a valid string
    messages: (await import(`../../messages/${validLocale}.json`)).default
  };
});
