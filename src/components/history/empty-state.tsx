"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, Archive, Pin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";

export interface EmptyStateProps {
  title: string;
  description: string;
  filterType: "all" | "pinned" | "archived";
}

export function EmptyState({ title, description, filterType }: EmptyStateProps) {
  const t = useTranslations("History");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const getIcon = () => {
    switch (filterType) {
      case "pinned":
        return <Pin className="h-12 w-12 text-muted-foreground" />;
      case "archived":
        return <Archive className="h-12 w-12 text-muted-foreground" />;
      default:
        return <MessageSquarePlus className="h-12 w-12 text-muted-foreground" />;
    }
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center py-16 px-4 border border-dashed rounded-lg",
      isRtl ? "text-right" : "text-left"
    )}>
      <div className="bg-muted/30 rounded-full p-4 mb-4">
        {getIcon()}
      </div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        {description}
      </p>
      {filterType === "all" && (
        <Button asChild>
          <Link href="/chat">
            <MessageSquarePlus className={cn("h-4 w-4", isRtl ? "ml-2" : "mr-2")} />
            {t("startNewChat")}
          </Link>
        </Button>
      )}
    </div>
  );
}
