"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
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
import { CalendarIcon, XIcon } from "lucide-react";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { subDays, startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";
import { ChevronDown } from "lucide-react";

export function ChatHistory() {
  const t = useTranslations("History");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<{ start?: Date, end?: Date } | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const dateLocale = locale === "ar" ? ar : enUS;
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      console.log('[DEBUG ChatHistory] handleDateSelect called with:', date);
      setDateRange({ start: date, end: date });
      setActivePreset(null);
    } else {
      setDateRange(null);
    }
    setIsCalendarOpen(false);
  };
  
  const handlePresetSelect = (preset: string) => {
    setActivePreset(preset);
    const now = new Date();
    let start: Date | undefined;
    let end: Date | undefined = endOfDay(now);

    switch (preset) {
      case 'today':
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case 'last7days':
        start = startOfDay(subDays(now, 6));
        break;
      case 'last30days':
        start = startOfDay(subDays(now, 29));
        break;
      case 'all':
      default:
        start = undefined;
        end = undefined;
        break;
    }

    if (start) {
      setDateRange({ start, end });
    } else {
      setDateRange(null);
    }
    setIsCalendarOpen(false);
  };
  
  const handleFilterClear = () => {
    setDateRange(null);
    setActivePreset(null);
  };
  
  const getFilterButtonText = () => {
    if (activePreset) {
      if (activePreset === 'today') return t('presetToday');
      if (activePreset === 'last7days') return t('presetLast7Days');
      if (activePreset === 'last30days') return t('presetLast30Days');
      if (activePreset === 'all') return t('presetAllTime');
    }
    if (dateRange?.start) {
      if (dateRange.end && dateRange.start.toDateString() === dateRange.end.toDateString()) {
        return format(dateRange.start, "PPP", { locale: dateLocale });
      }
      return format(dateRange.start, "PPP", { locale: dateLocale });
    }
    return t("filterByDate");
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
        
        {/* Date filter - Simplified Popover */}
        <div className="flex gap-2 items-center">
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal whitespace-nowrap",
                  !dateRange && !activePreset && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {getFilterButtonText()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2 flex flex-col gap-2" align="end">
              <Button variant="ghost" onClick={() => handlePresetSelect('today')} className="justify-start px-2">{t('presetToday')}</Button>
              <Button variant="ghost" onClick={() => handlePresetSelect('last7days')} className="justify-start px-2">{t('presetLast7Days')}</Button>
              <Button variant="ghost" onClick={() => handlePresetSelect('last30days')} className="justify-start px-2">{t('presetLast30Days')}</Button>
              <Button variant="ghost" onClick={() => handlePresetSelect('all')} className="justify-start px-2">{t('presetAllTime')}</Button>
              <Calendar
                dir={isRtl ? "rtl" : "ltr"}
                mode="single"
                selected={dateRange?.start}
                onSelect={handleDateSelect}
                initialFocus
                className="mt-2 border-t pt-2"
                locale={dateLocale}
              />
            </PopoverContent>
          </Popover>

          {dateRange && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleFilterClear} 
              className="h-10 w-10"
              title={t('clearFilter')}
            >
              <span className="sr-only">{t('clearFilter')}</span>
              <XIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <ConversationsList 
        filterType="all" 
        searchQuery={searchQuery} 
        startDate={dateRange?.start}
        endDate={dateRange?.end}
        locale={locale} 
      />
    </div>
  );
}
