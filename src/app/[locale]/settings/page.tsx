"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import dynamic from 'next/dynamic';
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppearanceSettings } from "@/components/settings/appearance-settings";
import { LanguageSettings } from "@/components/settings/language-settings";
import { ChatSettings } from "@/components/settings/chat-settings";
import { PrivacySettings } from "@/components/settings/privacy-settings";
import { SecuritySection } from "@/components/account/security-section";
import { AccountLayout } from "@/components/layout/AccountLayout";
import { Card } from "@/components/ui/card";

// Dynamically import ProfileSection with SSR turned off
const ProfileSection = dynamic(() => import('@/components/account/profile-section').then(mod => mod.ProfileSection), {
  ssr: false,
  loading: () => <p>Loading profile settings...</p>
});

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const t = useTranslations("Settings");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 767px)");

  // Fetch tab translations unconditionally at the top level
  const tabLabels = {
    profile: t("tabs.profile"),
    security: t("tabs.security"),
    appearance: t("tabs.appearance"),
    language: t("tabs.language"),
    chat: t("tabs.chat"),
    privacy: t("tabs.privacy"),
  };

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

  const renderMobileSettings = () => (
    <div className="space-y-6">
      <Card className="p-4 md:p-6"><ProfileSection /></Card>
      <Card className="p-4 md:p-6"><SecuritySection /></Card>
      <Card className="p-4 md:p-6"><AppearanceSettings /></Card>
      <Card className="p-4 md:p-6"><LanguageSettings /></Card>
      <Card className="p-4 md:p-6"><ChatSettings /></Card>
      <Card className="p-4 md:p-6"><PrivacySettings /></Card>
    </div>
  );

  const renderDesktopSettings = () => (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="h-9 p-0.5">
        <div className="whitespace-nowrap overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <TabsTrigger value="profile">{tabLabels.profile}</TabsTrigger>
          <TabsTrigger value="security">{tabLabels.security}</TabsTrigger>
          <TabsTrigger value="appearance">{tabLabels.appearance}</TabsTrigger>
          <TabsTrigger value="language">{tabLabels.language}</TabsTrigger>
          <TabsTrigger value="chat">{tabLabels.chat}</TabsTrigger>
          <TabsTrigger value="privacy">{tabLabels.privacy}</TabsTrigger>
        </div>
      </TabsList>
      <TabsContent value="profile" className="mt-6"><ProfileSection /></TabsContent>
      <TabsContent value="security" className="mt-6"><SecuritySection /></TabsContent>
      <TabsContent value="appearance" className="mt-6"><AppearanceSettings /></TabsContent>
      <TabsContent value="language" className="mt-6"><LanguageSettings /></TabsContent>
      <TabsContent value="chat" className="mt-6"><ChatSettings /></TabsContent>
      <TabsContent value="privacy" className="mt-6"><PrivacySettings /></TabsContent>
    </Tabs>
  );

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
        {isMobile ? renderMobileSettings() : renderDesktopSettings()}
      </div>
    </AccountLayout>
  );
}
