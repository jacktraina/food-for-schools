"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Download, Upload, X, AlertCircle, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface BulkUploadDistrictsModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (districts: any[]) => void
}

interface CSVDistrict {
  name: string
  location: string
  schools: number
  students: number
  status: string
  directorName?: string
  address?: string
  phone?: string
  email?: string
  fax?: string
  website?: string
  enrollment?: number
  raNumber?: string
  contact2?: string
  contact2Phone?: string
  contact2Email?: string
  billingContact?: string
  billingAddress?: string
  billingPhone?: string
  billingEmail?: string
  superintendent?: string
  established?: string
  budget?: string
  participatingIn?: string // Comma-separated list of products
}

export function BulkUploadDistrictsModal({ isOpen, onClose, onUpload }: BulkUploadDistrictsModalProps) {
  const [activeTab, setActiveTab] = useState("upload")
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [parsedDistricts, setParsedDistricts] = useState<CSVDistrict[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // CSV template headers
  const csvTemplate =
    "Name,Location,Schools,Students,Status,DirectorName,Address,Phone,Email,Fax,Website,Enrollment,RANumber,Contact2,Contact2Phone,Contact2Email,BillingContact,BillingAddress,BillingPhone,BillingEmail,Superintendent,Established,Budget,ParticipatingIn\n"

  // Example data for the template
  const exampleData = [
    "Springfield School District,Springfield IL,12,8750,Active,John Smith,123 Main St,(555) 123-4567,info@springfield.edu,(555) 123-4568,www.springfield.edu,8750,RA12345,Jane Doe,(555) 123-4569,jane@springfield.edu,Finance Dept,123 Main St,(555) 123-4570,billing@springfield.edu,Dr. Robert Johnson,1950,$12000000,Food Program;Technology Initiative",
    "Westview School District,Westview IL,8,5200,Active,Sarah Williams,456 Oak Ave,(555) 234-5678,info@westview.edu,(555) 234-5679,www.westview.edu,5200,RA23456,Michael Brown,(555) 234-5680,michael@westview.edu,Accounting,456 Oak Ave,(555) 234-5681,accounting@westview.edu,Dr. Lisa Anderson,1965,$8500000,Food Program",
    "Eastside School District,Eastside IL,6,3800,Inactive,David Miller,789 Pine St,(555) 345-6789,info@eastside.edu,(555) 345-6790,www.eastside.edu,3800,RA34567,Jennifer Wilson,(555) 345-6791,jennifer@eastside.edu,Finance Office,789 Pine St,(555) 345-6792,finance@eastside.edu,Dr. Thomas Clark,1970,$6200000,Technology Initiative;Nutrition Program",
  ].join("\n")

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate + exampleData], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "district_upload_template.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === "text/csv" || droppedFile.name.endsWith(".csv")) {
        processFile(droppedFile)
      } else {
        setErrors(["Please upload a CSV file"])
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0])
    }
  }

  const processFile = (file: File) => {
    setFile(file)
    setErrors([])
    setIsProcessing(true)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const result = parseCSV(text)
        setParsedDistricts(result.districts)
        setErrors(result.errors)

        if (result.districts.length > 0 && result.errors.length === 0) {
          setActiveTab("review")
        }
      } catch (error) {
        setErrors(["Failed to parse CSV file. Please check the format."])
      } finally {
        setIsProcessing(false)
      }
    }

    reader.onerror = () => {
      setErrors(["Failed to read the file. Please try again."])
      setIsProcessing(false)
    }

    reader.readAsText(file)
  }

  const parseCSV = (text: string): { districts: CSVDistrict[]; errors: string[] } => {
    const errors: string[] = []
    const districts: CSVDistrict[] = []

    const lines = text.split(/\r?\n/)
    const headers = lines[0].toLowerCase().split(",")

    // Validate headers
    const requiredHeaders = ["name", "location", "schools", "students", "status"]
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h))

    if (missingHeaders.length > 0) {
      errors.push(`Missing required headers: ${missingHeaders.join(", ")}`)
      return { districts, errors }
    }

    // Parse each line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const values = line.split(",")
      if (values.length < 5) {
        errors.push(`Line ${i + 1}: Not enough values`)
        continue
      }

      const district: CSVDistrict = {
        name: values[0],
        location: values[1],
        schools: Number.parseInt(values[2]) || 0,
        students: Number.parseInt(values[3]) || 0,
        status: values[4],
      }

      // Add optional fields if they exist
      const fieldMap: Record<string, number> = {}
      headers.forEach((header, index) => {
        fieldMap[header] = index
      })

      if (fieldMap["directorname"] !== undefined && values[fieldMap["directorname"]]) {
        district.directorName = values[fieldMap["directorname"]]
      }
      if (fieldMap["address"] !== undefined && values[fieldMap["address"]]) {
        district.address = values[fieldMap["address"]]
      }
      if (fieldMap["phone"] !== undefined && values[fieldMap["phone"]]) {
        district.phone = values[fieldMap["phone"]]
      }
      if (fieldMap["email"] !== undefined && values[fieldMap["email"]]) {
        district.email = values[fieldMap["email"]]
      }
      if (fieldMap["fax"] !== undefined && values[fieldMap["fax"]]) {
        district.fax = values[fieldMap["fax"]]
      }
      if (fieldMap["website"] !== undefined && values[fieldMap["website"]]) {
        district.website = values[fieldMap["website"]]
      }
      if (fieldMap["enrollment"] !== undefined && values[fieldMap["enrollment"]]) {
        district.enrollment = Number.parseInt(values[fieldMap["enrollment"]]) || 0
      }
      if (fieldMap["ranumber"] !== undefined && values[fieldMap["ranumber"]]) {
        district.raNumber = values[fieldMap["ranumber"]]
      }
      if (fieldMap["contact2"] !== undefined && values[fieldMap["contact2"]]) {
        district.contact2 = values[fieldMap["contact2"]]
      }
      if (fieldMap["contact2phone"] !== undefined && values[fieldMap["contact2phone"]]) {
        district.contact2Phone = values[fieldMap["contact2phone"]]
      }
      if (fieldMap["contact2email"] !== undefined && values[fieldMap["contact2email"]]) {
        district.contact2Email = values[fieldMap["contact2email"]]
      }
      if (fieldMap["billingcontact"] !== undefined && values[fieldMap["billingcontact"]]) {
        district.billingContact = values[fieldMap["billingcontact"]]
      }
      if (fieldMap["billingaddress"] !== undefined && values[fieldMap["billingaddress"]]) {
        district.billingAddress = values[fieldMap["billingaddress"]]
      }
      if (fieldMap["billingphone"] !== undefined && values[fieldMap["billingphone"]]) {
        district.billingPhone = values[fieldMap["billingphone"]]
      }
      if (fieldMap["billingemail"] !== undefined && values[fieldMap["billingemail"]]) {
        district.billingEmail = values[fieldMap["billingemail"]]
      }
      if (fieldMap["superintendent"] !== undefined && values[fieldMap["superintendent"]]) {
        district.superintendent = values[fieldMap["superintendent"]]
      }
      if (fieldMap["established"] !== undefined && values[fieldMap["established"]]) {
        district.established = values[fieldMap["established"]]
      }
      if (fieldMap["budget"] !== undefined && values[fieldMap["budget"]]) {
        district.budget = values[fieldMap["budget"]]
      }
      if (fieldMap["participatingin"] !== undefined && values[fieldMap["participatingin"]]) {
        district.participatingIn = values[fieldMap["participatingin"]]
      }

      // Validate required fields
      if (!district.name) {
        errors.push(`Line ${i + 1}: Name is required`)
      }
      if (!district.location) {
        errors.push(`Line ${i + 1}: Location is required`)
      }
      if (isNaN(district.schools)) {
        errors.push(`Line ${i + 1}: Schools must be a number`)
      }
      if (isNaN(district.students)) {
        errors.push(`Line ${i + 1}: Students must be a number`)
      }

      // Validate status
      const validStatuses = ["Active", "Inactive"]
      if (!validStatuses.includes(district.status)) {
        errors.push(`Line ${i + 1}: Invalid status. Must be one of: ${validStatuses.join(", ")}`)
      }

      // Add district if no validation errors
      if (
        district.name &&
        district.location &&
        !isNaN(district.schools) &&
        !isNaN(district.students) &&
        validStatuses.includes(district.status)
      ) {
        districts.push(district)
      }
    }

    return { districts, errors }
  }

  const handleUpload = () => {
    // Convert CSVDistrict to the format expected by the app
    const newDistricts = parsedDistricts.map((district, index) => {
      // Parse participating products if available
      const participatingIn = district.participatingIn ? district.participatingIn.split(";").map((p) => p.trim()) : []

      return {
        id: `new-${Date.now()}-${index + 1}`,
        name: district.name,
        location: district.location,
        schools: district.schools,
        students: district.students,
        status: district.status,
        directorName: district.directorName || "",
        address: district.address || "",
        phone: district.phone || "",
        email: district.email || "",
        fax: district.fax || "",
        website: district.website || "",
        enrollment: district.enrollment || 0,
        raNumber: district.raNumber || "",
        contact2: district.contact2 || "",
        contact2Phone: district.contact2Phone || "",
        contact2Email: district.contact2Email || "",
        billingContact: district.billingContact || "",
        billingAddress: district.billingAddress || "",
        billingPhone: district.billingPhone || "",
        billingEmail: district.billingEmail || "",
        superintendent: district.superintendent || "",
        established: district.established || "",
        budget: district.budget || "",
        participatingIn: participatingIn,
      }
    })

    onUpload(newDistricts)
    handleClose()
  }

  const handleClose = () => {
    setFile(null)
    setParsedDistricts([])
    setErrors([])
    setActiveTab("upload")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Districts</DialogTitle>
          <DialogDescription>Upload multiple districts at once using a CSV file.</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upload">Upload CSV</TabsTrigger>
            <TabsTrigger value="review" disabled={parsedDistricts.length === 0}>
              Review Districts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium">CSV Template</h3>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Drag and drop your CSV file</h3>
                  <p className="text-sm text-muted-foreground">or click to browse files (max 100 districts)</p>
                </div>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isProcessing}>
                  {isProcessing ? "Processing..." : "Select File"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isProcessing}
                />
              </div>
            </div>

            {file && (
              <div className="flex items-center justify-between bg-muted p-3 rounded-md">
                <div className="flex items-center space-x-2">
                  <div className="rounded-full bg-primary/10 p-1">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{file.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {(file.size / 1024).toFixed(2)} KB
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    setFile(null)
                    setParsedDistricts([])
                    if (fileInputRef.current) fileInputRef.current.value = ""
                  }}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove file</span>
                </Button>
              </div>
            )}

            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index} className="text-sm">
                        {error}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {parsedDistricts.length > 0 && errors.length === 0 && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success</AlertTitle>
                <AlertDescription className="text-green-700">
                  {parsedDistricts.length} districts parsed successfully. Please review them in the next tab.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="review" className="space-y-4">
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Schools</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Director</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedDistricts.map((district, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{district.name}</TableCell>
                      <TableCell>{district.location}</TableCell>
                      <TableCell>{district.schools}</TableCell>
                      <TableCell>{district.students.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            district.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }
                        >
                          {district.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{district.directorName || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{parsedDistricts.length} districts ready to be uploaded</p>
              <Button onClick={handleUpload}>Upload Districts</Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
