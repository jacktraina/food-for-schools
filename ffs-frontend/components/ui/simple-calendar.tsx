"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { addMonths, format, getDay, getDaysInMonth, isSameDay, startOfMonth, subMonths } from "date-fns"

interface SimpleCalendarProps {
  selected?: Date
  onSelect?: (date: Date) => void
  className?: string
}

export function SimpleCalendar({ selected, onSelect, className = "" }: SimpleCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())

  // Generate days for the current month
  const generateDays = () => {
    const firstDayOfMonth = startOfMonth(currentMonth)
    const daysInMonth = getDaysInMonth(currentMonth)
    const startingDayOfWeek = getDay(firstDayOfMonth)

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i)
      days.push(date)
    }

    return days
  }

  const days = generateDays()

  // Split days into weeks
  const weeks = []
  let week = []

  for (let i = 0; i < days.length; i++) {
    week.push(days[i])

    if (week.length === 7 || i === days.length - 1) {
      // Pad the last week if needed
      while (week.length < 7) {
        week.push(null)
      }

      weeks.push(week)
      week = []
    }
  }

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleSelectDate = (date: Date) => {
    if (onSelect) {
      onSelect(date)
    }
  }

  const isSelected = (date: Date) => {
    return selected && isSameDay(date, selected)
  }

  const isToday = (date: Date) => {
    return isSameDay(date, new Date())
  }

  return (
    <div className={`p-4 bg-white rounded-md shadow-sm border ${className}`} style={{ width: "300px" }}>
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="sm" onClick={handlePreviousMonth} className="h-8 w-8 p-0">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-medium">{format(currentMonth, "MMMM yyyy")}</div>
        <Button variant="outline" size="sm" onClick={handleNextMonth} className="h-8 w-8 p-0">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <th key={day} className="text-xs font-medium text-gray-500 p-1 text-center">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, weekIndex) => (
            <tr key={weekIndex}>
              {week.map((day, dayIndex) => (
                <td key={dayIndex} className="p-1 text-center">
                  {day ? (
                    <button
                      type="button"
                      onClick={() => handleSelectDate(day)}
                      className={`
                        h-8 w-8 rounded-full flex items-center justify-center text-sm
                        ${isSelected(day) ? "bg-primary text-white" : ""}
                        ${!isSelected(day) && isToday(day) ? "bg-gray-100" : ""}
                        ${!isSelected(day) && !isToday(day) ? "hover:bg-gray-100" : ""}
                      `}
                    >
                      {format(day, "d")}
                    </button>
                  ) : (
                    <div className="h-8 w-8"></div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
