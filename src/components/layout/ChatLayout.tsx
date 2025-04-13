"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ResizablePanel, 
  ResizablePanelGroup,
  ResizableHandle
} from "@/components/ui/resizable";
import * as ResizablePrimitive from "react-resizable-panels";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatContent } from "@/components/chat/ChatContent";
import { ChatInput } from "@/components/chat/ChatInput";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { NextIntlClientProvider } from 'next-intl';

interface ChatLayoutProps {
  locale: string;
  messages?: Record<string, any>;
  children?: React.ReactNode;
  conversationId?: string;
}

export function ChatLayout({ locale, messages, children, conversationId }: ChatLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isRtl = locale === 'ar';
  const [isMobile, setIsMobile] = useState(false);
  const panelRef = useRef<React.ElementRef<typeof ResizablePrimitive.Panel>>(null);

  // Log the messages prop received by ChatLayout
  console.log('ChatLayout received messages:', JSON.stringify(messages));

  // Check if we're on a mobile device
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Desktop layout with resizable panels
  function DesktopLayout() {
    // Create a custom handler to toggle sidebar
    const toggleSidebarCollapse = () => {
      const isCurrentlyCollapsed = !isSidebarCollapsed;
      setIsSidebarCollapsed(isCurrentlyCollapsed);
      
      // Use the panel ref to resize directly
      if (panelRef.current) {
        const panel = panelRef.current as unknown as {resize: (size: number) => void};
        // Set to minimum or default size based on collapse state
        panel.resize?.(isCurrentlyCollapsed ? 5 : 20);
      }
    };
    
    return (
      <ResizablePanelGroup
        direction="horizontal"
        className={cn("flex-grow", isRtl && "flex-row-reverse")}
        data-panel-group
      >
        {/* Sidebar Panel */}
        <ResizablePanel
          ref={panelRef}
          defaultSize={20}
          minSize={15}
          maxSize={30}
          collapsible
          collapsedSize={5}
          onCollapse={() => setIsSidebarCollapsed(true)}
          onExpand={() => setIsSidebarCollapsed(false)}
          className="flex"
        >
          <NextIntlClientProvider locale={locale} messages={messages}>
            <div className="flex flex-col h-full bg-card">
              <div className="px-4 py-2 flex bg-card">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "h-8 w-8 rounded-md",
                    isRtl && "mr-auto"
                  )}
                  onClick={toggleSidebarCollapse}
                  aria-label="Toggle sidebar"
                >
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Toggle sidebar</span>
                </Button>
              </div>
              <Sidebar 
                collapsed={isSidebarCollapsed} 
                locale={locale}
              />
            </div>
          </NextIntlClientProvider>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        {/* Main Content Panel */}
        <ResizablePanel defaultSize={80}>
          <div className="flex flex-col h-full">
            <div className="flex-grow overflow-auto">
              <ChatContent locale={locale} conversationId={conversationId}>
                {children}
              </ChatContent>
            </div>
            <div className="sticky bottom-0 p-4 bg-background/80 backdrop-blur-sm">
              <ChatInput locale={locale} />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    );
  }

  // Mobile layout with sheet for sidebar
  const MobileLayout = () => (
    <div className={cn("flex flex-col h-full", isRtl && "items-end")}>
      <div className={cn("px-4 py-2 flex border-b border-border/40", isRtl && "w-full justify-end")}>
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-md"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side={isRtl ? "right" : "left"} className="p-0 bg-card">
            <NextIntlClientProvider locale={locale} messages={messages}>
              <Sidebar 
                collapsed={false} 
                locale={locale}
              />
            </NextIntlClientProvider>
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="flex-grow overflow-auto">
        <ChatContent locale={locale} conversationId={conversationId}>
          {children}
        </ChatContent>
      </div>
      
      <div className="sticky bottom-0 p-4 bg-background/80 backdrop-blur-sm">
        <ChatInput locale={locale} />
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {isMobile ? <MobileLayout /> : <DesktopLayout />}
      </div>
    </TooltipProvider>
  );
}
