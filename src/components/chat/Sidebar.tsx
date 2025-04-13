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

export function Sidebar({ collapsed = false, locale }: SidebarProps) {
  const t = useTranslations("Chat");
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingConversationId, setLoadingConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  
  const isRtl = locale === 'ar';
  const dateLocale = isRtl ? ar : enUS;

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

  // Navigate to a conversation
  const navigateToConversation = (id: string) => {
    // Set loading state before navigation
    setLoadingConversationId(id);
    
    // Use router.prefetch to prepare the page before navigation
    router.prefetch(`/chat/${id}`);
    
    // Use a small timeout to ensure the UI updates before navigation
    setTimeout(() => {
      router.push(`/chat/${id}`);
      
      // Reset loading after a delay to ensure user sees feedback
      setTimeout(() => {
        setLoadingConversationId(null);
      }, 1000);
    }, 50);
  };

  // Start a new chat
  const handleNewChat = () => {
    router.prefetch('/chat');
    setTimeout(() => {
      router.push('/chat');
    }, 50);
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
        "flex flex-col h-full border-border/40 bg-card transition-all duration-300 ease-in-out",
        isRtl ? "border-l" : "border-r",
        collapsed ? "w-[4.5rem]" : "w-[30rem]"
      )}
    >
      {/* New Chat Button */}
      <div className="px-4 py-4">
        <Button 
          variant="outline" 
          className={cn(
            "border-0 bg-card hover:bg-muted/60 text-foreground",
            collapsed ? "justify-center h-10 w-10 mx-auto p-0 rounded-md" : "h-10 rounded-md",
            isRtl ? (collapsed ? "mx-auto" : "text-right max-w-[85%]") : (collapsed ? "mx-auto" : "text-left max-w-[85%]")
          )}
          onClick={handleNewChat}
        >
          {collapsed ? (
            <CircleFadingPlus className="h-4 w-4" aria-hidden="true" />
          ) : isRtl ? (
            <div className="w-full flex flex-row-reverse items-center">
              <CircleFadingPlus className={cn("h-4 w-4 mr-auto")} aria-hidden="true" />
              <span className="font-medium">{t('newChat')}</span>
            </div>
          ) : (
            <div className="w-full flex flex-row items-center">
              <CircleFadingPlus className="h-4 w-4 mr-2" aria-hidden="true" />
              <span className="font-medium">{t('newChat')}</span>
            </div>
          )}
        </Button>
      </div>
      
      {/* Recent Section */}
      <div className="px-4 py-1 mt-2">
        <div className={cn(
          "text-xs font-medium text-muted-foreground uppercase tracking-wider", 
          collapsed ? "text-center" : "",
          isRtl && !collapsed ? "text-right w-full" : ""
        )}>
          {!collapsed && t('recent')}
        </div>
      </div>
      
      {/* Chat List */}
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
              <div className={cn("px-4 py-2 text-sm text-muted-foreground", collapsed && "text-center")}>
                 {collapsed ? "!" : error}
              </div>
            )}
            {!loading && !error && (
              // Render content only after initial load and no error
              <>
                {!user ? (
                  // User is definitively logged out
                  <div className={cn("px-4 py-2 text-sm text-muted-foreground", collapsed && "text-center")}>
                    {collapsed ? "🔒" : (t('signInToViewHistory') || "Sign in to view history")}
                  </div>
                ) : recentChats.length === 0 ? (
                  // User is logged in, but no conversations found
                  <div className={cn("px-4 py-2 text-sm text-muted-foreground", collapsed && "text-center")}>
                    {collapsed ? "💬" : (t('noConversations') || "No conversations yet")}
                  </div>
                ) : (
                  // User is logged in and has conversations
                  recentChats.map((chat, index) => (
                    <div key={chat.id} className={cn(
                      "transition-colors duration-200",
                      index !== 0 && "border-t border-border/20",
                      pathname.includes(`/chat/${chat.id}`) && "bg-muted/30",
                      "py-1"
                    )}>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full py-2 px-3 h-auto relative",
                              isRtl ? "text-right" : "text-left",
                              collapsed && "justify-center",
                              pathname.includes(`/chat/${chat.id}`) 
                                ? "bg-muted hover:bg-muted/80 before:absolute before:top-0 before:bottom-0 before:w-[3px] before:bg-[#28e088] shadow-sm" 
                                : "hover:bg-muted/30 transition-colors duration-200",
                              isRtl 
                                ? pathname.includes(`/chat/${chat.id}`) ? "before:right-0" : ""
                                : pathname.includes(`/chat/${chat.id}`) ? "before:left-0" : ""
                            )}
                            onClick={() => navigateToConversation(chat.id)}
                          >
                            {collapsed ? (
                              <History className="h-4 w-4" />
                            ) : isRtl ? (
                              <div className="w-full flex flex-row-reverse items-start">
                                <History className={cn("h-4 w-4 mr-auto mt-0.5", isRtl && "rtl-flip")} />
                                <div className="flex flex-col space-y-0.5">
                                  <span className="truncate font-medium text-sm text-foreground">{chat.title}</span>
                                  {chat.last_message_preview && (
                                    <span className="truncate text-xs text-muted-foreground opacity-85 line-clamp-1">
                                      {chat.last_message_preview.substring(0, 30)}
                                      {chat.last_message_preview.length > 30 ? '...' : ''}
                                    </span>
                                  )}
                                  <span className="text-xs text-muted-foreground opacity-70 mt-1">
                                    {formatDate(chat.updated_at)}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full flex flex-row items-start">
                                <History className={cn("h-4 w-4 mr-2 mt-0.5", isRtl && "rtl-flip")} />
                                <div className="flex flex-col space-y-0.5">
                                  <span className="truncate font-medium text-sm text-foreground">{chat.title}</span>
                                  {chat.last_message_preview && (
                                    <span className="truncate text-xs text-muted-foreground opacity-85 line-clamp-1">
                                      {chat.last_message_preview.substring(0, 30)}
                                      {chat.last_message_preview.length > 30 ? '...' : ''}
                                    </span>
                                  )}
                                  <span className="text-xs text-muted-foreground opacity-70 mt-1">
                                    {formatDate(chat.updated_at)}
                                  </span>
                                </div>
                              </div>
                            )}
                            {loadingConversationId === chat.id && (
                              <div className={cn(
                                "absolute top-0 bottom-0 w-2 bg-primary animate-pulse",
                                isRtl ? "right-0" : "left-0"
                              )} />
                            )}
                          </Button>
                        </TooltipTrigger>
                        {collapsed && (
                          <TooltipContent side={isRtl ? "left" : "right"}>
                            {chat.title}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </div>
                  ))
                )}
              </>
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
                  collapsed && "justify-center"
                )}
                asChild
              >
                <Link href={`/${locale}/help`}>
                  {collapsed ? (
                    <HelpCircle className={cn("h-4 w-4", isRtl && "rtl-flip")} />
                  ) : isRtl ? (
                    <div className="w-full flex flex-row-reverse items-center">
                      <HelpCircle className={cn("h-4 w-4 mr-auto", isRtl && "rtl-flip")} />
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
            {collapsed && (
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
                  collapsed && "justify-center"
                )}
                asChild
              >
                <Link href={`/${locale}/changelog`}>
                  {collapsed ? (
                    <AlertCircle className={cn("h-4 w-4", isRtl && "rtl-flip")} />
                  ) : isRtl ? (
                    <div className="w-full flex flex-row-reverse items-center">
                      <AlertCircle className={cn("h-4 w-4 mr-auto", isRtl && "rtl-flip")} />
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
            {collapsed && (
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
                  collapsed && "justify-center"
                )}
                asChild
              >
                <Link href={`/${locale}/settings`}>
                  {collapsed ? (
                    <Settings className={cn("h-4 w-4", isRtl && "rtl-flip")} />
                  ) : isRtl ? (
                    <div className="w-full flex flex-row-reverse items-center">
                      <Settings className={cn("h-4 w-4 mr-auto", isRtl && "rtl-flip")} />
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
            {collapsed && (
              <TooltipContent side={isRtl ? "left" : "right"}>{t('settings')}</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Footer Disclaimer */}
      {!collapsed && (
        <div className="p-2 border-t border-border/40">
          <p className={cn("text-xs text-muted-foreground", isRtl && "text-right")}>
            {t('disclaimer')} &copy; 2025 All rights reserved.
          </p>
        </div>
      )}
    </div>
  );
}
