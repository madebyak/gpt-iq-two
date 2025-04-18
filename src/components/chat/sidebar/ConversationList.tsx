"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { History } from "lucide-react";
import { usePathname } from "@/i18n/navigation";
import { memo } from "react";
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
  
  // Use our RTL hook for consistent RTL handling
  const { isRtl, textAlign, flipIcon, position } = useRtl(locale);
  
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
      <ScrollArea className="flex-1">
        <div className="px-2">
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
                          "w-full py-2 px-3 h-auto relative",
                          textAlign, // Use our RTL utility for text alignment
                          pathname.includes(`/chat/${chat.id}`) 
                            ? "bg-muted hover:bg-muted/80 before:absolute before:top-0 before:bottom-0 before:w-[3px] before:bg-[#28e088] shadow-sm" 
                            : "hover:bg-muted/30 transition-colors duration-200",
                          // Use position utility for RTL-specific placement of the active indicator
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
                          <div className="w-full flex flex-row-reverse items-start gap-x-2">
                            {/* Use the rtl-flip utility class for icons in RTL mode */}
                            <History className={cn("h-4 w-4 rtl-flip", flipIcon)} />
                            <div className="flex flex-col space-y-0.5 text-right w-full">
                              <span className="truncate font-medium text-sm text-foreground">{chat.title}</span>
                              <span className="text-xs text-muted-foreground">{formatDate(chat.created_at)}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full flex flex-row items-start gap-x-2">
                            <History className="h-4 w-4" />
                            <div className="flex flex-col space-y-0.5 text-left w-full">
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
      </ScrollArea>
    </ErrorBoundary>
  );
}

// Use memo to prevent unnecessary re-renders
export const ConversationList = memo(ConversationListComponent);
