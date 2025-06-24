"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SimpleCalendar } from "@/components/ui/simple-calendar"

interface DatePickerProps {
  date?: Date | null
  onDateChange?: (date: Date | null) => void
  placeholder?: string
  className?: string
}

export function DatePicker({
  date = null,
  onDateChange = () => {},
  placeholder = "Select date",
  className = "",
}: DatePickerProps) {
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(date)
  const calendarRef = React.useRef<HTMLDivElement>(null)
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  // Update internal state when external date changes
  React.useEffect(() => {
    setSelectedDate(date)
  }, [date])

  // Close calendar when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        buttonRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false)
      }
    }

    if (isCalendarOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isCalendarOpen])

  const handleDateSelect = (newDate: Date) => {
    setSelectedDate(newDate)

    // Safely call onDateChange if it's a function
    if (typeof onDateChange === "function") {
      onDateChange(newDate)
    }

    setIsCalendarOpen(false)
  }

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        type="button"
        variant="outline"
        className={`w-full justify-start text-left font-normal ${className}`}
        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {selectedDate ? format(selectedDate, "PPP") : <span className="text-muted-foreground">{placeholder}</span>}
      </Button>

      {isCalendarOpen && (
        <div ref={calendarRef} className="absolute z-50 mt-1">
          <SimpleCalendar selected={selectedDate || undefined} onSelect={handleDateSelect} />
        </div>
      )}
    </div>
  )
}
