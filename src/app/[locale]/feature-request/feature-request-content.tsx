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
import { useTranslations, useLocale } from 'next-intl';

const MAX_CHARS = 1000;

export default function FeatureRequestContent() {
  const t = useTranslations('FeatureRequestPage');
  const locale = useLocale();
  const { user, session, isLoading: isLoadingAuth } = useAuth();
  
  const [triggerHeading, setTriggerHeading] = useState(false);
  const [triggerSubheading, setTriggerSubheading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [requestDetails, setRequestDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccessMessage, setApiSuccessMessage] = useState<string | null>(null);

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

  const handleSubmit = async () => {
    if (!session) {
      console.log("User not authenticated. Cannot submit.");
      setApiError(t('apiMessages.errorNotLoggedIn'));
      return;
    }
    if (selectedCategories.length === 0 || requestDetails.trim() === "") {
      setApiError(t('apiMessages.errorMissingFields'));
      return;
    }

    setIsSubmitting(true);
    setApiError(null);
    setApiSuccessMessage(null);

    try {
      const response = await fetch('/api/feature-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categories: selectedCategories,
          details: requestDetails,
          pageUrl: window.location.href,
        }),
      });

      const result = await response.json();

      console.log("API Response messageKey:", result.messageKey);

      if (!response.ok) {
        const errorMessage = result.messageKey ? t(result.messageKey as any) : (result.error || t('apiMessages.errorGeneral'));
        throw new Error(errorMessage);
      }

      const successMsg = result.messageKey ? t(result.messageKey as any) : (result.message || t('apiMessages.successGeneral'));
      setApiSuccessMessage(successMsg);
      setSelectedCategories([]);
      setRequestDetails("");
    } catch (error: any) {
      console.error("Submission error:", error);
      setApiError(error.message || t('apiMessages.errorGeneral'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { id: "featureRequest", label: t('categoryFeatureRequest') },
    { id: "reportBugs", label: t('categoryReportBugs') },
    { id: "feedback", label: t('categoryFeedback') },
    { id: "others", label: t('categoryOthers') },
  ];

  const remainingChars = MAX_CHARS - requestDetails.length;
  const canSubmit = selectedCategories.length > 0 && requestDetails.trim().length > 0 && !!session && !isLoadingAuth && !isSubmitting;

  const isArabicLocale = locale === 'ar';

  return (
    <div className="flex flex-col items-center p-6 pt-12 md:pt-16 w-full">
      <SplitText
        text={t('heading')}
        trigger={triggerHeading}
        isArabic={isArabicLocale}
        className={cn(
          "font-bold mb-6 md:mb-8 leading-tight text-center",
          isArabicLocale ? "text-6xl md:text-7xl" : "text-7xl md:text-8xl"
        )}
        delay={isArabicLocale ? 100 : 50}
        animationFrom={{ opacity: 0, transform: 'translate3d(0,50px,0)' }}
        animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
        easing={easings.easeOutCubic}
        onAnimationComplete={handleHeadingAnimationComplete}
      />
      <SplitText
        text={t('subheading')}
        trigger={triggerSubheading}
        isArabic={isArabicLocale}
        className={cn(
          "text-muted-foreground max-w-3xl md:max-w-4xl !text-center mb-10 md:mb-12",
          isArabicLocale ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl"
        )}
        delay={isArabicLocale ? 80 : 25}
        animationFrom={{ opacity: 0, transform: 'translate3d(0,30px,0)' }}
        animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
        easing={easings.easeOutCubic}
        onAnimationComplete={handleSubheadingAnimationComplete}
      />

      {/* API Error Message */}
      {apiError && (
        <div className="mb-4 w-full max-w-xl md:max-w-2xl p-3 rounded-md bg-destructive/10 text-destructive text-center">
          {apiError}
        </div>
      )}
      
      {/* API Success Message */}
      {apiSuccessMessage && (
        <div className="mb-4 w-full max-w-xl md:max-w-2xl p-3 rounded-md bg-primary/10 text-primary text-center">
          {apiSuccessMessage}
        </div>
      )}

      {isLoadingAuth && (
        <div className="mb-10 text-muted-foreground">
          {t('authLoading')}
        </div>
      )}

      {!isLoadingAuth && !session && (
        <div className="mb-10 text-center p-4 border border-dashed rounded-md">
          <p className="text-lg text-destructive">{t('authSignInPrompt')}</p>
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
        aria-label={t('categoryAriaLabel')}
      >
        {categories.map((category) => (
          <ToggleGroupItem
            key={category.id}
            value={category.id}
            className={cn(
              "px-6 py-3 h-auto border-2 rounded-lg transition-all duration-200 ease-in-out",
              "data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:text-primary",
              "hover:bg-accent/50 hover:border-accent-foreground/30",
              "w-full sm:w-auto sm:min-w-[150px]"
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
            isArabicLocale ? "text-right" : "text-left"
            )}
        >
          {t('detailsRemainingChars', { remainingChars })}
        </Label>
        <Textarea
          id="request-details-textarea"
          value={requestDetails}
          onChange={handleDetailsChange}
          placeholder={t('detailsPlaceholder')}
          maxLength={MAX_CHARS}
          rows={6}
          className="w-full p-3 border-2 rounded-lg transition-colors duration-200 ease-in-out resize-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-input text-base"
          aria-label={t('detailsAriaLabel')}
        />
      </div>

      <div className="w-full max-w-xl md:max-w-2xl">
        <Button 
          onClick={handleSubmit}
          disabled={!canSubmit || isLoadingAuth || isSubmitting}
          className={cn(
            "w-full py-3 text-lg",
            "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
          )}
          size="lg"
        >
          {isSubmitting ? t('submittingButton') : t('submitButton')}
        </Button>
      </div>
    </div>
  );
} 