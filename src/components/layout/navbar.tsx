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
import { useConversationNavigation } from "@/lib/hooks/useConversationNavigation";

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
  const t = useTranslations('Navbar');
  
  const { handleNewChat } = useConversationNavigation();
  
  // --- Add Logging ---
  console.log('[Navbar] Rendering with pathname:', pathname, 'and locale:', locale);
  // --- End Logging ---
  
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
            onClick={handleNewChat}
          >
            <CircleFadingPlus className="h-4 w-4" aria-hidden="true" />
            {t('newChat')}
          </Button>

          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-background border border-input hover:bg-accent hover:text-accent-foreground">
                  {t('resources').slice(0, -1)}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[200px] gap-3 p-4">
                    <li>
                      <NavigationMenuLink asChild>
                        <IntlLink
                          href="/sponsorship"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium">{t('sponsorship')}</div>
                          {/* Optional: Add description if needed */}
                          {/* <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">Description</p> */}
                        </IntlLink>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <IntlLink
                          href="/changelog"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium">{t('changelog')}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {t('changelogDescription')}
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
                          <div className="text-sm font-medium">{t('featureRequest')}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {t('featureRequestDescription')}
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
                          <div className="text-sm font-medium">{t('aboutUs')}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {t('aboutUsDescription')}
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
                      {t('signIn')}
                    </IntlLink>
                  </Button>

                  <Button 
                    className="h-11 px-4 py-2"
                    asChild
                  >
                    <IntlLink href="/auth/signup">
                      {t('getStarted')}
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
        </div>

        <div className="md:hidden flex items-center gap-2"> 
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-11 w-11 bg-transparent hover:bg-transparent focus:bg-transparent"
                  aria-label={t('openMainMenu')}
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
                      {t('newChat')}
                    </IntlLink>
                  </Button>
                  
                  <Separator />

                  <div className="block p-2 rounded text-foreground font-medium">
                    {t('resources')}
                  </div>
                  <SheetClose asChild>
                    <IntlLink href="/sponsorship" className="block p-2 rounded hover:bg-accent">{t('sponsorship')}</IntlLink>
                  </SheetClose>
                  <SheetClose asChild>
                    <IntlLink href="/changelog" className="block p-2 rounded hover:bg-accent">{t('changelog')}</IntlLink>
                  </SheetClose>
                  <SheetClose asChild>
                    <IntlLink href="/feature-request" className="block p-2 rounded hover:bg-accent">{t('featureRequest')}</IntlLink>
                  </SheetClose>
                  <SheetClose asChild>
                    <IntlLink href="/about" className="block p-2 rounded hover:bg-accent">{t('aboutUs')}</IntlLink>
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
                                 {t('signIn')}
                               </IntlLink>
                             </Button>
                           </SheetClose>
                           <SheetClose asChild>
                             <Button 
                               className="w-full h-11 px-4 py-2"
                               asChild
                             >
                               <IntlLink href="/auth/signup">
                                 {t('getStarted')}
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
