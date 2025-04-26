"use client";

import { forwardRef, ForwardedRef } from "react";
import { useLocale } from "next-intl";
import { Link as IntlLink } from "@/i18n/navigation";
import { UrlObject } from "url";
import { Button, ButtonProps } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useRtl } from "@/lib/hooks/useRtl";

interface SidebarButtonProps extends Omit<ButtonProps, 'children' | 'aria-label'> {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  href?: string | UrlObject;
  collapsed: boolean;
  className?: string;
  locale?: string;
  iconOnlyWhenExpanded?: boolean;
}

export const SidebarButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, SidebarButtonProps>(
  (
    {
      Icon,
      label,
      href,
      collapsed,
      className,
      variant = "ghost",
      size = "sm",
      locale: propLocale,
      iconOnlyWhenExpanded = false,
      ...props
    },
    ref
  ) => {
    const contextLocale = useLocale();
    const locale = propLocale || contextLocale;
    const { isRtl, textAlign, flipIcon, side } = useRtl(locale);
    
    const iconClass = cn("h-4 w-4 shrink-0", isRtl && flipIcon);

    const commonButtonClasses = cn(
      "w-full h-9 justify-start",
      textAlign,
      collapsed && ["justify-center", "min-w-0", variant === "outline" && "border-0"],
      className
    );

    let content;
    if (collapsed || iconOnlyWhenExpanded) {
      content = <Icon className={iconClass} />;
    } else if (isRtl) {
      content = (
        <div className="flex w-full flex-row items-center gap-x-2">
          <span className="text-sm flex-grow truncate">{label}</span>
          <Icon className={iconClass} />
        </div>
      );
    } else {
      content = (
        <div className="flex w-full flex-row items-center gap-x-2">
          <Icon className={iconClass} />
          <span className="text-sm flex-grow truncate">{label}</span>
        </div>
      );
    }

    let buttonElement: React.ReactNode;
    if (href) {
      buttonElement = (
        <Button
          asChild
          variant={variant}
          size={size}
          className={cn(commonButtonClasses, !collapsed && iconOnlyWhenExpanded && "px-3")}
          aria-label={label}
          {...props}
        >
          <IntlLink href={href} locale={locale}>
            {content}
          </IntlLink>
        </Button>
      );
    } else {
      buttonElement = (
        <Button
          ref={ref as ForwardedRef<HTMLButtonElement>}
          variant={variant}
          size={size}
          className={cn(commonButtonClasses, !collapsed && iconOnlyWhenExpanded && "px-3")}
          aria-label={label}
          {...props}
        >
          {content}
        </Button>
      );
    }

    return collapsed || iconOnlyWhenExpanded ? (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{buttonElement}</TooltipTrigger>
          <TooltipContent side={side} className="bg-background text-foreground">
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      buttonElement
    );
  }
);

SidebarButton.displayName = "SidebarButton"; 