"use client";

import Image from "next/image";
import Link from "next/link"; 
import { Menu, CircleFadingPlus, ChevronDown } from "lucide-react";
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Link as IntlLink, usePathname } from '@/i18n/navigation'; 

const Navbar = () => {
  let newChatLabel = "New Chat";
  let resourcesLabel = "Resources";
  let changelogLabel = "Changelog";
  let changelogDescription = "See what's new in our latest updates";
  let featureRequestLabel = "Feature Request";
  let featureRequestDescription = "Request new features or improvements";
  let aboutUsLabel = "About Us";
  let aboutUsDescription = "Learn more about our team and mission";
  let signInLabel = "Sign In";
  let getStartedLabel = "Get Started";
  
  let pathname = "/";
  let locale = "en";
  let currentLanguage = { flag: '🇬🇧', name: 'English' };
  let hasIntlContext = false;
  
  try {
    const t = useTranslations('Navbar');
    locale = useLocale();
    pathname = usePathname();
    hasIntlContext = true;

    newChatLabel = t('newChat');
    resourcesLabel = t('resources');
    changelogLabel = t('changelog');
    changelogDescription = t('changelogDescription');
    featureRequestLabel = t('featureRequest');
    featureRequestDescription = t('featureRequestDescription');
    aboutUsLabel = t('aboutUs');
    aboutUsDescription = t('aboutUsDescription');
    signInLabel = t('signIn');
    getStartedLabel = t('getStarted');

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

    currentLanguage = getLanguageInfo(locale);
  } catch (error) {
    console.error("Error in Navbar translations:", error);
  }

  const NavLink = hasIntlContext ? IntlLink : Link;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center">
          <NavLink href="/" className="flex items-center">
            <Image
              src="/logo-vertical-3.svg"
              alt="GPT IQ Logo"
              width={154}
              height={58}
              priority
            />
          </NavLink>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2 items-center">
            <CircleFadingPlus className="h-4 w-4" aria-hidden="true" />
            {newChatLabel}
          </Button>

          <NavigationMenu className="hidden md:block">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-background border border-input hover:bg-accent hover:text-accent-foreground">
                  {resourcesLabel}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[200px] gap-3 p-4">
                    <li>
                      <NavigationMenuLink asChild>
                        <NavLink
                          href="/changelog"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium">{changelogLabel}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {changelogDescription}
                          </p>
                        </NavLink>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <NavLink
                          href="/feature-request"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium">{featureRequestLabel}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {featureRequestDescription}
                          </p>
                        </NavLink>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <NavLink
                          href="/about"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium">{aboutUsLabel}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {aboutUsDescription}
                          </p>
                        </NavLink>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="hidden md:block h-6 w-px bg-border/60" aria-hidden="true" />

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

          <div className="hidden sm:flex">
            <ThemeToggle />
          </div>

          <div className="hidden sm:block h-6 w-px bg-border/60" aria-hidden="true" />

          <Button variant="ghost" size="sm" className="hidden sm:flex">
            {signInLabel}
          </Button>

          <Button size="sm">
            {getStartedLabel}
          </Button>

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </Container>
    </header>
  );
};

export default Navbar;
