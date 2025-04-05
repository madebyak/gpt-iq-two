"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";

interface SocialButtonProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export function SocialButton({
  icon,
  label,
  onClick,
  className,
  disabled,
  isLoading = false
}: SocialButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className={cn("w-full h-12 flex items-center justify-center gap-2 text-base", className)}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <span className="h-5 w-5 flex items-center justify-center">
          {icon}
        </span>
      )}
      <span>{label}</span>
    </Button>
  );
}
