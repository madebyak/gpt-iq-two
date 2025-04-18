"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CircleFadingPlus } from "lucide-react";
import { memo } from "react";
import { useRtl } from "@/lib/hooks/useRtl";
import { logger } from "@/lib/utils/logger";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useTranslations } from "next-intl";

interface SidebarHeaderProps {
  collapsed: boolean;
  locale: string;
  onNewChat: () => void;
}

function SidebarHeaderComponent({ collapsed, locale, onNewChat }: SidebarHeaderProps) {
  // Use our custom RTL hook instead of manually determining direction
  const { isRtl, textAlign, flipIcon } = useRtl(locale);
  const t = useTranslations("Chat");
  
  logger.debug(`SidebarHeader rendered with collapsed=${collapsed}, locale=${locale}`);
  
  const handleNewChat = () => {
    logger.debug('New chat button clicked');
    onNewChat();
  };
  
  return (
    <ErrorBoundary
      fallback={<div className="px-4 py-4 text-destructive">Error loading header</div>}
      context="SidebarHeader"
    >
      <div className="px-4 py-4">
        <Button 
          variant="outline" 
          className={cn(
            "border-0 bg-card hover:bg-muted/60 text-foreground",
            collapsed ? "justify-center h-10 w-10 mx-auto p-0 rounded-md" : "h-10 rounded-md w-full",
            // Use ternary expressions for complex conditional classes that our utilities don't cover
            isRtl ? (collapsed ? "mx-auto" : textAlign) : (collapsed ? "mx-auto" : textAlign)
          )}
          onClick={handleNewChat}
          aria-label={t("newChat")}
        >
          {collapsed ? (
            <CircleFadingPlus className="h-4 w-4 text-foreground" aria-hidden="true" />
          ) : (
            // Use fragment to group elements
            <>
              {/* Use our RTL utility for consistent icon placement */}
              <CircleFadingPlus 
                className={cn(
                  "h-4 w-4 text-foreground", 
                  isRtl ? "rtl-flip ml-2" : "mr-2"
                )} 
                aria-hidden="true" 
              />
              <span className={cn("flex-1", isRtl && "text-right")}>{t("newChat")}</span>
            </>
          )}
        </Button>
      </div>
    </ErrorBoundary>
  );
}

export const SidebarHeader = memo(SidebarHeaderComponent);
