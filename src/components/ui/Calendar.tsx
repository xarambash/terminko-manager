import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

export function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col gap-2",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium text-[var(--text-h)]",
        nav: "flex items-center gap-1",
        button_previous: cn(
          "absolute left-1 size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          "inline-flex items-center justify-center rounded-md",
          "hover:bg-[var(--accent)] focus-visible:outline-none",
          "disabled:pointer-events-none disabled:opacity-30",
        ),
        button_next: cn(
          "absolute right-1 size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          "inline-flex items-center justify-center rounded-md",
          "hover:bg-[var(--accent)] focus-visible:outline-none",
          "disabled:pointer-events-none disabled:opacity-30",
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-[var(--text)] w-9 font-normal text-[0.8rem] text-center",
        weeks: "flex flex-col gap-1 mt-2",
        week: "flex",
        day: cn(
          "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
          "[&:has([aria-selected])]:bg-[var(--accent)]",
          "[&:has([aria-selected].day-range-end)]:rounded-r-md",
          "[&:has([aria-selected].day-range-start)]:rounded-l-md",
          "[&:has([aria-selected]):not(:has(.day-range-start)):not(:has(.day-range-end))]:rounded-none",
          "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
        ),
        day_button: cn(
          "h-9 w-9 p-0 font-normal inline-flex items-center justify-center rounded-md text-sm",
          "text-[var(--text-h)] hover:bg-[var(--accent)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
          "aria-selected:opacity-100",
        ),
        selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "bg-[var(--accent)] text-[var(--text-h)]",
        outside: "text-[var(--text)] opacity-50 aria-selected:bg-[var(--accent)]/50 aria-selected:text-[var(--text)] aria-selected:opacity-30",
        disabled: "text-[var(--text)] opacity-30 pointer-events-none",
        range_start: "day-range-start",
        range_end: "day-range-end",
        range_middle: "aria-selected:bg-[var(--accent)] aria-selected:text-[var(--text-h)]",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...rest }) =>
          orientation === "left" ? (
            <ChevronLeftIcon className="size-4" {...rest} />
          ) : (
            <ChevronRightIcon className="size-4" {...rest} />
          ),
      }}
      {...props}
    />
  )
}
