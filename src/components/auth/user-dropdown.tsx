"use client";

import { LogOut, Settings, History, UserRound } from "lucide-react";
import { useTranslations } from 'next-intl';
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useLocale } from 'next-intl';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Link as IntlLink } from '@/i18n/navigation';
import { useContext } from 'react';

interface UserDropdownProps {
  user: {
    firstName: string;
    lastName: string;
    photoUrl?: string;
  };
  onLogout: () => void;
}

export function UserDropdown({ user, onLogout }: UserDropdownProps) {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  
  // Labels for English and Arabic
  const labels = {
    en: {
      myAccount: "My Account",
      myHistory: "History",
      settings: "Settings",
      logOut: "Sign Out"
    },
    ar: {
      myAccount: "حسابي",
      myHistory: "سجل المحادثات",
      settings: "الإعدادات",
      logOut: "تسجيل الخروج"
    }
  };
  
  // Select the right labels based on locale
  const currentLabels = isArabic ? labels.ar : labels.en;

  // Full name or just first name if lastName is not available
  const displayName = user.firstName + (user.lastName ? ` ${user.lastName}` : '');
  
  // Default profile picture handling
  const profilePicture = user.photoUrl || '/profile-default.jpg';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 h-11 px-4 py-2"
        >
          <Image 
            src={profilePicture}
            alt={displayName} 
            width={24} 
            height={24}
            className="rounded-full h-6 w-6 object-cover"
          />
          <span className="max-w-[120px] truncate">{displayName}</span>
          <ChevronDown className="h-4 w-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 max-h-[calc(100vh-100px)] overflow-y-auto"
      >
        <IntlLink href="/account">
          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
            <UserRound className="h-4 w-4" />
            <span>{currentLabels.myAccount}</span>
          </DropdownMenuItem>
        </IntlLink>
        
        <IntlLink href="/history">
          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
            <History className="h-4 w-4" />
            <span>{currentLabels.myHistory}</span>
          </DropdownMenuItem>
        </IntlLink>
        
        <IntlLink href="/settings">
          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-4 w-4" />
            <span>{currentLabels.settings}</span>
          </DropdownMenuItem>
        </IntlLink>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>{currentLabels.logOut}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
