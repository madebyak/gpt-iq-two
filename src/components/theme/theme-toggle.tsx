"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from 'next-intl';

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  
  // Try to get translations, fall back to default labels if context is missing
  let lightLabel = "Light Mode";
  let darkLabel = "Dark Mode";
  
  try {
    const t = useTranslations('ThemeToggle');
    lightLabel = t('light');
    darkLabel = t('dark');
  } catch (error) {
    console.error("Translation context not available for ThemeToggle", error);
  }

  return (
    <ToggleGroup 
      type="single" 
      size="sm" 
      value={theme}
      className={cn("border border-input rounded-md bg-background", className)}
      onValueChange={(value) => {
        if (value) setTheme(value);
      }}
    >
      <ToggleGroupItem value="light" aria-label={lightLabel}>
        <Sun className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="dark" aria-label={darkLabel}>
        <Moon className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
