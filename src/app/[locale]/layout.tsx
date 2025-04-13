import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Sans_Arabic } from "next/font/google";
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import "../globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";
import ClientProviders from "@/components/providers/client-providers";

// Load IBM Plex Sans for Latin (English) text
const ibmPlexSans = IBM_Plex_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ibm-plex-sans",
});

// Load IBM Plex Sans Arabic for Arabic text
const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-ibm-plex-sans-arabic",
});

// Generate static metadata
export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  // Use the locale to determine appropriate metadata
  const isArabic = params.locale === 'ar';

  return {
    title: isArabic 
      ? "منصة GPT IQ للذكاء الاصطناعي" 
      : "GPT IQ - Advanced AI Chat Platform",
    description: isArabic
      ? "تجربة محادثات أكثر ذكاءً مع منصتنا المتقدمة للذكاء الاصطناعي"
      : "Experience smarter conversations with our advanced AI chat platform",
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}

// Generate static parameters for all locales
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Helper function to pick specific keys from an object
function pick(obj: Record<string, any>, keys: string[]): Record<string, any> {
  return keys.reduce((acc, key) => {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {} as Record<string, any>);
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate that the incoming locale is supported
  const locale = params.locale;
  
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Determine text direction based on locale
  const isRtl = locale === 'ar';

  // Load all messages for the locale
  const messages = (await import(`../../../messages/${locale}.json`)).default;

  // Select only the messages needed by global client components using the local pick function
  const globalMessages = pick(messages, ['ThemeToggle', 'UserDropdown', 'Navbar', 'Common']);

  return (
    <html 
      lang={locale} 
      dir={isRtl ? "rtl" : "ltr"} 
      suppressHydrationWarning
      className={cn(
        isRtl && "rtl"
      )}
    >
      <body className={cn(
        `${ibmPlexSans.variable} ${ibmPlexSansArabic.variable} antialiased min-h-screen flex flex-col`,
        // Use appropriate font family based on locale
        isRtl ? "font-ibm-plex-sans-arabic" : "font-sans"
      )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {/* Provide only essential global translations */}
          <ClientProviders messages={globalMessages} locale={locale}>
            <div className="flex flex-col min-h-screen">
              {/* The Navbar component will be imported in the page files */}
              <div className="flex-grow">
                {children}
              </div>
            </div>
          </ClientProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
