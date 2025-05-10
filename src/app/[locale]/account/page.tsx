"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { AccountLayout } from "@/components/layout/AccountLayout";
import dynamic from 'next/dynamic';

// Dynamically import ProfileSection with SSR turned off
const ProfileSection = dynamic(
  () => import('@/components/account/profile-section').then(mod => mod.ProfileSection),
  { 
    ssr: false,
    // Optional: add a loading component if ProfileSection takes time to load or if there's a visual flash
    // loading: () => <div className="h-64 bg-muted/60 rounded-lg animate-pulse"></div> 
  }
);

export default function AccountPage() {
  const t = useTranslations("Account");
  const locale = useLocale();

  return (
    <AccountLayout
      title={t("pageTitle")}
      description={t("pageDescription")}
      activeItem="account"
      breadcrumbItems={[
        { label: t("breadcrumb.home"), href: `/` },
        { label: t("accountNav.myAccount"), href: `/account` },
      ]}
    >
      <div className="space-y-6">
        <ProfileSection />
      </div>
    </AccountLayout>
  );
}
