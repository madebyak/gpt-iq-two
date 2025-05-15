import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, IBM_Plex_Sans_Arabic } from "next/font/google";
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import "../globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";
import ClientProviders from "@/components/providers/client-providers";
import React from 'react';
import { OnboardingTrigger } from '@/components/onboarding/OnboardingTrigger';
import { Toaster } from 'react-hot-toast';

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

// Generate viewport configuration
export function generateViewport({ params }: { params: { locale: string } }): Viewport {
  return {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
    interactiveWidget: 'resizes-content',
  };
}

// Generate static parameters for all locales
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Make function async again
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

  // Restore message loading
  const messages = (await import(`../../../messages/${locale}.json`)).default;
  const localeMessages = messages;

  return (
    <html 
      lang={locale} 
      dir={isRtl ? "rtl" : "ltr"} 
      suppressHydrationWarning
      className={cn(
        isRtl && "rtl",
        "h-full"
      )}
    >
      <body className={cn(
        `${ibmPlexSans.variable} ${ibmPlexSansArabic.variable} antialiased h-full flex flex-col`,
        isRtl ? "font-ibm-plex-sans-arabic" : "font-sans"
      )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <ClientProviders messages={localeMessages} locale={locale}>
            <Toaster position="top-center" reverseOrder={false} />
            <div className="flex flex-col h-full">
              <div className="flex-grow">
                {children}
              </div>
              <OnboardingTrigger />
            </div>
          </ClientProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
