"use client";

import { FC } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { UserCircle, History, Settings as SettingsIcon, ChevronRight } from "lucide-react";

interface SidebarNavProps {
  activeItem: "account" | "history" | "settings";
}

export const SidebarNav: FC<SidebarNavProps> = ({ activeItem }) => {
  const t = useTranslations("Account");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const navigationItems = [
    { href: "/account", label: t("accountNav.myAccount"), icon: UserCircle, active: activeItem === "account" },
    { href: "/history", label: t("accountNav.chatHistory"), icon: History, active: activeItem === "history" },
    { href: "/settings", label: t("accountNav.settings"), icon: SettingsIcon, active: activeItem === "settings" },
  ];

  const ChevronIcon = isRtl
    ? (props: any) => <ChevronRight {...props} className="rtl-flip" />
    : ChevronRight;

  return (
    <div className={cn("w-60 shrink-0", isRtl ? "ml-8" : "mr-8")}>
      <h2 className={cn("text-xl font-semibold mb-6", isRtl ? "text-right" : "text-left")}>
        {t("userAccountTitle")}
      </h2>
      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={cn(
                "flex items-center py-2 px-3 rounded-md transition-colors",
                isRtl ? "flex-row-reverse text-right" : "text-left",
                item.active
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className={cn("flex-1", isRtl ? "mr-3" : "ml-3")}>{item.label}</span>
              {item.active && <ChevronIcon className="h-4 w-4 shrink-0" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
