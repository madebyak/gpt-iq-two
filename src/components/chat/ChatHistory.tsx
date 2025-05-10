"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { ConversationsList } from "@/components/history/conversations-list";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";

export function ChatHistory() {
  const t = useTranslations("History");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const dateLocale = locale === "ar" ? ar : enUS;
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setIsCalendarOpen(false);
  };
  
  const handleFilterClear = () => {
    setSelectedDate(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search input */}
        <div className={cn(
          "relative flex-grow",
          isRtl ? "text-right" : "text-left"
        )}>
          <Search className={cn(
            "absolute top-3 text-muted-foreground",
            isRtl ? "left-3" : "left-3"
          )} size={18} />
          <Input 
            placeholder={t("searchPlaceholder")} 
            value={searchQuery}
            onChange={handleSearchChange}
            className={cn(
              "pl-10 bg-background",
              isRtl && "text-right"
            )}
          />
        </div>
        
        {/* Date filter */}
        <div className="flex gap-2">
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground",
                  isRtl && "flex-row-reverse"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "PPP", { locale: dateLocale })
                ) : (
                  t("filterByDate")
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          {selectedDate && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleFilterClear} 
              className="h-10 w-10"
            >
              <span className="sr-only">{t("clearFilter")}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">{t("tabs.all")}</TabsTrigger>
          <TabsTrigger value="pinned">{t("tabs.pinned")}</TabsTrigger>
          <TabsTrigger value="archived">{t("tabs.archived")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <ConversationsList 
            filterType="all" 
            searchQuery={searchQuery} 
            selectedDate={selectedDate}
            locale={locale} 
          />
        </TabsContent>
        
        <TabsContent value="pinned" className="mt-6">
          <ConversationsList 
            filterType="pinned" 
            searchQuery={searchQuery} 
            selectedDate={selectedDate}
            locale={locale} 
          />
        </TabsContent>
        
        <TabsContent value="archived" className="mt-6">
          <ConversationsList 
            filterType="archived" 
            searchQuery={searchQuery} 
            selectedDate={selectedDate}
            locale={locale} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
