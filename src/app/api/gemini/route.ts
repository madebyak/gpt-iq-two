import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { StreamingTextResponse } from "ai";

// Initialize the Gemini API client
const apiKey = process.env.GEMINI_API_KEY;

// Check for API key
if (!apiKey) {
  console.error("GEMINI_API_KEY is not defined in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey as string);

// Generate stream handler for Gemini API
export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  try {
    // Validate API key
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      // Create a stream with an error message
      const fallbackMessage = "Sorry, the Gemini API key is not configured correctly. Please add a valid API key to the .env.local file.";
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
    const geminiMessages = messages.map((message: { role: string; content: string }) => ({
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
    
    // Convert Gemini stream to vercel AI SDK stream format
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        for await (const chunk of result.stream) {
          const text = chunk.text();
          controller.enqueue(encoder.encode(text));
        }
        
        controller.close();
      },
    });

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("Gemini API error:", error);
    
    // Create a stream with an error message
    const errorMessage = "An error occurred while communicating with the Gemini API. Please check the API key and try again.";
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
