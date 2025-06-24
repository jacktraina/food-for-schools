"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { addMonths, format, getDay, getDaysInMonth, isSameDay, startOfMonth, subMonths } from "date-fns"

interface SimpleDatePickerProps {
  selected?: Date
  onSelect?: (date: Date) => void
  className?: string
}

export function SimpleDatePicker({ selected, onSelect, className }: SimpleDatePickerProps) {
  const [currentMonth, setCurrentMonth] = React.useState(selected || new Date())

  // Move to previous month
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  // Move to next month
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  // Generate days for the current month
  const generateDays = () => {
    const firstDayOfMonth = startOfMonth(currentMonth)
    const daysInMonth = getDaysInMonth(currentMonth)
    const startDay = getDay(firstDayOfMonth) // 0 for Sunday, 1 for Monday, etc.

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      days.push(date)
    }

    return days
  }

  const days = generateDays()

  // Split days into weeks (rows)
  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return (
    <div className={cn("p-3", className)}>
      {/* Month navigation */}
      <div className="flex justify-center items-center mb-4 relative">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1"
          onClick={prevMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm font-medium">{format(currentMonth, "MMMM yyyy")}</div>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1"
          onClick={nextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar grid - no headers, just days */}
      <div className="space-y-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex w-full">
            {week.map((day, dayIndex) => (
              <div key={dayIndex} className="h-9 w-9 text-center text-sm p-0 relative">
                {day && (
                  <Button
                    variant="ghost"
                    className={cn(
                      "h-9 w-9 p-0 font-normal",
                      selected &&
                        isSameDay(day, selected) &&
                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    )}
                    onClick={() => onSelect?.(day)}
                  >
                    {format(day, "d")}
                  </Button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
