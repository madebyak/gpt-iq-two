import { getTranslations } from 'next-intl/server';
import { Container } from "@/components/ui/container";
import HomeClient from "./home-client";

interface PageProps {
  params: {
    locale: string;
  };
}

export default async function HomePage({ params }: PageProps) {
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
        <Container className="flex-grow flex items-center justify-center">
          <div className="h-full w-full" aria-hidden="true">
            {/* Intentionally left empty to show only the navbar */}
          </div>
        </Container>
      </main>
    </HomeClient>
  );
}
