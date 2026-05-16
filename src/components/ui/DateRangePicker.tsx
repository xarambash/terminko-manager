import { useRef, useState } from "react"
import { format, parseISO } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "./Button"
import { Calendar } from "./Calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./Popover"

export interface DateRangeValue {
  from: string
  to?: string
}

interface DateRangePickerProps {
  value: DateRangeValue
  onChange: (value: DateRangeValue) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  disabledRanges?: { from: Date; to: Date }[]
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Select date range",
  className,
  disabled,
  disabledRanges = [],
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState<DateRange | undefined>(undefined)
  // Ref keeps the latest pending value in sync so handleOpenChange never reads stale state
  const pendingRef = useRef<DateRange | undefined>(undefined)

  const committedFrom = value.from ? parseISO(value.from) : undefined
  const committedTo = value.to ? parseISO(value.to) : undefined

  const displayText = value.from
    ? value.to && value.to !== value.from
      ? `${format(parseISO(value.from), "MMM d")} – ${format(parseISO(value.to), "MMM d")}`
      : format(parseISO(value.from), "MMM d, yyyy")
    : placeholder

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const disabledMatchers = [{ before: today }, ...disabledRanges]

  const handleOpenChange = (next: boolean) => {
    if (next) {
      // Restore a committed range so the user sees their selection; start fresh if no full range
      const initial = committedFrom ? { from: committedFrom, to: committedTo ?? committedFrom } : undefined
      pendingRef.current = initial
      setPending(initial)
    } else {
      // Commit whatever is pending when user closes manually (single-day or partial)
      const current = pendingRef.current
      if (current?.from) {
        const isSingleDay = !current.to || current.from.getTime() === current.to.getTime()
        onChange({
          from: format(current.from, "yyyy-MM-dd"),
          to: isSingleDay ? undefined : format(current.to!, "yyyy-MM-dd"),
        })
      }
      pendingRef.current = undefined
    }
    setOpen(next)
  }

  const handleSelect = (range: DateRange | undefined) => {
    const prevPending = pendingRef.current
    const prevIsSingleDay =
      prevPending?.from && prevPending.to &&
      prevPending.from.getTime() === prevPending.to.getTime()

    // react-day-picker v10 deselects (returns undefined) when clicking the same date twice
    if (!range) {
      if (prevIsSingleDay) {
        onChange({ from: format(prevPending!.from!, "yyyy-MM-dd"), to: undefined })
        pendingRef.current = undefined
        setOpen(false)
      } else {
        pendingRef.current = undefined
        setPending(undefined)
      }
      return
    }

    pendingRef.current = range
    setPending(range)

    const sameDay = range.from && range.to && range.from.getTime() === range.to.getTime()

    // Second click on same date: library returns same-day range again → single-day selection
    if (sameDay && prevIsSingleDay && prevPending!.from!.getTime() === range.from!.getTime()) {
      onChange({ from: format(range.from!, "yyyy-MM-dd"), to: undefined })
      pendingRef.current = undefined
      setOpen(false)
      return
    }

    // Real range selected (from !== to) → commit and close
    if (range.from && range.to && range.from.getTime() !== range.to.getTime()) {
      onChange({
        from: format(range.from, "yyyy-MM-dd"),
        to: format(range.to, "yyyy-MM-dd"),
      })
      pendingRef.current = undefined
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "justify-start text-left font-normal",
            !value.from && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {displayText}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Calendar
          mode="range"
          selected={pending}
          onSelect={handleSelect}
          disabled={disabledMatchers}
          numberOfMonths={1}
        />
      </PopoverContent>
    </Popover>
  )
}
