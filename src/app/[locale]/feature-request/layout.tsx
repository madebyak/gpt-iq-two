import { getTranslations } from 'next-intl/server';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { NextIntlClientProvider } from 'next-intl';
import NavbarClient from '@/components/layout/navbar-client';

export default async function FeatureRequestLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const navbarT = await getTranslations('Navbar');
  const themeToggleT = await getTranslations('ThemeToggle');
  const featureRequestT = await getTranslations('FeatureRequest');

  // Prepare client messages
  const clientMessages = {
    Navbar: {
      newChat: navbarT('newChat'),
      resources: navbarT('resources'),
      sponsorship: navbarT('sponsorship'),
      changelog: navbarT('changelog'),
      changelogDescription: navbarT('changelogDescription'),
      featureRequest: navbarT('featureRequest'),
      featureRequestDescription: navbarT('featureRequestDescription'),
      aboutUs: navbarT('aboutUs'),
      aboutUsDescription: navbarT('aboutUsDescription'),
      signIn: navbarT('signIn'),
      getStarted: navbarT('getStarted')
    },
    ThemeToggle: {
      light: themeToggleT('light'),
      dark: themeToggleT('dark')
    },
    FeatureRequest: {
      pleaseLogIn: featureRequestT('pleaseLogIn'),
      loading: featureRequestT('loading')
    }
  };

  return (
    <NextIntlClientProvider locale={locale} messages={clientMessages}>
      <NavbarClient />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </NextIntlClientProvider>
  );
} 