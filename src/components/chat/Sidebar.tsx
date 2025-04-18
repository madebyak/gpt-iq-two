"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useConversations } from "@/lib/hooks/useConversations";
import { useConversationNavigation } from "@/lib/hooks/useConversationNavigation";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { ConversationList } from "./sidebar/ConversationList";
import { SidebarFooter } from "./sidebar/SidebarFooter";
import { useRtl } from "@/lib/hooks/useRtl";
import { ErrorBoundary } from "../ui/error-boundary";
import { logger } from "@/lib/utils/logger";

interface SidebarProps {
  collapsed?: boolean;
  locale: string;
}

export function Sidebar({ collapsed = false, locale }: SidebarProps) {
  const t = useTranslations();
  const { user } = useAuth();
  
  // Use our new RTL hook instead of manual calculation
  const { isRtl, textAlign } = useRtl(locale);
  
  logger.debug(`Sidebar rendered with collapsed=${collapsed}, locale=${locale}, isRtl=${isRtl}`);
  
  // Use our custom hooks
  const { 
    conversations, 
    loading, 
    error, 
    formatDate 
  } = useConversations({ locale });
  
  const {
    loadingConversationId,
    navigateToConversation,
    handleNewChat
  } = useConversationNavigation();

  // Recent section label - only show when not collapsed
  const renderRecentLabel = useMemo(() => {
    if (collapsed) return null;
    
    return (
      <div className="px-4 py-1 mt-2">
        <div className={cn(
          "text-xs font-medium text-muted-foreground uppercase tracking-wider", 
          isRtl && "text-right w-full"
        )}>
          RECENT
        </div>
      </div>
    );
  }, [collapsed, isRtl]);

  return (
    <ErrorBoundary
      fallback={<div className="flex flex-col h-full p-4 text-destructive">Error loading sidebar</div>}
      context="Sidebar"
    >
      <div 
        className={cn(
          "flex flex-col h-full border-border/40 bg-card transition-all duration-300 ease-in-out",
          isRtl ? "border-l" : "border-r",
          collapsed ? "w-[3.5rem] overflow-hidden" : "w-[19rem] md:w-[22rem] lg:w-[24rem] xl:w-[26rem] 2xl:w-[30rem]",
          collapsed ? "min-w-0" : "min-w-[15rem]"
        )}
      >
        {/* New Chat Button */}
        <SidebarHeader
          collapsed={collapsed}
          locale={locale}
          onNewChat={handleNewChat}
        />
        
        {/* Recent Section Label */}
        {renderRecentLabel}
        
        {/* Conversation List */}
        <ConversationList
          conversations={conversations}
          loading={loading}
          error={error}
          collapsed={collapsed}
          locale={locale}
          loadingConversationId={loadingConversationId}
          formatDate={formatDate}
          onSelectConversation={navigateToConversation}
          user={user}
        />
        
        {/* Footer Menu */}
        <SidebarFooter
          collapsed={collapsed}
          locale={locale}
        />
      </div>
    </ErrorBoundary>
  );
}
