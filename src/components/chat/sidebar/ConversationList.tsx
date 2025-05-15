"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { History } from "lucide-react";
import { usePathname } from "@/i18n/navigation";
import { memo, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Conversation } from "@/lib/hooks/useConversations";
import { useRtl } from "@/lib/hooks/useRtl";
import { logger } from "@/lib/utils/logger";
import { ErrorBoundary } from "@/components/ui/error-boundary";

interface ConversationListProps {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  collapsed: boolean;
  locale: string;
  loadingConversationId: string | null;
  formatDate: (dateString: string) => string;
  onSelectConversation: (id: string) => void;
  user: any | null; // From auth context
}

function ConversationListComponent({
  conversations,
  loading,
  error,
  collapsed,
  locale,
  loadingConversationId,
  formatDate,
  onSelectConversation,
  user
}: ConversationListProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  
  // Use our RTL hook for consistent RTL handling
  const { isRtl, textAlign, flipIcon, position } = useRtl(locale);
  
  useEffect(() => {
    if (collapsed) {
      // If collapsed, no need to manipulate styles as content is not rendered or visible
      return;
    }
    if (contentWrapperRef.current) {
      const radixInternalDiv = contentWrapperRef.current.parentElement;
      if (radixInternalDiv && radixInternalDiv instanceof HTMLElement) {
        // Target the div that Radix styles with display: table
        if (radixInternalDiv.style.getPropertyValue('display') === 'table') {
          logger.debug("Overriding Radix ScrollArea internal div min-width to 0px and display to block");
          radixInternalDiv.style.minWidth = '0px';
          radixInternalDiv.style.display = 'block'; 
        }
      }
    }
  }, [collapsed, conversations, loading]); // Added loading dependency
  
  // If collapsed, don't render content
  if (collapsed) {
    logger.debug('ConversationList: Not rendering content because sidebar is collapsed');
    return <div className="flex-1"></div>;
  }

  return (
    <ErrorBoundary
      fallback={<div className="flex-1 p-4 text-destructive">Error loading conversations</div>}
      context="ConversationList"
    >
      <ScrollArea className="max-w-full">
        <div ref={contentWrapperRef} style={{ width: '100%', overflow: 'hidden' }}>
          <div className="px-4 w-full overflow-hidden">
            <TooltipProvider>
              {/* Explicitly wait for initial load before rendering list states */}
              {loading && (
                <div className="flex justify-center py-4">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              )}
              {!loading && error && (
                // Show error only if not loading
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  {error}
                </div>
              )}
              {!loading && !error && (
                // Render content only after initial load and no error
                <>
                  {!user ? (
                    // User is definitively logged out
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      Sign in to view your chat history
                    </div>
                  ) : conversations.length === 0 ? (
                    // User is logged in, but no conversations found
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      No conversations yet
                    </div>
                  ) : (
                    // User is logged in and has conversations
                    conversations.map((chat, index) => (
                      <div key={chat.id} className={cn(
                        "transition-colors duration-200",
                        index !== 0 && "border-t border-border/20",
                        pathname.includes(`/chat/${chat.id}`) && "bg-muted/30",
                        "py-1"
                      )}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "flex w-full",
                            isRtl ? "justify-end" : "justify-start",
                            "items-center",
                            "py-2 px-3 h-auto relative",
                            "whitespace-normal overflow-hidden",
                            pathname.includes(`/chat/${chat.id}`) 
                              ? "bg-muted hover:bg-muted/80 before:absolute before:top-0 before:bottom-0 before:w-[3px] before:bg-[#28e088] shadow-sm" 
                              : "hover:bg-muted/30 transition-colors duration-200",
                            isRtl 
                              ? pathname.includes(`/chat/${chat.id}`) ? "before:right-0" : ""
                              : pathname.includes(`/chat/${chat.id}`) ? "before:left-0" : ""
                          )}
                          onClick={() => {
                            logger.debug(`Selecting conversation: ${chat.id}`);
                            onSelectConversation(chat.id);
                          }}
                        >
                          {isRtl ? (
                            <div className="w-full flex flex-row-reverse items-start gap-x-2 min-w-0">
                              <History className={cn("h-4 w-4 rtl-flip shrink-0", flipIcon)} />
                              <div className="flex flex-col space-y-0.5 text-right w-full min-w-0">
                                <span className="truncate font-medium text-sm text-foreground">{chat.title}</span>
                                <span className="text-xs text-muted-foreground">{formatDate(chat.created_at)}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full flex flex-row items-start gap-x-2 min-w-0">
                              <History className="h-4 w-4 shrink-0" />
                              <div className="flex flex-col space-y-0.5 text-left w-full min-w-0">
                                <span className="truncate font-medium text-sm text-foreground">{chat.title}</span>
                                <span className="text-xs text-muted-foreground">{formatDate(chat.created_at)}</span>
                              </div>
                            </div>
                          )}
                          
                          {/* Show loading indicator if this conversation is being loaded */}
                          {loadingConversationId === chat.id && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-md">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            </div>
                          )}
                        </Button>
                      </div>
                    ))
                  )}
                </>
              )}
            </TooltipProvider>
          </div>
        </div>
      </ScrollArea>
    </ErrorBoundary>
  );
}

// Use memo to prevent unnecessary re-renders
export const ConversationList = memo(ConversationListComponent);
