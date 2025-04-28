"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useTranslations } from "next-intl";
import { useRtl } from "@/lib/hooks/useRtl";
import { HelpCircle, AlertCircle, Settings } from "lucide-react";
import { memo } from "react";
import { SidebarAction } from "./SidebarAction";
import { Fragment } from "react";

interface SidebarFooterProps {
  collapsed: boolean;
  locale: string;
}

function SidebarFooterComponent({ collapsed, locale }: SidebarFooterProps) {
  // Use our custom RTL hook for consistent RTL behavior
  const { isRtl, side } = useRtl(locale);
  const t = useTranslations("Chat");
  
  // Function to render disclaimer with gradient on brand name
  const renderDisclaimer = () => {
    const fullDisclaimer = t("disclaimer");
    const brandNameEn = "Jahiz Bot";
    const brandNameAr = "بوت جاهز";
    const targetBrandName = locale === 'ar' ? brandNameAr : brandNameEn;

    const parts = fullDisclaimer.split(targetBrandName);

    if (parts.length === 2) {
      // Brand name found, render with gradient
      return (
        <>
          {parts[0]}
          <span className="jahiz-gradient-text">{targetBrandName}</span>
          {parts[1]}
        </>
      );
    } else {
      // Brand name not found or occurs multiple times unexpectedly, render normally
      return fullDisclaimer;
    }
  };
  
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
              {renderDisclaimer()}
            </p>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export const SidebarFooter = memo(SidebarFooterComponent);
