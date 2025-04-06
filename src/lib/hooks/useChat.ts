import { useCallback, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add a new message to the chat
  const addMessage = useCallback((role: MessageRole, content: string) => {
    const newMessage: Message = {
      id: uuidv4(),
      role,
      content,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, []);

  // Send a message to the chat API
  const sendMessage = useCallback(
    async (content: string) => {
      try {
        setError(null);
        setIsLoading(true);
        
        // Add the user message
        const userMessage = addMessage("user", content);
        
        // Create a placeholder for the AI response
        const assistantMessage = addMessage("assistant", "");
        
        // Send the request to the API with streaming
        const response = await fetch("/api/gemini", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: messages
              .concat(userMessage)
              .map((msg) => ({
                role: msg.role,
                content: msg.content,
              })),
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error("Response body is null");
        }

        // Process the streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let responseText = "";

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }
          
          // Decode and append the chunk to the response text
          const chunk = decoder.decode(value, { stream: true });
          responseText += chunk;
          
          // Update the assistant message with the current response text
          setMessages((currentMessages) =>
            currentMessages.map((msg) =>
              msg.id === assistantMessage.id
                ? { ...msg, content: responseText }
                : msg
            )
          );
        }

        // Save to database (can be implemented later)
        // This is lower priority than rendering the response
        
      } catch (err) {
        console.error("Error sending message:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [addMessage, messages]
  );

  // Clear all messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}
