import { getTranslations } from 'next-intl/server';
import { ChatLayout } from "@/components/layout/ChatLayout";
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
  const chatT = await getTranslations('Chat');
  
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
    },
    Chat: {
      newChat: chatT('newChat'),
      recent: chatT('recent'),
      help: chatT('help'),
      changelog: chatT('changelog'),
      settings: chatT('settings'),
      disclaimer: chatT('disclaimer'),
      chatPlaceholder: chatT('chatPlaceholder'),
      sendMessage: chatT('sendMessage'),
      enterToSend: chatT('enterToSend'),
      headlineTitle: chatT('headlineTitle'),
      headlineSubtitle: chatT('headlineSubtitle')
    }
  };
  
  return (
    <HomeClient locale={params.locale} messages={clientMessages}>
      <ChatLayout locale={params.locale} />
    </HomeClient>
  );
}
