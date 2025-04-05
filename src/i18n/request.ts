import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';

/**
 * This configuration is used for Server Components to access translations.
 * 
 * It loads the appropriate message file based on the locale in the URL
 * and provides time/date/number formatting settings.
 */
export default getRequestConfig(async ({requestLocale}) => {
  // Get locale from request (typically from URL path parameter)
  const requested = await requestLocale;
  
  // Validate the locale is supported, otherwise use default
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    // Set the active locale for this request
    locale,
    
    // Load the appropriate translation messages file
    messages: (await import(`../../messages/${locale}.json`)).default,
    
    // Configure time/date/number formatting
    timeZone: 'Asia/Baghdad', // Iraq timezone for appropriate date/time formatting
    now: new Date(),
    
    // Configure number formatting for currencies, etc.
    formats: {
      number: {
        currency: {
          style: 'currency',
          currency: 'IQD' // Iraqi Dinar
        }
      }
    }
  };
});
