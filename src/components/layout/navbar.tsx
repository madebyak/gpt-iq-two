import Image from "next/image";
import Link from "next/link";
import { Menu, CircleFadingPlus, ChevronDown } from "lucide-react";

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
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container className="flex h-16 items-center justify-between">
        {/* Logo - Left Side */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-vertical-3.svg"
              alt="GPT IQ Logo"
              width={154}
              height={58}
              priority
            />
          </Link>
        </div>

        {/* Navigation Items - Right Side */}
        <div className="flex items-center gap-4">
          {/* New Chat Button */}
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2 items-center">
            <CircleFadingPlus className="h-4 w-4" aria-hidden="true" />
            New Chat
          </Button>

          {/* Navigation Menu - Resources */}
          <NavigationMenu className="hidden md:block">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-background border border-input hover:bg-accent hover:text-accent-foreground">Resources</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[200px] gap-3 p-4">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/changelog"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium">Changelog</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            See what's new in our latest updates
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/feature-request"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium">Feature Request</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Request new features or improvements
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/about"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium">About Us</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Learn more about our team and mission
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Vertical Line Separator */}
          <div className="hidden md:block h-6 w-px bg-border/60" aria-hidden="true" />

          {/* Language Selector Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <span className="text-base">🇬🇧</span>
                <span>English</span>
                <ChevronDown className="h-4 w-4 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="flex items-center gap-2">
                <span className="text-base">🇬🇧</span>
                <span>English</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <span className="text-base">🇮🇶</span>
                <span>العربية</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle Group */}
          <div className="hidden sm:flex">
            <ThemeToggle />
          </div>

          {/* Vertical Line Separator */}
          <div className="hidden sm:block h-6 w-px bg-border/60" aria-hidden="true" />

          {/* Sign In Button */}
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            Sign In
          </Button>

          {/* Get Started Button */}
          <Button size="sm">Get Started</Button>

          {/* Mobile Menu Button - Only visible on small screens */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </Container>
    </header>
  );
};

export default Navbar;
