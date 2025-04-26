"use client";

import { CircleFadingPlus } from "lucide-react";
import { memo } from "react";
import { logger } from "@/lib/utils/logger";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useTranslations } from "next-intl";
import { SidebarButton } from "./SidebarButton";

interface SidebarHeaderProps {
  collapsed: boolean;
  locale: string;
  onNewChat: () => void;
}

function SidebarHeaderComponent({ collapsed, locale, onNewChat }: SidebarHeaderProps) {
  const t = useTranslations("Chat");
  
  logger.debug(`SidebarHeader rendered with collapsed=${collapsed}, locale=${locale}`);
  
  const handleNewChatClick = () => {
    logger.debug('New chat button clicked');
    onNewChat();
  };
  
  return (
    <ErrorBoundary
      fallback={<div className="px-4 py-4 text-destructive">Error loading header</div>}
      context="SidebarHeader"
    >
      <div className="py-4">
        <SidebarButton 
          variant="outline"
          className="border-0 bg-card hover:bg-muted/60 text-foreground h-10"
          Icon={CircleFadingPlus}
          label={t("newChat")}
          collapsed={collapsed}
          locale={locale}
          onClick={handleNewChatClick}
        />
      </div>
    </ErrorBoundary>
  );
}

export const SidebarHeader = memo(SidebarHeaderComponent);
