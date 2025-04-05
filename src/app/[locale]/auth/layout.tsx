import { AuthNavbar } from "@/components/layout/auth-navbar";
import { getTranslations } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';

interface AuthLayoutProps {
  children: React.ReactNode;
  params: { 
    locale: string;
  };
}

export default async function AuthLayout({
  children,
  params
}: AuthLayoutProps) {
  // Get translations for components used in the auth pages
  const authNavbarT = await getTranslations('AuthNavbar');
  
  // Prepare client messages object - only include what the client needs
  const messages = {
    AuthNavbar: {
      backToHome: authNavbarT('backToHome'),
      help: authNavbarT('help'),
      privacy: authNavbarT('privacy'),
      disclaimer: authNavbarT('disclaimer')
    }
  };

  return (
    <NextIntlClientProvider locale={params.locale} messages={messages}>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background/90 to-primary/5">
        <AuthNavbar />
        <main className="flex-grow">
          {children}
        </main>
      </div>
    </NextIntlClientProvider>
  );
}
