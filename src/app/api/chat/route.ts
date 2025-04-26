import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { StreamingTextResponse, Message as VercelAIMessage } from "ai";
import { createClient } from "@/lib/supabase/server";
import { z } from 'zod';

// Zod schema for input validation
const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(10000), // Add reasonable length limits
});

const requestBodySchema = z.object({
  messages: z.array(messageSchema).min(1), // Ensure at least one message
  conversation_id: z.string().uuid().optional(), // Validate UUID if present
});

// Initialize the Gemini API client
const apiKey = process.env.GEMINI_API_KEY;

// Check for API key
if (!apiKey) {
  console.error("GEMINI_API_KEY is not defined in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey as string);

// Generate stream handler for Gemini API
export async function POST(req: NextRequest) {
  // 1. Authentication Check
  const supabase = createClient();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    console.error("API Route: Unauthorized access attempt.", sessionError);
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Logged-in user ID for potential use
  const userId = session.user.id;
  console.log(`[API /gemini] Request received from user: ${userId}`);

  // 2. Input Validation
  let parsedBody;
  try {
    const rawBody = await req.json();
    parsedBody = requestBodySchema.parse(rawBody);
  } catch (error) {
    console.error("[API /gemini] Invalid request body:", error);
    // Handle zod errors specifically for better messages if needed
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ error: "Invalid request format", details: error.errors }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    return new NextResponse(JSON.stringify({ error: "Invalid request body" }), { 
      status: 400, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  // Use validated data from here on
  const { messages, conversation_id } = parsedBody;

  try {
    // Validate API key
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      // Create a stream with an error message
      const fallbackMessage = "Sorry, our AI service is not configured correctly. Please contact support.";
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(fallbackMessage));
          controller.close();
        }
      });
      
      return new StreamingTextResponse(stream);
    }

    // Map AI messages format to Gemini format
    const geminiMessages = messages.map((message: { role: "user" | "assistant"; content: string }) => ({
      role: message.role === "user" ? "user" : "model",
      parts: [{ text: message.content }],
    }));

    // Initialize model with system instruction
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: "You are an Iraqi Ai assistant and chatbot, your job is to answer anything in an IRAQI accent and language, never ever switch your accent to different arabic accent or language. if the user asks you who you are , how do you function, who made you, who created you. you should answer with : I have been developed and made by an Iraqi company called MoonWhale",
    });

    // Configuration for generation
    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };

    // Create chat session
    const chatSession = model.startChat({
      generationConfig,
      history: geminiMessages.slice(0, -1), // Exclude the most recent message
    });

    // Get user's most recent message
    const latestMessage = geminiMessages[geminiMessages.length - 1];
    
    // Generate streaming response
    const result = await chatSession.sendMessageStream(latestMessage.parts[0].text);
    
    // For API-level backup persistence
    let fullResponse = "";
    
    // Include the conversation_id in response headers for tracking
    const responseHeaders: Record<string, string> = conversation_id ? 
      { 'X-Conversation-ID': conversation_id } : {};
    
    // Convert Gemini stream to vercel AI SDK stream format
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        for await (const chunk of result.stream) {
          const text = chunk.text();
          fullResponse += text; // Accumulate the full response
          controller.enqueue(encoder.encode(text));
        }
        
        // At this point we have the complete AI response
        // If we have a conversation ID, we could save the message as a backup strategy
        if (conversation_id) {
          try {
            // Use our existing server client
            // const supabase = createClient(); <--- REMOVE redundant initialization
            
            // Try to save the AI message directly as a backup strategy
            const { error: msgError } = await supabase
              .from('messages')
              .insert({
                id: `api-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                conversation_id,
                role: 'assistant',
                content: fullResponse,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                topic: 'default'
              });
              
            if (msgError) {
              console.error("API-level message insertion failed:", msgError);
            } else {
              // Update conversation last_message_preview
              const { error: convoError } = await supabase
                .from('conversations')
                .update({
                  last_message_preview: fullResponse.substring(0, 100),
                  updated_at: new Date().toISOString()
                })
                .eq('id', conversation_id);
                
              if (convoError) {
                console.error("API-level conversation update failed:", convoError);
              }
            }
          } catch (error) {
            // Log error but don't interrupt the stream response
            console.error("API-level message persistence failed:", error);
          }
        }
        
        controller.close();
      },
    });

    return new StreamingTextResponse(stream, { headers: responseHeaders });
  } catch (error) {
    console.error("Error generating response:", error);
    
    // Create a stream with an error message - generic, no mention of specific API
    const errorMessage = "An error occurred while generating a response. Please try again later.";
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(errorMessage));
        controller.close();
      }
    });
    
    return new StreamingTextResponse(stream);
  }
}
