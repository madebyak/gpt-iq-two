"use client";

import { useEffect, useState } from "react";
import { 
  Toast, 
  ToastClose, 
  ToastDescription, 
  ToastProvider, 
  ToastTitle, 
  ToastViewport 
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";
import { useRtl } from "@/lib/hooks/useRtl";
import { logger } from "@/lib/utils/logger";

/**
 * ToastManager component that provides a centralized toast notification system
 * with RTL support and consistent styling
 */
export function ToastManager({ locale }: { locale: string }) {
  const { toasts, dismiss } = useToast();
  const { isRtl, side } = useRtl(locale);

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => {
        // Get toast variant and icon
        const variant = props.variant as string || "default";
        let Icon = Info;
        
        if (variant === "success") Icon = CheckCircle;
        if (variant === "destructive") Icon = XCircle;
        if (variant === "warning") Icon = AlertCircle;

        logger.debug(`Rendering toast: ${id}`, { variant, title });
        
        return (
          <Toast key={id} {...props}>
            <div className={cn("flex", isRtl ? "flex-row-reverse" : "flex-row")}>
              <div className="flex items-center justify-center mr-2">
                <Icon className={cn("h-5 w-5", 
                  variant === "default" && "text-foreground",
                  variant === "success" && "text-green-500",
                  variant === "destructive" && "text-destructive",
                  variant === "warning" && "text-orange-500",
                )} />
              </div>
              <div className="flex-1">
                {title && <ToastTitle className={cn(isRtl && "text-right")}>{title}</ToastTitle>}
                {description && (
                  <ToastDescription className={cn(isRtl && "text-right")}>
                    {description}
                  </ToastDescription>
                )}
              </div>
              <div>
                {action}
                <ToastClose />
              </div>
            </div>
          </Toast>
        );
      })}
      <ToastViewport className={cn(
        "fixed flex flex-col p-4 gap-2 max-h-screen z-[100] outline-none",
        "top-0 sm:bottom-0 sm:top-auto",
        isRtl ? "sm:left-0 left-0" : "sm:right-0 right-0"
      )} />
    </ToastProvider>
  );
}

/**
 * Hook that provides a standardized way to show toast notifications
 * @param locale Current locale
 * @returns Toast notification methods
 */
export function useToastManager(locale: string) {
  const { toast } = useToast();
  const { isRtl } = useRtl(locale);
  
  const showToast = (
    title: string, 
    description?: string, 
    variant: "default" | "destructive" | "success" | "warning" = "default",
    duration = 5000
  ) => {
    logger.debug(`Showing toast: ${title}`, { variant, duration });
    
    return toast({
      title,
      description,
      variant,
      duration,
      className: cn(isRtl && "rtl"),
    });
  };
  
  return {
    success: (title: string, description?: string, duration?: number) => 
      showToast(title, description, "success", duration),
    
    error: (title: string, description?: string, duration?: number) => 
      showToast(title, description, "destructive", duration),
    
    warning: (title: string, description?: string, duration?: number) => 
      showToast(title, description, "warning", duration),
    
    info: (title: string, description?: string, duration?: number) => 
      showToast(title, description, "default", duration)
  };
}
