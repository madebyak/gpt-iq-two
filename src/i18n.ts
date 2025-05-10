import { getRequestConfig } from 'next-intl/server';

// Define the locales supported by the application
export const locales = ['ar', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ar';

export const defaultTimeZone = "UTC"; // Or your desired default time zone

// Create the configuration for next-intl
export default getRequestConfig(async ({ locale }) => {
  // Validate locale
  const validLocale = locales.includes(locale as Locale) ? locale as Locale : defaultLocale;

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default,
    timeZone: defaultTimeZone
  };
}); 