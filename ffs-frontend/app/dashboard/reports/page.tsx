"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  Calendar,
  Download,
  FileSpreadsheet,
  FilePieChart,
  FileText,
  Filter,
  Printer,
  RefreshCw,
  Users,
  Building,
  TrendingUp,
  DollarSign,
  ClipboardList,
  Award,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { ReportCard } from "@/components/dashboard/report-card"

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState("pdf")
  const [organizationType, setOrganizationType] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("userData")
    if (userData) {
      try {
        const parsedData = JSON.parse(userData)
        setOrganizationType(parsedData.organizationType || "Single-District")
        setUserEmail(parsedData.email || null)
      } catch (error) {
        console.error("Error parsing user data:", error)
        setOrganizationType("Single-District") // Default to Single-District if there's an error
      }
    } else {
      // Default to Single-District if no user data is found
      setOrganizationType("Single-District")
    }
  }, [])

  const handleGenerateReport = (reportType: string, format = "pdf") => {
    setIsGenerating(true)

    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false)

      // Different messages based on format
      let message = ""
      switch (format) {
        case "excel":
          message = `Generated ${reportType} report in Excel format`
          break
        case "sheets":
          message = `Exported ${reportType} report to Google Sheets`
          break
        case "csv":
          message = `Generated ${reportType} report in CSV format`
          break
        default:
          message = `Generated ${reportType} report in PDF format`
      }

      alert(message)
    }, 1500)
  }

  // Springfield District schools for Single-District users
  const springfieldSchools = [
    { id: "elementary", name: "Springfield Elementary" },
    { id: "middle", name: "Springfield Middle School" },
    { id: "high", name: "Springfield High School" },
    { id: "tech", name: "Springfield Technical School" },
  ]

  // Districts for Coop users
  const districts = [
    { id: "springfield", name: "Springfield District" },
    { id: "shelbyville", name: "Shelbyville District" },
    { id: "capital", name: "Capital City District" },
  ]

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-1">Generate and download reports for your procurement activities</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Printer className="h-3.5 w-3.5" />
            <span>Print</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Report Filters</CardTitle>
            <CardDescription>Customize your report parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date-range">Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="start-date" className="text-xs">
                    Start Date
                  </Label>
                  <DatePicker date={startDate} setDate={setStartDate} className="w-full" />
                </div>
                <div>
                  <Label htmlFor="end-date" className="text-xs">
                    End Date
                  </Label>
                  <DatePicker date={endDate} setDate={setEndDate} className="w-full" />
                </div>
              </div>
            </div>

            {/* Conditional rendering based on organization type */}
            <div className="space-y-2">
              {organizationType === "Coop" ? (
                <>
                  <Label htmlFor="district">District</Label>
                  <Select defaultValue="all">
                    <SelectTrigger id="district">
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Districts</SelectItem>
                      {districts.map((district) => (
                        <SelectItem key={district.id} value={district.id}>
                          {district.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              ) : (
                <>
                  <Label htmlFor="school">School</Label>
                  <Select defaultValue="all">
                    <SelectTrigger id="school">
                      <SelectValue placeholder="Select school" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Schools</SelectItem>
                      {springfieldSchools.map((school) => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bid-type">Bid Type</Label>
              <Select defaultValue="all">
                <SelectTrigger id="bid-type">
                  <SelectValue placeholder="Select bid type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bid Types</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="supplies">Supplies</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Bid Status</Label>
              <Select defaultValue="all">
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="awarded">Awarded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="export-format">Export Format</Label>
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger id="export-format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2">
              <Button className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="bids">Bids</TabsTrigger>
              <TabsTrigger value="vendors">Vendors</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bid Reports */}
              {(activeTab === "all" || activeTab === "bids") && (
                <>
                  <ReportCard
                    title="Bid Summary Report"
                    description="Overview of all bids with status, timeline, and participation metrics"
                    icon={ClipboardList}
                    onGenerate={(format) => handleGenerateReport("Bid Summary", format)}
                    isGenerating={isGenerating}
                    format={selectedFormat}
                  />

                  <ReportCard
                    title="Bid Item Analysis"
                    description="Detailed breakdown of items by category, pricing, and award status"
                    icon={BarChart3}
                    onGenerate={(format) => handleGenerateReport("Bid Item Analysis", format)}
                    isGenerating={isGenerating}
                    format={selectedFormat}
                  />

                  <ReportCard
                    title="Bid Timeline Report"
                    description="Timeline visualization of bid creation, publication, and award dates"
                    icon={Calendar}
                    onGenerate={(format) => handleGenerateReport("Bid Timeline", format)}
                    isGenerating={isGenerating}
                    format={selectedFormat}
                  />

                  <ReportCard
                    title="Bid Award Summary"
                    description="Summary of awarded bids, vendors, and total contract values"
                    icon={Award}
                    onGenerate={(format) => handleGenerateReport("Bid Award Summary", format)}
                    isGenerating={isGenerating}
                    format={selectedFormat}
                  />
                </>
              )}

              {/* Vendor Reports */}
              {(activeTab === "all" || activeTab === "vendors") && (
                <>
                  <ReportCard
                    title="Vendor Performance"
                    description="Analysis of vendor performance, response rates, and award success"
                    icon={TrendingUp}
                    onGenerate={(format) => handleGenerateReport("Vendor Performance", format)}
                    isGenerating={isGenerating}
                    format={selectedFormat}
                  />

                  <ReportCard
                    title="Vendor Participation"
                    description="Overview of vendor participation across different bid types"
                    icon={Users}
                    onGenerate={(format) => handleGenerateReport("Vendor Participation", format)}
                    isGenerating={isGenerating}
                    format={selectedFormat}
                  />
                </>
              )}

              {/* Financial Reports */}
              {(activeTab === "all" || activeTab === "financial") && (
                <>
                  <ReportCard
                    title="Budget Analysis"
                    description="Financial analysis of procurement spending against budgets"
                    icon={DollarSign}
                    onGenerate={(format) => handleGenerateReport("Budget Analysis", format)}
                    isGenerating={isGenerating}
                    format={selectedFormat}
                  />

                  <ReportCard
                    title="Cost Savings Report"
                    description="Analysis of cost savings achieved through competitive bidding"
                    icon={FilePieChart}
                    onGenerate={(format) => handleGenerateReport("Cost Savings", format)}
                    isGenerating={isGenerating}
                    format={selectedFormat}
                  />
                </>
              )}

              {/* Compliance Reports */}
              {(activeTab === "all" || activeTab === "compliance") && (
                <>
                  <ReportCard
                    title="Compliance Audit"
                    description="Audit report for procurement compliance with regulations"
                    icon={FileText}
                    onGenerate={(format) => handleGenerateReport("Compliance Audit", format)}
                    isGenerating={isGenerating}
                    format={selectedFormat}
                  />

                  <ReportCard
                    title={organizationType === "Coop" ? "District Participation" : "School Participation"}
                    description={
                      organizationType === "Coop"
                        ? "Report on district participation in cooperative procurement activities"
                        : "Report on school participation in district procurement activities"
                    }
                    icon={Building}
                    onGenerate={(format) =>
                      handleGenerateReport(
                        organizationType === "Coop" ? "District Participation" : "School Participation",
                        format,
                      )
                    }
                    isGenerating={isGenerating}
                    format={selectedFormat}
                  />
                </>
              )}
            </div>
          </Tabs>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>Your recently generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FilePieChart className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Bid Summary Report</p>
                      <p className="text-sm text-muted-foreground">Generated on April 12, 2025</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Vendor Performance Analysis</p>
                      <p className="text-sm text-muted-foreground">Generated on April 10, 2025</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">
                        {organizationType === "Coop" ? "Budget Analysis Report" : "School Participation Report"}
                      </p>
                      <p className="text-sm text-muted-foreground">Generated on April 5, 2025</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Reports
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
