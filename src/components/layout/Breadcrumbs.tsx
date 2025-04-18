"use client";

import { FC } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";
import { ChevronRight } from "lucide-react";

interface Breadcrumb {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: Breadcrumb[];
}

export const Breadcrumbs: FC<BreadcrumbsProps> = ({ items }) => {
  const locale = useLocale();
  const isRtl = locale === "ar";

  return (
    <nav className="flex mb-6 text-sm text-muted-foreground">
      <ol className={cn(
        "flex items-center space-x-2",
        isRtl && "flex-row-reverse space-x-reverse"
      )}>
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight
                className={cn(
                  "h-4 w-4 mx-2 text-muted-foreground/50",
                  isRtl && "rtl-flip"
                )}
              />
            )}
            <Link href={item.href} prefetch={true} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
};
