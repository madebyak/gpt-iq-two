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
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Loader2, Shield, Mail, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export function SecuritySection() {
  const { user, profile } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const t = useTranslations("Account");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const supabase = createClient();

  // Create password form schema with translated messages
  const passwordFormSchema = z.object({
    currentPassword: z.string().min(6, {
      message: t("securitySection.passwordMinLength"),
    }),
    newPassword: z.string().min(6, {
      message: t("securitySection.passwordMinLength"),
    }),
    confirmPassword: z.string().min(6, {
      message: t("securitySection.passwordMinLength"),
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: t("securitySection.passwordsDoNotMatch"),
  });

  type PasswordFormValues = z.infer<typeof passwordFormSchema>;

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: PasswordFormValues) => {
    try {
      setIsSaving(true);
      
      // Verify current password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: data.currentPassword,
      });
      
      if (signInError) {
        form.setError("currentPassword", { 
          type: "manual", 
          message: t("securitySection.currentPasswordError") 
        });
        return;
      }
      
      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      });
      
      if (updateError) {
        throw updateError;
      }
      
      // Reset form
      form.reset();
      
      toast.success(t("securitySection.passwordChangeSuccess"));
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error(t("securitySection.passwordChangeError"));
    } finally {
      setIsSaving(false);
    }
  };
  
  const onError = (errors: any) => {
    console.error(errors);
  };
  
  if (!user || !profile) return null;
  
  const isGoogleConnected = user.app_metadata?.provider === "google";
  const isEmailPasswordConnected = !!user.email && !isGoogleConnected;
  
  return (
    <>
      {/* Connected accounts section */}
      <Card className="overflow-hidden border border-border">
        <CardHeader className="bg-muted/30">
          <CardTitle>{t("securitySection.connectedAccounts")}</CardTitle>
          <CardDescription>
            {t("securitySection.connectedAccountsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            {/* Email & Password connection */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{t("securitySection.emailPassword")}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {isEmailPasswordConnected && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {t("securitySection.primary")}
                  </Badge>
                )}
                <Badge variant={isEmailPasswordConnected ? "secondary" : "outline"}>
                  {isEmailPasswordConnected ? t("securitySection.connected") : t("securitySection.notConnected")}
                </Badge>
              </div>
            </div>
            
            {/* Google connection */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">{t("securitySection.google")}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {isGoogleConnected && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {t("securitySection.primary")}
                  </Badge>
                )}
                <Badge variant={isGoogleConnected ? "secondary" : "outline"}>
                  {isGoogleConnected ? t("securitySection.connected") : t("securitySection.notConnected")}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Change password section - only show for email/password accounts */}
      {isEmailPasswordConnected && (
        <Card className="mt-6 overflow-hidden border border-border">
          <CardHeader className="bg-muted/30">
            <CardTitle>{t("securitySection.changePassword")}</CardTitle>
            <CardDescription>
              {t("securitySection.changePasswordDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
                <div className={cn(
                  "grid gap-6",
                  isRtl ? "text-right" : "text-left"
                )}>
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="font-medium">
                          {t("securitySection.currentPassword")}
                        </FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              className="pr-10 bg-background"
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <Eye className="h-4 w-4" aria-hidden="true" />
                            )}
                            <span className="sr-only">
                              {showPassword
                                ? t("securitySection.hidePassword")
                                : t("securitySection.showPassword")}
                            </span>
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-2">
                    <Separator />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="font-medium">
                          {t("securitySection.newPassword")}
                        </FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              {...field}
                              type={showNewPassword ? "text" : "password"}
                              className="pr-10 bg-background"
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <Eye className="h-4 w-4" aria-hidden="true" />
                            )}
                            <span className="sr-only">
                              {showNewPassword
                                ? t("securitySection.hidePassword")
                                : t("securitySection.showPassword")}
                            </span>
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="font-medium">
                          {t("securitySection.confirmPassword")}
                        </FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              {...field}
                              type={showConfirmPassword ? "text" : "password"}
                              className="pr-10 bg-background"
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <Eye className="h-4 w-4" aria-hidden="true" />
                            )}
                            <span className="sr-only">
                              {showConfirmPassword
                                ? t("securitySection.hidePassword")
                                : t("securitySection.showPassword")}
                            </span>
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <CardFooter className={cn(
                  "px-0 pb-0 pt-4",
                  isRtl ? "flex-row-reverse" : "flex-row"
                )}>
                  <Button 
                    type="submit"
                    disabled={
                      !form.formState.isDirty || 
                      isSaving || 
                      !form.formState.isValid
                    }
                    className={cn(
                      "gap-2",
                      isSaving && "cursor-not-allowed"
                    )}
                  >
                    {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {t("securitySection.updatePassword")}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
      
      {/* Account security status card */}
      <Card className="mt-6 overflow-hidden border border-border">
        <CardHeader className="bg-muted/30">
          <CardTitle>{t("securitySection.accountSecurity")}</CardTitle>
          <CardDescription>
            {t("securitySection.accountSecurityDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-green-500">
                {t("securitySection.accountProtected")}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t("securitySection.accountProtectedDescription")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
