"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { AccountLayout } from "@/components/layout/AccountLayout";
import { ProfileSection } from "@/components/account/profile-section";

export default function AccountPage() {
  const { user, isLoading } = useAuth();
  const t = useTranslations("Account");
  const locale = useLocale();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/auth/login?returnUrl=/account`);
    }
  }, [user, isLoading, router, locale]);

  if (isLoading) {
    // Loading state is handled by AccountLayout
    return null;
  }

  // Don't render page content if not authenticated
  if (!user) return null;

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
