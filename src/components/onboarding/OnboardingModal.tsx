"use client";

import React from 'react';
import Image from 'next/image';
// import Lottie from 'lottie-react'; // Will be dynamically imported
// import secondAnimationData from '../../../public/onbording/second3.json'; // No longer needed for step 2 image
import { motion, PanInfo, AnimatePresence } from 'framer-motion';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Dynamically import Lottie component
import dynamic from 'next/dynamic';
const LottiePlayer = dynamic(() => import('lottie-react'), { 
  ssr: false,
  // Optional: add a simple loading state for Lottie
  loading: () => <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%'}}><p>Loading animation...</p></div>
});

interface OnboardingModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  headline: string;
  subheading: string;
  isRtl: boolean;
  // Add other step-specific props if needed, e.g., children: React.ReactNode
  backButtonText: string;
  nextButtonText: string;
  finishButtonText: string;
}

export function OnboardingModal({
  isOpen,
  onOpenChange,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  headline,
  subheading,
  isRtl,
  backButtonText,
  nextButtonText,
  finishButtonText,
}: OnboardingModalProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;
    const swipeVelocityThreshold = 0.3;
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    const swipedLeft = offset < -swipeThreshold || velocity < -swipeVelocityThreshold;
    const swipedRight = offset > swipeThreshold || velocity > swipeVelocityThreshold;

    if (isRtl) {
      if (swipedRight && !isLastStep) {
        onNext();
      } else if (swipedLeft && !isFirstStep) {
        onBack();
      }
    } else {
      if (swipedLeft && !isLastStep) {
        onNext();
      } else if (swipedRight && !isFirstStep) {
        onBack();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[500px] aspect-square flex flex-col overflow-hidden [&>button]:hidden p-0 focus-visible:outline-none focus-visible:ring-0 border-0">
        <DialogTitle asChild>
          <VisuallyHidden>{headline}</VisuallyHidden>
        </DialogTitle>

        <motion.div className="flex flex-col flex-grow">
          <div className="relative w-full h-1/2 flex-shrink-0 flex items-center justify-center overflow-hidden">
            <AnimatePresence initial={false} mode="wait">
              {currentStep === 0 && (
                <motion.div
                  key={0} // Unique key for the step
                  className="absolute inset-0" // Ensure it fills the parent for proper layout="fill"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <Image
                    src="/onbording/first.jpg"
                    alt="Jahiz AI Onboarding Step 1"
                    layout="fill"
                    objectFit="cover"
                    priority
                  />
                </motion.div>
              )}
              {currentStep === 1 && (
                <motion.div
                  key={1}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <Image
                    src="/onbording/second.jpg"
                    alt="Jahiz AI Onboarding Step 2"
                    layout="fill"
                    objectFit="cover"
                    priority
                  />
                </motion.div>
              )}
              {currentStep === 2 && (
                <motion.div
                  key={2}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <Image
                    src="/onbording/third.jpg"
                    alt="Jahiz AI Onboarding Step 3"
                    layout="fill"
                    objectFit="cover"
                    priority
                  />
                </motion.div>
              )}
              {currentStep === 3 && (
                <motion.div
                  key={3}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <Image
                    src="/onbording/fourth.jpg"
                    alt="Jahiz AI Onboarding Step 4"
                    layout="fill"
                    objectFit="cover"
                    priority
                  />
                </motion.div>
              )}
              {currentStep === 4 && (
                <motion.div
                  key={4}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <Image
                    src="/onbording/fifth.jpg"
                    alt="Jahiz AI Onboarding Step 5"
                    layout="fill"
                    objectFit="cover"
                    priority
                  />
                </motion.div>
              )}
              {currentStep >= 5 && ( // Fallback for any steps beyond what we have images for
                <motion.div
                  key={currentStep} // Use currentStep for any other step
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <span className="text-sm text-muted-foreground">Placeholder (Step {currentStep + 1})</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <motion.div 
            className="flex-grow overflow-hidden relative" 
            drag="x"
            dragConstraints={{ left: 0, right: 0 }} 
            onDragEnd={handleDragEnd}
            dragElastic={0.1}
          >
            <AnimatePresence initial={false}>
              <motion.div
                key={currentStep}
                className="absolute inset-0 pt-4 px-6 flex flex-col items-center justify-center space-y-2"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ ease: "easeInOut", duration: 0.3 }}
              >
                <h2 className="text-2xl font-semibold text-center">
                  {headline}
                </h2>
                <p className="text-lg text-muted-foreground text-center">
                  {subheading}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>

        <DialogFooter className="flex-shrink-0 px-6 pb-6 flex items-center">
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={isFirstStep}
            className="order-1 rtl:order-3 hover:bg-transparent hidden md:inline-flex"
          >
            {backButtonText}
          </Button>

          <div className="flex justify-center space-x-2 rtl:space-x-reverse order-2 flex-grow">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-2 w-2 rounded-full transition-colors duration-200",
                  currentStep === index ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            onClick={onNext}
            className="order-3 rtl:order-1 hover:bg-transparent hidden md:inline-flex"
          >
            {isLastStep ? finishButtonText : nextButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 