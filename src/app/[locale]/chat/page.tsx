import { ChatContent } from "@/components/chat/ChatContent";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatLayout } from "@/components/layout/ChatLayout";
import Navbar from "@/components/layout/navbar";
import { useState } from "react";

export default function ChatPage({ params }: { params: { locale: string } }) {
  return (
    <>
      <Navbar />
      <ChatLayout locale={params.locale}>
        <ChatContent locale={params.locale}>
          <div className="p-4 md:px-8">
            <ChatInput locale={params.locale} />
          </div>
        </ChatContent>
      </ChatLayout>
    </>
  );
}
