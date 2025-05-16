"use client";

import { cn } from '@/lib/utils';
import SplitText from '@/components/effects/SplitText';
import { easings } from '@react-spring/web';
import { useState, useEffect } from 'react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { useTranslations } from "next-intl";

interface FeatureRequestContentProps {
  locale: string;
  headingText: string;
  subheadingText: string;
}

const MAX_CHARS = 1000;

export default function FeatureRequestContent({ 
  locale, 
  headingText, 
  subheadingText
}: FeatureRequestContentProps) {
  const isArabic = locale === 'ar';
  const { user, session, isLoading: isLoadingAuth } = useAuth();
  const t = useTranslations("FeatureRequest");

  const [triggerHeading, setTriggerHeading] = useState(false);
  const [triggerSubheading, setTriggerSubheading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [requestDetails, setRequestDetails] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setTriggerHeading(true);
      setTriggerSubheading(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleHeadingAnimationComplete = () => {
    console.log('Heading animation complete!');
  };

  const handleSubheadingAnimationComplete = () => {
    console.log('Subheading animation complete!');
  };

  const handleDetailsChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (event.target.value.length <= MAX_CHARS) {
      setRequestDetails(event.target.value);
    }
  };

  const handleSubmit = () => {
    if (!session) {
      console.log("User not authenticated. Cannot submit.");
      return;
    }
    console.log("Submit clicked!");
    console.log("Selected Categories:", selectedCategories);
    console.log("Request Details:", requestDetails);
    // Here you would typically send this data to your backend/API
    // For now, let's clear the fields as a simple feedback
    setSelectedCategories([]);
    setRequestDetails("");
    // You might want to show a success toast/message here
  };

  const categories = [
    { id: "featureRequest", label: isArabic ? "طلب ميزة" : "Feature Request" },
    { id: "reportBugs", label: isArabic ? "الإبلاغ عن خطأ" : "Report Bugs" },
    { id: "feedback", label: isArabic ? "ملاحظات" : "Feedback" },
    { id: "others", label: isArabic ? "أخرى" : "Others" },
  ];

  const remainingChars = MAX_CHARS - requestDetails.length;
  const canSubmit = selectedCategories.length > 0 && requestDetails.trim().length > 0 && !!session && !isLoadingAuth;

  return (
    <div className="flex flex-col items-center p-6 pt-12 md:pt-16 w-full">
      <SplitText
        text={headingText}
        isArabic={isArabic}
        trigger={triggerHeading}
        className={cn(
          "font-bold mb-6 md:mb-8 leading-tight text-center",
          isArabic ? "text-6xl md:text-7xl" : "text-7xl md:text-8xl"
        )}
        delay={isArabic ? 100 : 50}
        animationFrom={{ opacity: 0, transform: 'translate3d(0,50px,0)' }}
        animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
        easing={easings.easeOutCubic}
        onAnimationComplete={handleHeadingAnimationComplete}
      />
      <SplitText
        text={subheadingText}
        isArabic={isArabic}
        trigger={triggerSubheading}
        className="text-3xl md:text-4xl text-muted-foreground max-w-3xl md:max-w-4xl !text-center mb-10 md:mb-12"
        delay={isArabic ? 100 : 25}
        animationFrom={{ opacity: 0, transform: 'translate3d(0,30px,0)' }}
        animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
        easing={easings.easeOutCubic}
        onAnimationComplete={handleSubheadingAnimationComplete}
      />

      {isLoadingAuth && (
        <div className="mb-10 text-muted-foreground">
          {t("loading")}...
        </div>
      )}

      {!isLoadingAuth && !session && (
        <div className="mb-10 text-center p-4 border border-dashed rounded-md">
          <p className="text-lg text-destructive">{t("pleaseLogIn")}</p>
        </div>
      )}

      <ToggleGroup
        type="multiple"
        variant="outline"
        value={selectedCategories}
        onValueChange={(value) => {
          setSelectedCategories(value);
        }}
        className="flex flex-wrap justify-center gap-3 md:gap-4 mb-10 md:mb-12"
        aria-label={isArabic ? "اختر فئة" : "Select a category"}
      >
        {categories.map((category) => (
          <ToggleGroupItem
            key={category.id}
            value={category.id}
            className={cn(
              "px-6 py-3 h-auto border-2 rounded-lg transition-all duration-200 ease-in-out",
              "data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:text-primary",
              "hover:bg-accent/50 hover:border-accent-foreground/30",
              isArabic ? "min-w-[120px]" : "min-w-[150px]"
            )}
            aria-label={category.label}
          >
            <span className={cn(
              "w-4 h-4 rounded-full border-2 mr-3 transition-colors duration-200 ease-in-out",
              selectedCategories.includes(category.id) ? "bg-primary border-primary" : "border-muted-foreground/50 group-hover:border-accent-foreground/70"
            )}></span>
            {category.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div className="w-full max-w-xl md:max-w-2xl flex flex-col mb-8 md:mb-10">
        <Label 
          htmlFor="request-details-textarea"
          className={cn(
            "text-sm mb-1 w-full",
            remainingChars === 0 ? "text-destructive" : "text-muted-foreground",
            isArabic ? "text-right" : "text-left"
            )}
        >
          {isArabic ? `الأحرف المتبقية: ${remainingChars}` : `${remainingChars} characters remaining`}
        </Label>
        <Textarea
          id="request-details-textarea"
          value={requestDetails}
          onChange={handleDetailsChange}
          placeholder={isArabic ? "اكتب تفاصيل طلبك هنا..." : "Write your detailed request here..."}
          maxLength={MAX_CHARS}
          rows={6}
          className="w-full p-3 border-2 rounded-lg transition-colors duration-200 ease-in-out resize-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-input"
          aria-label={isArabic ? "تفاصيل الطلب" : "Request details"}
        />
      </div>

      <div className="w-full max-w-xl md:max-w-2xl">
        <Button 
          onClick={handleSubmit}
          disabled={!canSubmit || isLoadingAuth}
          className={cn(
            "w-full py-3 text-lg",
            "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
          )}
          size="lg"
        >
          {isArabic ? "إرسال" : "Submit"}
        </Button>
      </div>
    </div>
  );
} 