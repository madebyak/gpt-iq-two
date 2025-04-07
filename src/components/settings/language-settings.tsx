"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from '@/i18n/navigation';
import { useAuth } from "@/lib/auth/auth-context";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Globe, CheckCircle2 } from "lucide-react";

export function LanguageSettings() {
  const { profile, updateProfile } = useAuth();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("Settings");
  const isRtl = locale === "ar";
  const [saving, setSaving] = useState(false);

  const languages = [
    {
      id: "en",
      name: "English",
      nativeName: "English"
    },
    {
      id: "ar",
      name: "Arabic",
      nativeName: "العربية"
    }
  ];

  const handleLanguageChange = async (newLocale: string) => {
    if (newLocale === locale) return;
    
    try {
      setSaving(true);
      
      // Update language preference in database if user is logged in
      if (profile) {
        const { error } = await updateProfile({
          preferredLanguage: newLocale as "en" | "ar",
        });
        
        if (error) throw error;
      }
      
      // Navigate to the new locale
      const path = window.location.pathname;
      const pathWithoutLocale = path.replace(/^\/[^/]+/, '');
      const newPath = pathWithoutLocale || '/';
      
      await router.replace(newPath, { locale: newLocale });
      toast.success(t("language.languageChanged"));
    } catch (error) {
      console.error("Error changing language:", error);
      toast.error(t("language.errorChanging"));
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("language.title")}</CardTitle>
        <CardDescription>{t("language.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <RadioGroup 
            value={locale} 
            onValueChange={handleLanguageChange}
            className={cn(
              "grid gap-4",
              isRtl ? "text-right" : "text-left"
            )}
          >
            {languages.map((language) => (
              <div key={language.id} className={cn(
                "flex items-center space-x-3 space-y-0 border p-4 rounded-lg relative",
                isRtl ? "flex-row-reverse space-x-reverse" : "",
                locale === language.id ? "border-primary" : "border-border"
              )}>
                <RadioGroupItem 
                  value={language.id} 
                  id={`language-${language.id}`}
                  disabled={saving}
                />
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Globe className="h-4 w-4" />
                  </div>
                  <Label 
                    htmlFor={`language-${language.id}`}
                    className="flex flex-col"
                  >
                    <span className="font-medium">{language.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {language.nativeName}
                    </span>
                  </Label>
                </div>
                
                {locale === language.id && (
                  <CheckCircle2 className={cn(
                    "h-4 w-4 text-primary absolute top-2",
                    isRtl ? "left-2" : "right-2"
                  )} />
                )}
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
