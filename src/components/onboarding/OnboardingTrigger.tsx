"use client";

import React, { useState, useEffect } from 'react';
import { OnboardingModal } from './OnboardingModal';
import { useTranslations, useLocale } from 'next-intl';

const LOCAL_STORAGE_KEY = 'jahizOnboardingCompleted';

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
      headline: t('step3.headline'),
      subheading: t('step3.subheading'),
    },
    {
      headline: t('step4.headline'),
      subheading: t('step4.subheading'),
    },
    {
      headline: t('step5.headline'),
      subheading: t('step5.subheading'),
    },
  ];

  const TOTAL_STEPS = onboardingSteps.length;

  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Logic to show modal initially only if not completed
  useEffect(() => {
    try {
      const hasCompletedOnboarding = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (hasCompletedOnboarding !== 'true') {
        // If not completed, show the modal after a short delay
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 500);
        return () => clearTimeout(timer);
      }
      // If already completed, isOpen remains false, modal doesn't show
    } catch (error) {
      console.error("Failed to access localStorage for onboarding:", error);
      // Fallback: show modal if localStorage fails, or decide on other behavior
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
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, 'true');
      } catch (error) {
        console.error("Failed to set localStorage for onboarding completion:", error);
      }
      setIsOpen(false);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };
  
  const handleModalOpenChange = (open: boolean) => {
    if (!open) { // If modal is being closed
      try {
        const isAlreadyMarkedCompleted = localStorage.getItem(LOCAL_STORAGE_KEY) === 'true';
        if (!isAlreadyMarkedCompleted && currentStep < TOTAL_STEPS - 1) {
          // If not already marked by finishing AND it's being closed before the last step
          console.log("Onboarding dismissed before completion, marking as seen.");
          localStorage.setItem(LOCAL_STORAGE_KEY, 'true');
        }
      } catch (error) {
        console.error("Failed to access localStorage on modal close:", error);
      }
    }
    setIsOpen(open); // Update the state to actually close/open the modal
  };

  const currentStepContent = onboardingSteps[currentStep];

  // Only render the modal if isOpen is true
  if (!isOpen) {
    return null;
  }

  return (
    <OnboardingModal
      isOpen={isOpen}
      onOpenChange={handleModalOpenChange}
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
      onNext={handleNextStep}
      onBack={handlePrevStep}
      headline={currentStepContent.headline}
      subheading={currentStepContent.subheading}
      isRtl={isRtl}
      backButtonText={t('backButton')}
      nextButtonText={t('nextButton')}
      finishButtonText={t('finishButton')}
    />
  );
} 