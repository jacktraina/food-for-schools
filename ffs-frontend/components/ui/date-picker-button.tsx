"use client"

import type * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DatePickerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  date: Date | null
  placeholder?: string
}

export function DatePickerButton({ date, placeholder = "Select date", className, ...props }: DatePickerButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground", className)}
      {...props}
    >
      <CalendarIcon className="mr-2 h-4 w-4" />
      {date ? format(date, "PPP") : placeholder}
    </Button>
  )
}
