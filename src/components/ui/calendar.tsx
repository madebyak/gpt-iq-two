"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, useNavigation, ButtonProps } from "react-day-picker"
import { useLocale } from "next-intl"
import { ar, enUS } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function CustomPrevButton(props: ButtonProps) {
  const { goToMonth, previousMonth } = useNavigation();

  return (
    <Button
      {...props}
      variant="outline"
      className={cn(
        "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
      )}
      disabled={!previousMonth}
      onClick={() => previousMonth && goToMonth(previousMonth)}
    >
      <ChevronLeft className={cn("h-4 w-4", "rtl:rotate-180")} />
    </Button>
  );
}

function CustomNextButton(props: ButtonProps) {
  const { goToMonth, nextMonth } = useNavigation();

  return (
    <Button
      {...props}
      variant="outline"
       className={cn(
        "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
      )}
      disabled={!nextMonth}
      onClick={() => nextMonth && goToMonth(nextMonth)}
    >
       <ChevronRight className={cn("h-4 w-4", "rtl:rotate-180")} />
    </Button>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const locale = useLocale()
  const dateLocale = locale === "ar" ? ar : enUS
  const isRtl = locale === "ar"

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      dir={isRtl ? "rtl" : "ltr"}
      locale={dateLocale}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-4 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "flex items-center justify-between w-full px-1",
        head_row: "grid grid-cols-7 text-center",
        head_cell:
          "text-muted-foreground rounded-md font-normal text-[0.8rem]",
        row: "grid grid-cols-7 mt-2",
        cell: cn(
          "h-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          buttonVariants({ variant: "ghost" })
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        PreviousMonthButton: CustomPrevButton,
        NextMonthButton: CustomNextButton,
        Weekdays: () => <></>,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
