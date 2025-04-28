"use client";

import { FC } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { UserCircle, History, Settings as SettingsIcon } from "lucide-react";

interface MobileNavProps {
  activeItem: "account" | "history" | "settings";
}

export const MobileNav: FC<MobileNavProps> = ({ activeItem }) => {
  const t = useTranslations("Account");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const items = [
    { href: "/account", label: t("accountNav.myAccount"), icon: UserCircle, active: activeItem === "account" },
    { href: "/history", label: t("accountNav.chatHistory"), icon: History, active: activeItem === "history" },
    { href: "/settings", label: t("accountNav.settings"), icon: SettingsIcon, active: activeItem === "settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full bg-background border-t border-border py-2 z-50">
      <div className="flex justify-evenly items-center">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={cn(
                "flex flex-col items-center p-2 rounded-md transition-colors flex-1",
                item.active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
