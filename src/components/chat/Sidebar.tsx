"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import Link from "next/link";
import { formatDistance } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { CircleFadingPlus, HelpCircle, History, Settings, AlertCircle, ArrowLeftFromLine, ArrowRightFromLine } from "lucide-react";

interface SidebarProps {
  collapsed?: boolean;
  locale: string;
  onToggle?: () => void;
}

interface Conversation {
  id: string;
  title: string;
  last_message_preview?: string;
  updated_at: string;
  created_at: string;
  is_archived: boolean;
  message_count: number;
  is_pinned: boolean;
}

export function Sidebar({ collapsed = false, locale, onToggle }: SidebarProps) {
  const t = useTranslations('Chat');
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  
  const isRtl = locale === 'ar';
  const dateLocale = isRtl ? ar : enUS;

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    if (onToggle) {
      onToggle();
    }
  };

  // Fetch conversations when user changes
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log("Fetching conversations for user:", user.id);
      const response = await fetch('/api/conversations');
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(`Failed to fetch conversations: ${errorData.error || response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Fetched conversations:", data);
      setConversations(data);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch conversations when user changes
  useEffect(() => {
    if (user) {
      fetchConversations();
    } else {
      setConversations([]);
    }
  }, [user, fetchConversations]);

  // Sync with parent collapsed state
  useEffect(() => {
    setIsCollapsed(collapsed);
  }, [collapsed]);

  // Navigate to a conversation
  const navigateToConversation = (id: string) => {
    router.push(`/${locale}/chat/${id}`);
  };

  // Start a new chat
  const handleNewChat = () => {
    router.push(`/${locale}/chat`);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return formatDistance(
        new Date(dateString),
        new Date(),
        { addSuffix: true, locale: dateLocale }
      );
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // This comes from the database
  const recentChats = conversations;

  return (
    <div 
      className={cn(
        "flex flex-col h-full border-border/40 bg-muted/10 transition-all duration-300 ease-in-out",
        isRtl ? "border-l" : "border-r",
        isCollapsed ? "w-[4.5rem]" : "w-[30rem]"
      )}
    >
      {/* New Chat Button */}
      <div className="px-4 py-6">
        <Button 
          variant="outline" 
          className={cn(
            "w-full h-11 border-0 bg-card hover:bg-muted text-foreground",
            isRtl ? "text-right" : "text-left",
            isCollapsed && "justify-center p-0 h-10 w-10 mx-auto"
          )}
          onClick={handleNewChat}
        >
          {isCollapsed ? (
            <CircleFadingPlus className="h-4 w-4" aria-hidden="true" />
          ) : isRtl ? (
            <div className="w-full flex flex-row-reverse items-center">
              <CircleFadingPlus className="h-4 w-4 mr-auto" aria-hidden="true" />
              <span>{t('newChat')}</span>
            </div>
          ) : (
            <div className="w-full flex flex-row items-center">
              <CircleFadingPlus className="h-4 w-4 mr-2" aria-hidden="true" />
              <span>{t('newChat')}</span>
            </div>
          )}
        </Button>
      </div>
      
      {/* Toggle Button */}
      <div className={cn("px-2 mb-2", isCollapsed ? "flex justify-center" : "flex", isRtl ? "justify-end" : "justify-start")}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleSidebar}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            isRtl ? (
              <ArrowLeftFromLine className="h-4 w-4" />
            ) : (
              <ArrowRightFromLine className="h-4 w-4" />
            )
          ) : (
            isRtl ? (
              <ArrowRightFromLine className={cn("h-4 w-4", isRtl && "rtl-flip")} />
            ) : (
              <ArrowLeftFromLine className="h-4 w-4" />
            )
          )}
        </Button>
      </div>
      
      {/* Recent Section */}
      <div className="px-4 py-1 mt-2">
        <div className={cn(
          "text-xs font-medium text-muted-foreground uppercase tracking-wider", 
          isCollapsed ? "text-center" : "",
          isRtl && !isCollapsed ? "text-right w-full" : ""
        )}>
          {!isCollapsed && t('recent')}
        </div>
      </div>
      
      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="px-2">
          <TooltipProvider>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : error ? (
              <div className={cn("px-4 py-2 text-sm text-muted-foreground", isCollapsed && "text-center")}>
                {isCollapsed ? "!" : error}
              </div>
            ) : !user ? (
              <div className={cn("px-4 py-2 text-sm text-muted-foreground", isCollapsed && "text-center")}>
                {isCollapsed ? "🔒" : t('signInToViewHistory')}
              </div>
            ) : recentChats.length === 0 ? (
              <div className={cn("px-4 py-2 text-sm text-muted-foreground", isCollapsed && "text-center")}>
                {isCollapsed ? "💬" : t('noConversations')}
              </div>
            ) : (
              recentChats.map(chat => (
                <Tooltip key={chat.id} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full mb-1 h-9 py-1",
                        isRtl ? "text-right" : "text-left",
                        isCollapsed && "justify-center",
                        pathname.includes(`/chat/${chat.id}`) && "bg-muted/50"
                      )}
                      onClick={() => navigateToConversation(chat.id)}
                    >
                      {isCollapsed ? (
                        <History className="h-4 w-4" />
                      ) : isRtl ? (
                        <div className="w-full flex flex-row-reverse items-center">
                          <History className="h-4 w-4 mr-auto" />
                          <span className="truncate text-sm">{chat.title}</span>
                        </div>
                      ) : (
                        <div className="w-full flex flex-row items-center">
                          <History className="h-4 w-4 mr-2" />
                          <span className="truncate text-sm">{chat.title}</span>
                        </div>
                      )}
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side={isRtl ? "left" : "right"}>
                      {chat.title}
                    </TooltipContent>
                  )}
                </Tooltip>
              ))
            )}
          </TooltipProvider>
        </div>
      </ScrollArea>
      
      {/* Footer Menu */}
      <div className="border-t border-border/40 px-2 py-1 space-y-1">
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full h-9 py-1",
                  isRtl ? "text-right" : "text-left",
                  isCollapsed && "justify-center"
                )}
                asChild
              >
                <Link href={`/${locale}/help`}>
                  {isCollapsed ? (
                    <HelpCircle className="h-4 w-4" />
                  ) : isRtl ? (
                    <div className="w-full flex flex-row-reverse items-center">
                      <HelpCircle className="h-4 w-4 mr-auto" />
                      <span className="text-sm">{t('help')}</span>
                    </div>
                  ) : (
                    <div className="w-full flex flex-row items-center">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      <span className="text-sm">{t('help')}</span>
                    </div>
                  )}
                </Link>
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side={isRtl ? "left" : "right"}>{t('help')}</TooltipContent>
            )}
          </Tooltip>
          
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full h-9 py-1",
                  isRtl ? "text-right" : "text-left",
                  isCollapsed && "justify-center"
                )}
                asChild
              >
                <Link href={`/${locale}/changelog`}>
                  {isCollapsed ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : isRtl ? (
                    <div className="w-full flex flex-row-reverse items-center">
                      <AlertCircle className="h-4 w-4 mr-auto" />
                      <span className="text-sm">{t('changelog')}</span>
                    </div>
                  ) : (
                    <div className="w-full flex flex-row items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <span className="text-sm">{t('changelog')}</span>
                    </div>
                  )}
                </Link>
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side={isRtl ? "left" : "right"}>{t('changelog')}</TooltipContent>
            )}
          </Tooltip>
          
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full h-9 py-1",
                  isRtl ? "text-right" : "text-left",
                  isCollapsed && "justify-center"
                )}
                asChild
              >
                <Link href={`/${locale}/settings`}>
                  {isCollapsed ? (
                    <Settings className="h-4 w-4" />
                  ) : isRtl ? (
                    <div className="w-full flex flex-row-reverse items-center">
                      <Settings className="h-4 w-4 mr-auto" />
                      <span className="text-sm">{t('settings')}</span>
                    </div>
                  ) : (
                    <div className="w-full flex flex-row items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      <span className="text-sm">{t('settings')}</span>
                    </div>
                  )}
                </Link>
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side={isRtl ? "left" : "right"}>{t('settings')}</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Footer Disclaimer */}
      {!isCollapsed && (
        <div className="p-2 border-t border-border/40">
          <p className={cn("text-xs text-muted-foreground", isRtl && "text-right")}>
            {t('disclaimer')} &copy; 2025 All rights reserved.
          </p>
        </div>
      )}
    </div>
  );
}
