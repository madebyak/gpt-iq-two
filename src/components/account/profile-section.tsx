"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useAuth } from "@/lib/auth/auth-context";
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
import Image from "next/image";
import { Pencil, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export function ProfileSection() {
  const { profile, updateProfile, getProfileImageUrl } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const t = useTranslations("Account");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const supabase = createClient();

  // Create form schema with translated error messages
  const profileFormSchema = z.object({
    firstName: z.string().min(1, {
      message: t("profileSection.firstNameRequired"),
    }),
    lastName: z.string().optional(),
    email: z.string().email({
      message: t("profileSection.emailInvalid"),
    }).optional(),
  });

  type ProfileFormValues = z.infer<typeof profileFormSchema>;

  // Initialize form with profile data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      email: profile?.email || "",
    },
  });

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    try {
      setIsUploading(true);
      
      // Validate file type and size
      if (!file.type.startsWith("image/")) {
        toast.error(t("profileSection.imageTypeError"));
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(t("profileSection.imageSizeError"));
        return;
      }

      // Generate a unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${profile.email.replace(/[^a-z0-9]/gi, "-")}-${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Update profile with new photo URL
      const { error: updateError } = await updateProfile({
        photoUrl: urlData.publicUrl,
      });

      if (updateError) {
        throw updateError;
      }

      toast.success(t("profileSection.imageUploadSuccess"));
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(t("profileSection.imageUploadError"));
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data: ProfileFormValues) => {
    if (!profile) return;

    try {
      setIsSaving(true);
      const { error } = await updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
      });

      if (error) {
        throw error;
      }

      toast.success(t("profileSection.updateSuccess"));
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(t("profileSection.updateError"));
    } finally {
      setIsSaving(false);
    }
  };

  // Handle form errors
  const onError = (errors: any) => {
    console.error("Form validation errors:", errors);
  };

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Profile Information Section */}
      <div>
        <div className="mb-4">
          <h2 className="text-2xl font-semibold">{t("profileSection.title")}</h2>
          <p className="text-muted-foreground mt-1">{t("profileSection.description")}</p>
        </div>
        
        <div className="rounded-lg border border-border bg-card/50 p-6 space-y-6">
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
            <div className="relative group">
              <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
                <Image
                  src={getProfileImageUrl(profile.photoUrl)}
                  alt={profile.firstName || "Profile"}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              </div>
              
              <label 
                htmlFor="profile-picture" 
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {isUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Pencil className="h-5 w-5" />
                )}
                <span className="sr-only">{t("profileSection.changePhoto")}</span>
              </label>
              
              <input
                id="profile-picture"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
            </div>
            
            <div>
              <h3 className="text-lg font-medium">
                {profile.firstName} {profile.lastName}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {profile.email}
              </p>
              <p className="text-sm text-muted-foreground mt-3">
                {t("profileSection.photoHelp")}
              </p>
            </div>
          </div>

          {/* Profile form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
              <div className={cn(
                "grid gap-6",
                isRtl ? "text-right" : "text-left"
              )}>
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="font-medium">{t("profileSection.firstName")}</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-background" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="font-medium">{t("profileSection.lastName")}</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-background" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="font-medium">{t("profileSection.email")}</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          disabled
                          className="bg-muted/30 cursor-not-allowed"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
                
              <div className={cn(
                "flex pt-4",
                isRtl ? "flex-row-reverse" : "flex-row"
              )}>
                <Button 
                  type="submit" 
                  disabled={!form.formState.isDirty || isSaving}
                  className={cn(
                    "gap-2",
                    isSaving && "cursor-not-allowed"
                  )}
                >
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t("profileSection.saveChanges")}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
