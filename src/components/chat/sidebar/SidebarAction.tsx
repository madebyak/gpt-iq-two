"use client";

import { FC, memo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useRtl } from "@/lib/hooks/useRtl";
import { cn } from "@/lib/utils";

interface SidebarActionProps {
  collapsed: boolean;
  locale: string;
  href: string;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const SidebarActionComponent: FC<SidebarActionProps> = ({ collapsed, locale, href, label, Icon }) => {
  const { isRtl, textAlign, flipIcon, side } = useRtl(locale);
  const iconClass = cn("h-4 w-4", isRtl && flipIcon);

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Button
          asChild
          variant="ghost"
          className={cn("w-full h-9 py-1", textAlign, collapsed && "justify-center")}
          aria-label={label}
        >
          <Link href={href} className={cn("flex w-full", collapsed && "justify-center")}>  
            {collapsed ? (
              <Icon className={iconClass} />
            ) : isRtl ? (
              <div className="w-full flex flex-row-reverse items-center gap-x-2">
                <Icon className={iconClass} />
                <span className="text-sm text-right flex-grow">{label}</span>
              </div>
            ) : (
              <div className="w-full flex flex-row items-center gap-x-2">
                <Icon className={iconClass} />
                <span className="text-sm text-left flex-grow">{label}</span>
              </div>
            )}
          </Link>
        </Button>
      </TooltipTrigger>
      {collapsed && <TooltipContent side={side}>{label}</TooltipContent>}
    </Tooltip>
  );
};

export const SidebarAction = memo(SidebarActionComponent);
