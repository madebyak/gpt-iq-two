"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { 
  UserCircle, 
  History, 
  Settings as SettingsIcon,
  ChevronRight
} from "lucide-react";
import Navbar from "@/components/layout/navbar";

interface AccountLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  activeItem?: 'account' | 'history' | 'settings';
  breadcrumbItems?: Array<{
    label: string;
    href: string;
  }>;
}

export function AccountLayout({ 
  children,
  title,
  description,
  activeItem = 'account',
  breadcrumbItems = []
}: AccountLayoutProps) {
  const { user, isLoading } = useAuth();
  const t = useTranslations("Account");
  const locale = useLocale();
  const pathname = usePathname();
  const isRtl = locale === "ar";
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile size
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  // Navigation items for the sidebar
  const navigationItems = [
    {
      href: `/account`,
      label: t("accountNav.myAccount"),
      icon: UserCircle,
      active: activeItem === "account",
    },
    {
      href: `/history`,
      label: t("accountNav.chatHistory"),
      icon: History,
      active: activeItem === "history",
    },
    {
      href: `/settings`,
      label: t("accountNav.settings"),
      icon: SettingsIcon,
      active: activeItem === "settings",
    },
  ];

  const ChevronIcon = isRtl ? (props: any) => <ChevronRight {...props} className="rtl-flip" /> : ChevronRight;

  if (isLoading) {
    return (
      <>
        <Navbar />
        <Container className="py-10">
          <div className="flex">
            {/* Sidebar skeleton */}
            <div className="hidden md:block w-60 shrink-0 mr-6">
              <div className="h-10 w-40 bg-muted/60 rounded animate-pulse mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-muted/60 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>
            
            {/* Content skeleton */}
            <div className="flex-1">
              <div className="h-8 w-48 bg-muted/60 rounded animate-pulse mb-8"></div>
              <div className="space-y-6">
                <div className="h-12 bg-muted/60 rounded-lg animate-pulse"></div>
                <div className="h-64 bg-muted/60 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </Container>
      </>
    );
  }

  // Don't render if not authenticated - the page components handle redirection
  if (!user) return null;

  // Mobile bottom navigation
  if (isMobile) {
    return (
      <div dir={isRtl ? "rtl" : "ltr"}>
        <Navbar />
        <main className="min-h-[calc(100vh-4rem)] pb-16">
          <div className="py-6 px-4">
            {children}
          </div>
        </main>
        
        {/* Mobile bottom navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border py-2 z-50">
          <div className="flex justify-around items-center">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={cn(
                    "flex flex-col items-center p-2 rounded-md transition-colors",
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
      </div>
    );
  }

  // Desktop sidebar layout
  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <Navbar />
      <Container className="py-8">
        <div className={cn(
          "flex",
          isRtl ? "flex-row-reverse" : "flex-row"
        )}>
          {/* Sidebar navigation */}
          <div className={cn(
            "w-60 shrink-0",
            isRtl ? "ml-8" : "mr-8"
          )}>
            <h2 className={cn(
              "text-xl font-semibold mb-6",
              isRtl ? "text-right" : "text-left"
            )}>
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
                    <span className={cn(
                      "flex-1",
                      isRtl ? "mr-3" : "ml-3"
                    )}>
                      {item.label}
                    </span>
                    {item.active && (
                      <ChevronIcon className="h-4 w-4 shrink-0" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* Main content */}
          <div className="flex-1 py-6 md:py-10">
            {/* Breadcrumbs */}
            {breadcrumbItems.length > 0 && (
              <nav className="flex mb-6 text-sm text-muted-foreground">
                <ol className={cn(
                  "flex items-center space-x-2",
                  isRtl && "flex-row-reverse space-x-reverse"
                )}>
                  {breadcrumbItems.map((item, index) => (
                    <li key={item.href} className="flex items-center">
                      {index > 0 && (
                        <ChevronRight className={cn(
                          "h-4 w-4 mx-2 text-muted-foreground/50",
                          isRtl && "transform rotate-180"
                        )} />
                      )}
                      <Link href={item.href} prefetch={true} className="hover:text-foreground transition-colors">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
            
            {/* Page title */}
            {title && (
              <div className="mb-6">
                <h1 className={cn(
                  "text-3xl font-bold tracking-tight",
                  isRtl ? "text-right" : "text-left"
                )}>
                  {title}
                </h1>
                {description && (
                  <p className={cn(
                    "text-muted-foreground mt-2",
                    isRtl ? "text-right" : "text-left"
                  )}>
                    {description}
                  </p>
                )}
              </div>
            )}
            
            {children}
          </div>
        </div>
      </Container>
    </div>
  );
}
