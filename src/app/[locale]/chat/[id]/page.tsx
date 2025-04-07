import { ChatLayout } from "@/components/layout/ChatLayout";
import Navbar from "@/components/layout/navbar";

export default function ConversationPage({ 
  params 
}: { 
  params: { locale: string; id: string } 
}) {
  return (
    <>
      <Navbar />
      <ChatLayout 
        locale={params.locale}
        conversationId={params.id}
      />
    </>
  );
}
