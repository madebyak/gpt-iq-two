"use client";

import { CircleFadingPlus, HelpCircle, History, Settings, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { useTranslations } from 'next-intl';

interface SidebarProps {
  collapsed: boolean;
  locale: string;
}

export function Sidebar({ collapsed, locale }: SidebarProps) {
  const t = useTranslations('Chat');
  
  // This would come from a context or state management in a real implementation
  const recentChats = [
    { id: '1', title: 'How to optimize React performance', timestamp: new Date() },
    { id: '2', title: 'Building a responsive UI with Tailwind', timestamp: new Date() },
    { id: '3', title: 'Learning Next.js and server components', timestamp: new Date() },
    { id: '4', title: 'Creating accessible web applications', timestamp: new Date() },
    // Add more examples or fetch from API
  ];
  
  const isRtl = locale === 'ar';

  return (
    <div className={cn(
      "flex flex-col h-full border-border/40 bg-muted/10",
      isRtl ? "border-l" : "border-r"
    )}>
      {/* New Chat Button */}
      <div className="px-4 py-12">
        <Button 
          variant="outline" 
          className={cn(
            "w-full h-11 border-0 bg-card hover:bg-muted text-foreground",
            isRtl ? "text-right" : "text-left",
            collapsed && "justify-center"
          )}
        >
          {collapsed ? (
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
            {recentChats.map(chat => (
              <Tooltip key={chat.id} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full mb-1 h-9 py-1",
                      isRtl ? "text-right" : "text-left",
                      collapsed && "justify-center"
                    )}
                  >
                    {collapsed ? null : isRtl ? (
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
                {collapsed && (
                  <TooltipContent side={isRtl ? "left" : "right"}>
                    {chat.title}
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </ScrollArea>
      
      {/* Bottom Navigation */}
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
                <Link href="/help">
                  {collapsed ? (
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
                <Link href="/changelog">
                  {collapsed ? (
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
                <Link href="/settings">
                  {collapsed ? (
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
