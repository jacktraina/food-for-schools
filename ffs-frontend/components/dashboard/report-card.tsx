"use client"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileSpreadsheet, FileText } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useState } from "react"

interface ReportCardProps {
  title: string
  description: string
  icon: LucideIcon
  onGenerate: (format: string) => void
  isGenerating: boolean
  format?: string
}

export function ReportCard({ title, description, icon: Icon, onGenerate, isGenerating, format }: ReportCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      className={`transition-all duration-200 ${isHovered ? "border-blue-300 shadow-md" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Icon className={`h-5 w-5 ${isHovered ? "text-blue-500" : "text-gray-400"} transition-colors duration-200`} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter className="pt-4">
        <div className="flex flex-wrap gap-2 w-full">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onGenerate("excel")}
            disabled={isGenerating}
            className="flex-1 min-w-[80px]"
          >
            <FileSpreadsheet className="h-3 w-3 mr-1" />
            Excel
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onGenerate("sheets")}
            disabled={isGenerating}
            className="flex-1 min-w-[80px]"
          >
            <FileSpreadsheet className="h-3 w-3 mr-1" />
            Sheets
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onGenerate("pdf")}
            disabled={isGenerating}
            className="flex-1 min-w-[80px]"
          >
            <FileText className="h-3 w-3 mr-1" />
            PDF
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onGenerate("csv")}
            disabled={isGenerating}
            className="flex-1 min-w-[80px]"
          >
            <FileSpreadsheet className="h-3 w-3 mr-1" />
            CSV
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
