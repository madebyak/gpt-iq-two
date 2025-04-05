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

  // Extract only the essential messages for global layout components
  // This keeps the client-side bundle smaller
  const essentialMessages = {
    ThemeToggle: messages.ThemeToggle,
  };

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
          {/* Provide translations to client components */}
          <ClientProviders messages={essentialMessages} locale={locale}>
            <div className="flex flex-col min-h-screen">
              {/* The Navbar component will be imported in the page files */}
              <div className="flex-grow">
                {children}
              </div>
              <footer className="py-6 md:py-0 md:px-8 md:h-16 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
                  <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                    2023 GPT IQ. {isRtl ? "جميع الحقوق محفوظة." : "All rights reserved."}
                  </p>
                  <div className="flex items-center gap-4">
                    <a
                      href="/terms"
                      className="text-sm font-medium underline-offset-4 hover:underline text-muted-foreground"
                    >
                      {isRtl ? "الشروط والأحكام" : "Terms & Conditions"}
                    </a>
                    <a
                      href="/privacy"
                      className="text-sm font-medium underline-offset-4 hover:underline text-muted-foreground"
                    >
                      {isRtl ? "سياسة الخصوصية" : "Privacy Policy"}
                    </a>
                  </div>
                </div>
              </footer>
            </div>
          </ClientProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
