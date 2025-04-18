import { ChatContent } from "@/components/chat/ChatContent";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatLayout } from "@/components/layout/ChatLayout";
import Navbar from "@/components/layout/navbar";
import { getMessages } from 'next-intl/server';

export default async function ChatPage({ params }: { params: { locale: string } }) {
  // Fetch all messages for the locale
  console.log('ChatPage: Fetching messages...'); // Log start
  const messages = await getMessages();
  console.log('ChatPage: Raw messages fetched:', JSON.stringify(messages)); // Log raw messages
  
  return (
    <>
      <Navbar />
      {/* Pass all messages down to the layout to ensure all namespaces are available */}
      <ChatLayout locale={params.locale} messages={messages}>
        <ChatContent locale={params.locale}>
          <div className="p-4 md:px-8">
            <ChatInput locale={params.locale} />
          </div>
        </ChatContent>
      </ChatLayout>
    </>
  );
}
