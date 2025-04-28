"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useTranslations } from "next-intl";
import { useRtl } from "@/lib/hooks/useRtl";
import { HelpCircle, AlertCircle, Settings } from "lucide-react";
import { memo } from "react";
import { SidebarAction } from "./SidebarAction";

interface SidebarFooterProps {
  collapsed: boolean;
  locale: string;
}

function SidebarFooterComponent({ collapsed, locale }: SidebarFooterProps) {
  // Use our custom RTL hook for consistent RTL behavior
  const { isRtl, side } = useRtl(locale);
  const t = useTranslations("Chat");
  
  return (
    <ErrorBoundary
      fallback={<div className="border-t border-border/40 px-2 py-4 text-destructive text-sm">Error loading footer</div>}
      context="SidebarFooter"
    >
      <div
        dir={isRtl ? "rtl" : "ltr"}
        className="border-t border-border/40 py-1 space-y-1"
      >
        <TooltipProvider>
          <SidebarAction collapsed={collapsed} locale={locale} href="/help" label={t("help")} Icon={HelpCircle} />
          <SidebarAction collapsed={collapsed} locale={locale} href="/changelog" label={t("changelog")} Icon={AlertCircle} />
          <SidebarAction collapsed={collapsed} locale={locale} href="/settings" label={t("settings")} Icon={Settings} />
        </TooltipProvider>
        {/* Disclaimer - only show when not collapsed */}
        {!collapsed && (
          <div className="border-t border-border/40 px-4 py-2">
            <p className={cn(
              "text-xs text-muted-foreground",
              isRtl && "text-right"
            )}>
              {t("disclaimer")}
            </p>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export const SidebarFooter = memo(SidebarFooterComponent);
