import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { ArrowRight, MessageSquare, Zap, Shield } from 'lucide-react';

import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Link } from '@/i18n/navigation';
import HomeClient from "./home-client";

interface PageProps {
  params: {
    locale: string;
  };
}

export default async function HomePage({ params }: PageProps) {
  // Get translations for the HomePage namespace
  const t = await getTranslations('HomePage');
  
  // Get messages for specific namespaces needed by client components
  const navbarT = await getTranslations('Navbar');
  const themeToggleT = await getTranslations('ThemeToggle');
  
  // Prepare client messages object - only include what the client needs
  const clientMessages = {
    Navbar: {
      newChat: navbarT('newChat'),
      resources: navbarT('resources'),
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
    }
  };
  
  return (
    <HomeClient locale={params.locale} messages={clientMessages}>
      <main className="flex min-h-[calc(100vh-4rem)] flex-col">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <Container>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  {t('title')}
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  {t('subtitle')}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Button asChild size="lg">
                  <Link href="/get-started">
                    {t('getStarted')}
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/try-demo">
                    {t('tryDemo')}
                  </Link>
                </Button>
              </div>
            </div>
          </Container>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 bg-muted/50">
          <Container>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              <div className="grid gap-4 items-start">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div className="grid gap-1">
                  <h3 className="text-lg font-bold">{t('featureOneTitle')}</h3>
                  <p className="text-muted-foreground">
                    {t('featureOneDescription')}
                  </p>
                </div>
              </div>
              <div className="grid gap-4 items-start">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div className="grid gap-1">
                  <h3 className="text-lg font-bold">{t('featureTwoTitle')}</h3>
                  <p className="text-muted-foreground">
                    {t('featureTwoDescription')}
                  </p>
                </div>
              </div>
              <div className="grid gap-4 items-start">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div className="grid gap-1">
                  <h3 className="text-lg font-bold">{t('featureThreeTitle')}</h3>
                  <p className="text-muted-foreground">
                    {t('featureThreeDescription')}
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <Container>
            <div className="mx-auto max-w-3xl space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                {t('ctaTitle')}
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {t('ctaDescription')}
              </p>
              <div className="mx-auto flex flex-col sm:flex-row justify-center gap-4 min-[400px]:flex-row">
                <Button asChild>
                  <Link href="/about" className="flex items-center gap-1">
                    {t('learnMore')}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </main>
    </HomeClient>
  );
}
