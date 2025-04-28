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
import { useAuth } from "@/lib/auth/auth-context";
import { UserDropdown } from "@/components/auth/user-dropdown";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const getLanguageInfo = (localeCode: string) => {
  switch (localeCode) {
    case 'ar':
      return { flagPath: '/iraq-svg.svg', name: 'العربية' };
    case 'en':
      return { flagPath: '/uk-svg.svg', name: 'English' };
    default:
      return { flagPath: '/iraq-svg.svg', name: 'العربية' };
  }
};

const Navbar = () => {
  // Call all hooks unconditionally at the top level
  const locale = useLocale();
  const pathname = usePathname();
  const { user, profile, signOut, isLoading } = useAuth();
  
  // --- Add Logging ---
  console.log('[Navbar] Rendering with pathname:', pathname, 'and locale:', locale);
  // --- End Logging ---
  
  // Default fallback values
  const defaultLabels = {
    openMainMenu: "Open main menu",
    newChat: "New Chat",
    resources: "Resources",
    changelog: "Changelog",
    changelogDescription: "See what's new in our latest updates",
    featureRequest: "Feature Request",
    featureRequestDescription: "Request new features or improvements",
    aboutUs: "About Us",
    aboutUsDescription: "Learn more about our team and mission",
    signIn: "Sign In",
    getStarted: "Get Started"
  };
  
  // Declare labels with defaults first
  let labels = { ...defaultLabels };

  // Call hook unconditionally
  const t = useTranslations('Navbar');

  // Try to assign translated labels, potentially overwriting defaults
  try {
    labels = {
      openMainMenu: t('openMainMenu') || defaultLabels.openMainMenu,
      newChat: t('newChat') || defaultLabels.newChat,
      resources: t('resources') || defaultLabels.resources,
      changelog: t('changelog') || defaultLabels.changelog,
      changelogDescription: t('changelogDescription') || defaultLabels.changelogDescription,
      featureRequest: t('featureRequest') || defaultLabels.featureRequest,
      featureRequestDescription: t('featureRequestDescription') || defaultLabels.featureRequestDescription,
      aboutUs: t('aboutUs') || defaultLabels.aboutUs,
      aboutUsDescription: t('aboutUsDescription') || defaultLabels.aboutUsDescription,
      signIn: t('signIn') || defaultLabels.signIn,
      getStarted: t('getStarted') || defaultLabels.getStarted
    };
  } catch (error) {
    console.error("Error assigning navbar translations (hook call was successful):", error);
    // Explicitly reset to defaults just in case assignment failed partially
    labels = { ...defaultLabels }; 
  }

  const currentLanguage = getLanguageInfo(locale);
  
  // User is logged in when we have a user and their profile
  const isLoggedIn = !!user && !!profile;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center">
          <IntlLink href="/" className="flex items-center">
            <Image
              src="/jahiz-logo.svg"
              alt="Jahiz Logo"
              width={100}
              height={28}
              priority
            />
          </IntlLink>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Button 
            variant="outline" 
            size="default" 
            className="gap-2 items-center h-11 px-4 py-2"
          >
            <CircleFadingPlus className="h-4 w-4" aria-hidden="true" />
            {labels.newChat}
          </Button>

          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-background border border-input hover:bg-accent hover:text-accent-foreground">
                  {labels.resources}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[200px] gap-3 p-4">
                    <li>
                      <NavigationMenuLink asChild>
                        <IntlLink
                          href="/changelog"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium">{labels.changelog}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {labels.changelogDescription}
                          </p>
                        </IntlLink>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <IntlLink
                          href="/feature-request"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium">{labels.featureRequest}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {labels.featureRequestDescription}
                          </p>
                        </IntlLink>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <IntlLink
                          href="/about"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium">{labels.aboutUs}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {labels.aboutUsDescription}
                          </p>
                        </IntlLink>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="h-6 w-px bg-border/60" aria-hidden="true" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 h-11 px-4 py-2"
              >
                <Image 
                  src={currentLanguage.flagPath}
                  alt={`${currentLanguage.name} flag`}
                  width={20}
                  height={15}
                  className="h-auto"
                />
                <span>{currentLanguage.name}</span>
                <ChevronDown className="h-4 w-4 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <IntlLink href={pathname} locale="ar">
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <Image 
                    src="/iraq-svg.svg"
                    alt="Arabic flag"
                    width={20} 
                    height={15}
                    className="h-auto"
                  />
                  <span>العربية</span>
                </DropdownMenuItem>
              </IntlLink>
              <IntlLink href={pathname} locale="en">
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <Image 
                    src="/uk-svg.svg"
                    alt="English flag"
                    width={20} 
                    height={15}
                    className="h-auto"
                  />
                  <span>English</span>
                </DropdownMenuItem>
              </IntlLink>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden sm:flex">
            <ThemeToggle />
          </div>

          {!isLoading && (
            <>
              <div className="hidden sm:block h-6 w-px bg-border/60" aria-hidden="true" />

              {isLoggedIn ? (
                <UserDropdown 
                  user={{
                    firstName: profile?.firstName || user.email?.split('@')[0] || 'User',
                    lastName: profile?.lastName || '',
                    photoUrl: profile?.photoUrl || undefined
                  }}
                  onLogout={signOut}
                />
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    className="hidden sm:flex h-11 px-4 py-2"
                    asChild
                  >
                    <IntlLink href="/auth/login">
                      {labels.signIn}
                    </IntlLink>
                  </Button>

                  <Button 
                    className="h-11 px-4 py-2"
                    asChild
                  >
                    <IntlLink href="/auth/signup">
                      {labels.getStarted}
                    </IntlLink>
                  </Button>
                </>
              )}
            </>
          )}
          {isLoading && (
            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-11 px-4 py-2 cursor-wait animate-pulse"
              disabled
            >
              <div className="h-5 w-5 rounded-full bg-muted/80 animate-pulse"></div>
              <div className="h-4 w-16 bg-muted/80 rounded animate-pulse"></div>
            </Button>
          )}

          <Button variant="ghost" size="icon" className="md:hidden h-11 w-11">
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <div className="md:hidden flex items-center gap-2"> 
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-11 w-11" 
                  aria-label={labels.openMainMenu}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent 
                side={locale === 'ar' ? 'left' : 'right'} 
                className="w-[300px] sm:w-[400px] h-full overflow-y-auto"
              >
                <nav className="flex flex-col gap-4 mt-6">
                  <Button 
                    variant="outline" 
                    size="default" 
                    className="w-full flex gap-2 items-center h-11 px-4 py-2"
                    asChild
                  >
                    <IntlLink href="/chat"> 
                      <CircleFadingPlus className="h-4 w-4" aria-hidden="true" />
                      {labels.newChat}
                    </IntlLink>
                  </Button>
                  
                  <Separator />

                  {/* <h4 className="font-medium text-sm">{labels.resources}</h4> */}
                  <SheetClose asChild>
                    <IntlLink href="/resources" className="block p-2 rounded hover:bg-accent">{labels.resources}</IntlLink>
                  </SheetClose>
                  <SheetClose asChild>
                    <IntlLink href="/changelog" className="block p-2 rounded hover:bg-accent">{labels.changelog}</IntlLink>
                  </SheetClose>
                  <SheetClose asChild>
                    <IntlLink href="/feature-request" className="block p-2 rounded hover:bg-accent">{labels.featureRequest}</IntlLink>
                  </SheetClose>
                  <SheetClose asChild>
                    <IntlLink href="/about" className="block p-2 rounded hover:bg-accent">{labels.aboutUs}</IntlLink>
                  </SheetClose>

                  <Separator />

                  <h4 className="font-medium text-sm">Language</h4>
                   <SheetClose asChild>
                      <IntlLink href={pathname} locale="ar">
                        <Button variant="ghost" className="w-full justify-start flex items-center gap-2 cursor-pointer">
                           <Image src="/iraq-svg.svg" alt="Arabic flag" width={20} height={15} className="h-auto"/>
                           <span>العربية</span>
                        </Button>
                      </IntlLink>
                   </SheetClose>
                   <SheetClose asChild>
                      <IntlLink href={pathname} locale="en">
                         <Button variant="ghost" className="w-full justify-start flex items-center gap-2 cursor-pointer">
                           <Image src="/uk-svg.svg" alt="English flag" width={20} height={15} className="h-auto"/>
                           <span>English</span>
                         </Button>
                      </IntlLink>
                   </SheetClose>

                  <Separator />

                  {/* Theme Toggle */}
                  <div className="flex items-center justify-between">
                     <h4 className="font-medium text-sm">Theme</h4>
                     <ThemeToggle />
                  </div>

                  <Separator />

                  {!isLoading && (
                    <>
                      {isLoggedIn ? (
                         <>
                           <h4 className="font-medium text-sm">Account</h4>
                           <UserDropdown 
                             user={{
                               firstName: profile?.firstName || user.email?.split('@')[0] || 'User',
                               lastName: profile?.lastName || '',
                               photoUrl: profile?.photoUrl || undefined
                             }}
                             onLogout={() => {
                               signOut();
                             }}
                           />
                         </>
                      ) : (
                        <div className="flex flex-col gap-2">
                           <SheetClose asChild>
                             <Button 
                               variant="outline" 
                               className="w-full h-11 px-4 py-2"
                               asChild
                             >
                               <IntlLink href="/auth/login">
                                 {labels.signIn}
                               </IntlLink>
                             </Button>
                           </SheetClose>
                           <SheetClose asChild>
                             <Button 
                               className="w-full h-11 px-4 py-2"
                               asChild
                             >
                               <IntlLink href="/auth/signup">
                                 {labels.getStarted}
                               </IntlLink>
                             </Button>
                           </SheetClose>
                        </div>
                      )}
                    </>
                  )}
                   {isLoading && (
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2 h-11 px-4 py-2 cursor-wait animate-pulse w-full"
                        disabled
                      >
                        <div className="h-5 w-5 rounded-full bg-muted/80 animate-pulse"></div>
                        <div className="h-4 w-16 bg-muted/80 rounded animate-pulse"></div>
                      </Button>
                  )}

                </nav>
              </SheetContent>
            </Sheet>
          </div> 

      </Container>
    </header>
  );
};

export default Navbar;
