"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import dynamic from 'next/dynamic';
import { useAuth } from "@/lib/auth/auth-context";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
// import Navbar from "@/components/layout/navbar";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
// import { SidebarNav } from "./SidebarNav";
// import { MobileNav } from "./MobileNav";
// import { Breadcrumbs } from "./Breadcrumbs";

// Dynamically import Navbar with SSR turned off
const Navbar = dynamic(() => import('@/components/layout/navbar'), { 
  ssr: false,
  // You might want a placeholder for Navbar if it causes layout shifts
  // loading: () => <div className=\"h-16 border-b flex items-center justify-between px-4 animate-pulse bg-muted/60\"><div classname=\"h-7 w-24 bg-muted animate-pulse rounded-md\"></div><div classname=\"h-9 w-40 bg-muted animate-pulse rounded-md\"></div></div>
});

// Dynamically import other layout components
const SidebarNav = dynamic(() => import('./SidebarNav').then(mod => mod.SidebarNav), { ssr: false });
const MobileNav = dynamic(() => import('./MobileNav').then(mod => mod.MobileNav), { ssr: false });
const Breadcrumbs = dynamic(() => import('./Breadcrumbs').then(mod => mod.Breadcrumbs), { ssr: false });

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

export function AccountLayout({ children, title, description, activeItem = 'account', breadcrumbItems = [] }: AccountLayoutProps) {
  const { user, isLoading } = useAuth();
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const isMobile = useMediaQuery('(max-width: 767px)');
  const t = useTranslations('Account');

  if (isLoading) return (
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
  if (!user) return null;

  if (isMobile) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className="flex flex-col h-screen">
        <Navbar />
        <main className="flex-grow overflow-y-auto py-6 px-4 pb-16">
          {children}
        </main>
        <MobileNav activeItem={activeItem} />
      </div>
    );
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <Navbar />
      <Container className={cn('py-8 flex', isRtl ? 'flex-row-reverse' : 'flex-row')}>
        <SidebarNav activeItem={activeItem} />
        <div className="flex-1">
          {breadcrumbItems.length > 0 && <Breadcrumbs items={breadcrumbItems} />}
          {title && (
            <div className="mb-6">
              <h1 className={cn('text-3xl font-bold tracking-tight', isRtl ? 'text-right' : 'text-left')}>{title}</h1>
              {description && <p className={cn('text-muted-foreground mt-2', isRtl ? 'text-right' : 'text-left')}>{description}</p>}
            </div>
          )}
          {children}
        </div>
      </Container>
    </div>
  );
}
