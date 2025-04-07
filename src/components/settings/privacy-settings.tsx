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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

export function PrivacySettings() {
  const { profile, updateProfile, deleteAccount } = useAuth();
  const t = useTranslations("Settings");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Default privacy settings (will be overriden by user profile if available)
  const [saveConversationHistory, setSaveConversationHistory] = useState(
    profile?.privacySettings?.saveConversationHistory ?? true
  );
  const [allowUsageData, setAllowUsageData] = useState(
    profile?.privacySettings?.allowUsageData ?? true
  );
  const [allowErrorReporting, setAllowErrorReporting] = useState(
    profile?.privacySettings?.allowErrorReporting ?? true
  );

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      if (profile) {
        const privacySettings = {
          saveConversationHistory,
          allowUsageData,
          allowErrorReporting
        };
        
        const { error } = await updateProfile({ privacySettings });
        
        if (error) throw error;
        
        toast.success(t("privacy.settingsSaved"));
      }
    } catch (error) {
      console.error("Error saving privacy settings:", error);
      toast.error(t("privacy.errorSaving"));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      await deleteAccount();
      // No need for success message as the user will be redirected to sign-in page
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error(t("privacy.errorDeleting"));
      setDeleting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("privacy.title")}</CardTitle>
          <CardDescription>{t("privacy.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "space-y-6",
            isRtl ? "text-right" : "text-left"
          )}>
            {/* Save conversation history setting */}
            <div className={cn(
              "flex items-center justify-between",
              isRtl ? "flex-row-reverse" : ""
            )}>
              <div className="space-y-0.5">
                <Label htmlFor="save-history">{t("privacy.saveHistory")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("privacy.saveHistoryDescription")}
                </p>
              </div>
              <Switch
                id="save-history"
                checked={saveConversationHistory}
                onCheckedChange={setSaveConversationHistory}
                disabled={saving}
              />
            </div>
            
            {/* Allow usage data setting */}
            <div className={cn(
              "flex items-center justify-between",
              isRtl ? "flex-row-reverse" : ""
            )}>
              <div className="space-y-0.5">
                <Label htmlFor="allow-usage">{t("privacy.allowUsage")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("privacy.allowUsageDescription")}
                </p>
              </div>
              <Switch
                id="allow-usage"
                checked={allowUsageData}
                onCheckedChange={setAllowUsageData}
                disabled={saving}
              />
            </div>
            
            {/* Allow error reporting setting */}
            <div className={cn(
              "flex items-center justify-between",
              isRtl ? "flex-row-reverse" : ""
            )}>
              <div className="space-y-0.5">
                <Label htmlFor="allow-errors">{t("privacy.allowErrors")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("privacy.allowErrorsDescription")}
                </p>
              </div>
              <Switch
                id="allow-errors"
                checked={allowErrorReporting}
                onCheckedChange={setAllowErrorReporting}
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
      
      {/* Account deletion card */}
      <Card className="mt-6 border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">{t("privacy.deleteAccount")}</CardTitle>
          <CardDescription>{t("privacy.deleteAccountDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className={cn(
                  "h-4 w-4 mr-2",
                  isRtl ? "ml-2 mr-0" : ""
                )} />
                {t("privacy.deleteAccountButton")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("privacy.deleteConfirmTitle")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("privacy.deleteConfirmDescription")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className={isRtl ? "flex-row-reverse" : ""}>
                <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {deleting ? t("privacy.deleting") : t("privacy.confirmDelete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </>
  );
}
