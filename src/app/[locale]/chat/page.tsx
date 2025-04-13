import { ChatContent } from "@/components/chat/ChatContent";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatLayout } from "@/components/layout/ChatLayout";
import Navbar from "@/components/layout/navbar";
import { getMessages } from 'next-intl/server';

// Helper function to pick specific keys from an object
function pick(obj: Record<string, any>, keys: string[]): Record<string, any> {
  return keys.reduce((acc, key) => {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {} as Record<string, any>);
}

export default async function ChatPage({ params }: { params: { locale: string } }) {
  // Fetch all messages for the locale
  console.log('ChatPage: Fetching messages...'); // Log start
  const messages = await getMessages();
  console.log('ChatPage: Raw messages fetched:', JSON.stringify(messages)); // Log raw messages
  
  // Pick only the 'Chat' namespace messages
  const chatMessages = pick(messages, ['Chat']);
  console.log('ChatPage: Picked chatMessages:', JSON.stringify(chatMessages)); // Log picked messages

  return (
    <>
      <Navbar />
      {/* Pass chat messages down to the layout */}
      <ChatLayout locale={params.locale} messages={chatMessages}>
        <ChatContent locale={params.locale}>
          <div className="p-4 md:px-8">
            <ChatInput locale={params.locale} />
          </div>
        </ChatContent>
      </ChatLayout>
    </>
  );
}
