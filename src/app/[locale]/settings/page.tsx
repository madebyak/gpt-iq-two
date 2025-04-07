"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppearanceSettings } from "@/components/settings/appearance-settings";
import { LanguageSettings } from "@/components/settings/language-settings";
import { ChatSettings } from "@/components/settings/chat-settings";
import { PrivacySettings } from "@/components/settings/privacy-settings";
import { SecuritySection } from "@/components/account/security-section";
import { ProfileSection } from "@/components/account/profile-section";
import { AccountLayout } from "@/components/layout/AccountLayout";

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const t = useTranslations("Settings");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/auth/login?returnUrl=/settings`);
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
      activeItem="settings"
      breadcrumbItems={[
        { label: t("breadcrumb.home"), href: `/` },
        { label: t("breadcrumb.settings"), href: `/settings` },
      ]}
    >
      <div className="space-y-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full max-w-md">
            <TabsTrigger value="profile" className="flex-1">{t("tabs.profile")}</TabsTrigger>
            <TabsTrigger value="security" className="flex-1">{t("tabs.security")}</TabsTrigger>
            <TabsTrigger value="appearance" className="flex-1">{t("tabs.appearance")}</TabsTrigger>
            <TabsTrigger value="language" className="flex-1">{t("tabs.language")}</TabsTrigger>
            <TabsTrigger value="chat" className="flex-1">{t("tabs.chat")}</TabsTrigger>
            <TabsTrigger value="privacy" className="flex-1">{t("tabs.privacy")}</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="mt-6">
            <ProfileSection />
          </TabsContent>
          <TabsContent value="security" className="mt-6">
            <SecuritySection />
          </TabsContent>
          <TabsContent value="appearance" className="mt-6">
            <AppearanceSettings />
          </TabsContent>
          <TabsContent value="language" className="mt-6">
            <LanguageSettings />
          </TabsContent>
          <TabsContent value="chat" className="mt-6">
            <ChatSettings />
          </TabsContent>
          <TabsContent value="privacy" className="mt-6">
            <PrivacySettings />
          </TabsContent>
        </Tabs>
      </div>
    </AccountLayout>
  );
}
