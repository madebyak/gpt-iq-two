"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/auth/auth-context";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { Moon, Sun, Laptop, CheckCircle2 } from "lucide-react";

export function AppearanceSettings() {
  const { theme: currentTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const { profile, updateProfile } = useAuth();
  const t = useTranslations("Settings");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const supabase = createClient();

  // Mounting state to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const themes = [
    {
      id: "light",
      name: t("appearance.light"),
      icon: Sun,
    },
    {
      id: "dark",
      name: t("appearance.dark"),
      icon: Moon,
    },
    {
      id: "system",
      name: t("appearance.system"),
      icon: Laptop,
    },
  ];

  const handleThemeChange = async (newTheme: string) => {
    try {
      setSaving(true);
      
      // Update theme in local state/storage
      setTheme(newTheme);
      
      // Update theme preference in database if user is logged in
      if (profile) {
        const { error } = await updateProfile({
          preferredTheme: newTheme as "light" | "dark" | "system",
        });
        
        if (error) throw error;
        
        toast.success(t("appearance.themeSaved"));
      }
    } catch (error) {
      console.error("Error saving theme preference:", error);
      toast.error(t("appearance.errorSaving"));
    } finally {
      setSaving(false);
    }
  };

  // Only show UI after mounting to prevent hydration mismatch
  if (!mounted) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("appearance.title")}</CardTitle>
        <CardDescription>{t("appearance.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className={cn(
            "grid grid-cols-3 gap-4",
            isRtl ? "text-right" : "text-left"
          )}>
            {themes.map((theme) => {
              const Icon = theme.icon;
              const isActive = currentTheme === theme.id;
              
              return (
                <Button
                  key={theme.id}
                  variant={isActive ? "default" : "outline"}
                  className={cn(
                    "flex-col h-auto space-y-2 p-4",
                    isActive && "border-primary"
                  )}
                  onClick={() => handleThemeChange(theme.id)}
                  disabled={saving}
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className={cn(
                      "h-5 w-5",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <div className="text-sm font-medium">{theme.name}</div>
                  
                  {isActive && (
                    <CheckCircle2 className="h-4 w-4 text-primary absolute top-2 right-2" />
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
