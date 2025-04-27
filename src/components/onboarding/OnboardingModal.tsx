"use client";

import React from 'react';
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

interface OnboardingModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  headline: string;
  subheading: string;
  // Add other step-specific props if needed, e.g., children: React.ReactNode
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
}: OnboardingModalProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[500px] aspect-square flex flex-col overflow-hidden [&>button]:hidden p-0">
        {/* Removed Header component, can be added back if needed */}
        {/* <DialogHeader className="flex-shrink-0 h-8 p-6"> </DialogHeader> */}

        {/* --- Video/GIF Placeholder --- */}
        <div className="w-full h-1/2 flex-shrink-0 bg-muted flex items-center justify-center">
          <span className="text-sm text-muted-foreground">Video/GIF Placeholder (1/2 height)</span>
        </div>
        {/* --- End Placeholder --- */}
        
        {/* Content Area */}
        <div className="pt-6 px-6 flex-grow overflow-y-auto space-y-4">
          <h2 className="text-2xl font-semibold text-center">
            {headline}
          </h2>
          <p className="text-lg text-muted-foreground text-center">
            {subheading}
          </p>
          {/* Add other step-specific content/children here */}
        </div>

        {/* Footer Area - Dots moved between buttons using order */}
        <DialogFooter className="flex-shrink-0 px-6 pb-6 flex items-center"> {/* No justify-between */}
          <Button 
            variant="ghost"
            onClick={onBack} 
            disabled={isFirstStep}
            className="order-1 rtl:order-3 hover:bg-transparent" // Back: First in LTR, Last in RTL
          >
            Back
          </Button>

          {/* Pagination Dots Container - Moved inside footer, middle order */}
          <div className="flex justify-center space-x-2 rtl:space-x-reverse order-2 flex-grow"> {/* Added order-2, flex-grow */}
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

          {/* Spacer div removed */}
          <Button 
            variant="ghost"
            onClick={onNext}
            className="order-3 rtl:order-1 hover:bg-transparent" // Next: Last in LTR, First in RTL
          >
            {isLastStep ? "Finish" : "Next"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 