"use client";

import { ArrowLeft, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link as IntlLink, usePathname } from '@/i18n/navigation';

import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

// Function to determine language flag and text
const getLanguageInfo = (localeCode: string) => {
  switch (localeCode) {
    case 'ar':
      return { flag: '🇮🇶', name: 'العربية' };
    case 'en':
      return { flag: '🇬🇧', name: 'English' };
    default:
      return { flag: '🇮🇶', name: 'العربية' };
  }
};

export function AuthNavbar() {
  // Call all hooks unconditionally at the top level
  const locale = useLocale();
  const pathname = usePathname();
  
  // Default fallback values
  const defaultLabels = {
    backToHome: "Back to Home",
    help: "Help",
    privacy: "Privacy",
    disclaimer: "Disclaimer"
  };
  
  // Create a labels object
  let labels = { ...defaultLabels };
  
  // Try to get translated labels
  try {
    const t = useTranslations('AuthNavbar');
    labels = {
      backToHome: t('backToHome'),
      help: t('help'),
      privacy: t('privacy'),
      disclaimer: t('disclaimer')
    };
  } catch (error) {
    console.error("Error in auth navbar translations:", error);
    // Keep using the default labels
  }

  // Get current language information
  const currentLanguage = getLanguageInfo(locale);
  
  return (
    <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container className="flex h-16 items-center justify-between">
        {/* Left side - Back button */}
        <IntlLink href="/" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {labels.backToHome}
        </IntlLink>
        
        {/* Right side - Links and language */}
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-6 items-center">
            <IntlLink 
              href="/help" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {labels.help}
            </IntlLink>
            <IntlLink 
              href="/privacy" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {labels.privacy}
            </IntlLink>
            <IntlLink 
              href="/disclaimer" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {labels.disclaimer}
            </IntlLink>
          </nav>
          
          {/* Language selector - same as main navbar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <span className="text-base">{currentLanguage.flag}</span>
                <span>{currentLanguage.name}</span>
                <ChevronDown className="h-4 w-4 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <IntlLink href={pathname} locale="ar">
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <span className="text-base">🇮🇶</span>
                  <span>العربية</span>
                </DropdownMenuItem>
              </IntlLink>
              <IntlLink href={pathname} locale="en">
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <span className="text-base">🇬🇧</span>
                  <span>English</span>
                </DropdownMenuItem>
              </IntlLink>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Container>
    </header>
  );
}
