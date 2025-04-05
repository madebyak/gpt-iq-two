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

export function AuthNavbar() {
  // Default fallback values in case translations fail
  let backToHomeLabel = "Back to Home";
  let helpLabel = "Help";
  let privacyLabel = "Privacy";
  let disclaimerLabel = "Disclaimer";
  let currentLanguage = { flag: '🇬🇧', name: 'English' };
  
  // Get current pathname without locale prefix - fallback to "/" if it fails
  let pathname = "/";
  let locale = "en";
  let hasIntlContext = false;
  
  try {
    // Get translations for the AuthNavbar namespace
    const t = useTranslations('AuthNavbar');
    // Get current locale
    locale = useLocale();
    // Get current pathname without locale prefix
    pathname = usePathname();
    hasIntlContext = true;

    // Update labels with translations if available
    backToHomeLabel = t('backToHome');
    helpLabel = t('help');
    privacyLabel = t('privacy');
    disclaimerLabel = t('disclaimer');
    
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

    // Get current language information
    currentLanguage = getLanguageInfo(locale);
  } catch (error) {
    console.error("Error in AuthNavbar translations:", error);
    // We continue with the default fallback values
  }

  // Choose which Link component to use based on context availability
  const NavLink = hasIntlContext ? IntlLink : Link;
  
  return (
    <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container className="flex h-16 items-center justify-between">
        {/* Left side - Back button */}
        <NavLink href="/" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {backToHomeLabel}
        </NavLink>
        
        {/* Right side - Links and language */}
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-6 items-center">
            <NavLink 
              href="/help" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {helpLabel}
            </NavLink>
            <NavLink 
              href="/privacy" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {privacyLabel}
            </NavLink>
            <NavLink 
              href="/disclaimer" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {disclaimerLabel}
            </NavLink>
          </nav>
          
          {/* Language selector - same as main navbar */}
          {hasIntlContext ? (
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
          ) : (
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <span className="text-base">{currentLanguage.flag}</span>
              <span>{currentLanguage.name}</span>
            </Button>
          )}
        </div>
      </Container>
    </header>
  );
}
