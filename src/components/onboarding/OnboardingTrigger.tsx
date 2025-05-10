"use client";

import React, { useState, useEffect } from 'react';
import { OnboardingModal } from './OnboardingModal';
import { useTranslations, useLocale } from 'next-intl';

export function OnboardingTrigger() {
  const t = useTranslations('Onboarding');
  const locale = useLocale();
  const isRtl = locale === 'ar';

  // Define content for each step
  const onboardingSteps = [
    {
      headline: t('step1.headline'),
      subheading: t('step1.subheading'),
    },
    {
      headline: t('step2.headline'),
      subheading: t('step2.subheading'),
    },
    {
      headline: "Select Your Interests",
      subheading: "Help us tailor suggestions for you. (Step 3/5)",
    },
    {
      headline: "Privacy Preferences",
      subheading: "Configure how your data is handled. (Step 4/5)",
    },
    {
      headline: "All Set!",
      subheading: "You're ready to start chatting smarter. (Step 5/5)",
    },
  ];

  const TOTAL_STEPS = onboardingSteps.length;

  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Logic to show modal initially
  useEffect(() => {
    const needsOnboarding = true; 
    if (needsOnboarding) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500); 
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNextStep = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      console.log("Onboarding finished!");
      setIsOpen(false); 
      // TODO: Add logic to mark onboarding as complete
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const currentStepContent = onboardingSteps[currentStep];

  return (
    <OnboardingModal 
      isOpen={isOpen} 
      onOpenChange={setIsOpen} 
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
      onNext={handleNextStep}
      onBack={handlePrevStep}
      headline={currentStepContent.headline}
      subheading={currentStepContent.subheading}
      isRtl={isRtl}
    />
  );
} 