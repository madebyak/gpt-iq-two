"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useAuth } from "@/lib/auth/auth-context";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

export function ChatSettings() {
  const { profile, updateProfile } = useAuth();
  const t = useTranslations("Settings");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [saving, setSaving] = useState(false);
  
  // Default chat settings (will be overriden by user profile if available)
  const [autoSendMessages, setAutoSendMessages] = useState(
    profile?.chatSettings?.autoSendMessages ?? true
  );
  const [enableSpeech, setEnableSpeech] = useState(
    profile?.chatSettings?.enableSpeech ?? false
  );
  const [enableSuggestions, setEnableSuggestions] = useState(
    profile?.chatSettings?.enableSuggestions ?? true
  );

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      if (profile) {
        const chatSettings = {
          autoSendMessages,
          enableSpeech,
          enableSuggestions,
        };
        
        const { error } = await updateProfile({ chatSettings });
        
        if (error) throw error;
        
        toast.success(t("chat.settingsSaved"));
      }
    } catch (error) {
      console.error("Error saving chat settings:", error);
      toast.error(t("chat.errorSaving"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("chat.title")}</CardTitle>
        <CardDescription>{t("chat.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={cn(
          "space-y-6",
          isRtl ? "text-right" : "text-left"
        )}>
          {/* Auto-send messages setting */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-send">{t("chat.autoSend")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("chat.autoSendDescription")}
              </p>
            </div>
            <Switch
              id="auto-send"
              checked={autoSendMessages}
              onCheckedChange={setAutoSendMessages}
              disabled={saving}
            />
          </div>
          
          {/* Enable speech setting */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-speech">{t("chat.enableSpeech")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("chat.enableSpeechDescription")}
              </p>
            </div>
            <Switch
              id="enable-speech"
              checked={enableSpeech}
              onCheckedChange={setEnableSpeech}
              disabled={saving}
            />
          </div>
          
          {/* Enable suggestions setting */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-suggestions">{t("chat.enableSuggestions")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("chat.enableSuggestionsDescription")}
              </p>
            </div>
            <Switch
              id="enable-suggestions"
              checked={enableSuggestions}
              onCheckedChange={setEnableSuggestions}
              disabled={saving}
            />
          </div>
          
          <Button 
            onClick={saveSettings} 
            disabled={saving}
            className="mt-6"
          >
            {saving ? t("common.saving") : t("common.saveChanges")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
