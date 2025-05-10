"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import dynamic from 'next/dynamic';
import { AccountLayout } from "@/components/layout/AccountLayout";
// import { ProfileSection } from "@/components/account/profile-section";

// Dynamically import ProfileSection with SSR turned off
const ProfileSection = dynamic(() => import('@/components/account/profile-section').then(mod => mod.ProfileSection), {
  ssr: false,
  loading: () => <p>Loading profile...</p> // Optional: add a loading component
});

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
