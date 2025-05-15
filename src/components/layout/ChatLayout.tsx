"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ResizablePanel, 
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatContent } from "@/components/chat/ChatContent";
import { ChatInput } from "@/components/chat/ChatInput";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { NextIntlClientProvider } from 'next-intl';
import { useRtl } from "@/lib/hooks/useRtl";
import { useResizablePanel } from "@/lib/hooks/useResizablePanel";
import { logger } from "@/lib/utils/logger";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SidebarButton } from "@/components/chat/sidebar/SidebarButton";
import { ChatProvider } from "@/components/providers/ChatProvider";

interface ChatLayoutProps {
  locale: string;
  messages?: Record<string, any>;
  children?: React.ReactNode;
  conversationId?: string;
}

export function ChatLayout({ locale, messages, children, conversationId }: ChatLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const { isRtl } = useRtl(locale);
  
  // Log the messages prop received by ChatLayout (using our structured logger)
  logger.debug('ChatLayout received messages', { messageKeys: messages ? Object.keys(messages) : [] });

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
    const sidebarPanelRef = useRef<ImperativePanelHandle>(null);

    const { 
      isCollapsed: isSidebarCollapsed,
      toggleCollapse: toggleSidebarCollapse,
      handleResize: handlePanelResize
    } = useResizablePanel({
      defaultSize: 20,
      minSize: 4,
      maxSize: 20,
      panelRef: sidebarPanelRef
    });
    
    logger.debug(`Desktop layout rendered with collapsed=${isSidebarCollapsed}`);
    
    return (
      <ResizablePanelGroup
        direction="horizontal"
        className={cn("flex-grow", isRtl && "flex-row-reverse")}
        onLayout={handlePanelResize}
      >
        {/* Sidebar Panel */}
        <ResizablePanel
          ref={sidebarPanelRef}
          defaultSize={20}
          minSize={4}
          maxSize={20}
          collapsible
          collapsedSize={4}
          className={cn("flex")}
          id="sidebar-panel"
        >
          <ErrorBoundary
            fallback={
              <div className="flex flex-col h-full p-4 text-destructive">
                Error loading sidebar. Please refresh the page.
              </div>
            }
            context="ChatLayout.Sidebar"
          >
            <NextIntlClientProvider locale={locale} messages={messages}>
              <div className="flex flex-col h-full bg-card w-full overflow-hidden">
                <div className="py-2 flex bg-card">
                  <SidebarButton 
                    variant="ghost" 
                    size="icon"
                    Icon={Menu}
                    label="Toggle sidebar"
                    collapsed={isSidebarCollapsed}
                    locale={locale}
                    onClick={toggleSidebarCollapse}
                    iconOnlyWhenExpanded={true}
                  />
                </div>
                <Sidebar 
                  collapsed={isSidebarCollapsed} 
                  locale={locale}
                />
              </div>
            </NextIntlClientProvider>
          </ErrorBoundary>
        </ResizablePanel>
        
        <ResizableHandle withHandle className="bg-transparent w-0 border-0" />
        
        {/* Main Content Panel */}
        <ResizablePanel 
          defaultSize={80}
          className={cn(
            isRtl ? "border-r border-border/40" : "border-l border-border/40"
          )}
        >
          <ErrorBoundary
            fallback={
              <div className="flex flex-col h-full p-8">
                <h2 className="text-2xl font-bold text-destructive mb-4">Error loading chat content</h2>
                <p>There was a problem loading the chat content. Please try refreshing the page.</p>
              </div>
            }
            context="ChatLayout.Content"
          >
            <ChatProvider conversationId={conversationId}>
              <div className="flex flex-col h-full">
                <div className="flex-grow overflow-auto">
                  <ChatContent locale={locale} conversationId={conversationId}>
                    {children}
                  </ChatContent>
                </div>
                <div className="sticky bottom-0 px-4 py-2 md:p-4 bg-background/80 backdrop-blur-sm">
                  <ChatInput locale={locale} isMobile={isMobile} />
                </div>
              </div>
            </ChatProvider>
          </ErrorBoundary>
        </ResizablePanel>
      </ResizablePanelGroup>
    );
  }

  // Mobile layout with sheet for sidebar
  const MobileLayout = () => (
    <div className={cn("flex flex-col h-full")}>
      <div 
        className={cn(
          "px-4 py-2 border-b border-border/40",
          "text-left rtl:text-right",
          "sticky top-0 z-10 bg-background"
        )}
      >
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-8 w-8 rounded-md")}
              aria-label="Toggle sidebar"
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent 
            side={isRtl ? "right" : "left"} 
            className="p-0 bg-card h-screen overflow-y-auto"
          >
            <NextIntlClientProvider locale={locale} messages={messages}>
              <Sidebar 
                collapsed={false} 
                locale={locale}
              />
            </NextIntlClientProvider>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Wrap the remaining content and input areas with ChatProvider */}
      <ChatProvider conversationId={conversationId}>
        <div className="flex-grow overflow-auto">
          <ChatContent locale={locale} conversationId={conversationId}>
            {children}
          </ChatContent>
        </div>
        <div className="sticky bottom-0 px-4 py-2 md:p-4 bg-background/80 backdrop-blur-sm">
          <ChatInput locale={locale} isMobile={isMobile} />
        </div>
      </ChatProvider>
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
