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
import type { User, Role, BidRole } from "@/types/user"

interface BulkUploadUsersModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (users: User[]) => void
}

interface CSVUser {
  name: string
  email: string
  role: string
  bidRole: string
  district?: string
  school?: string
  status?: string
}

export function BulkUploadUsersModal({ isOpen, onClose, onUpload }: BulkUploadUsersModalProps) {
  const [activeTab, setActiveTab] = useState("upload")
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [parsedUsers, setParsedUsers] = useState<CSVUser[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // CSV template headers
  const csvTemplate = "Name,Email,Role,BidRole,District,School,Status\n"

  // Example data for the template
  const exampleData = [
    "John Doe,john.doe@example.com,District Admin,Bid Administrator,Springfield School District,,Active",
    "Jane Smith,jane.smith@example.com,School Admin,Bid Viewer,Springfield School District,Springfield Elementary School,Active",
    "Bob Johnson,bob.johnson@example.com,Viewer,Bid Viewer,,,Pending",
  ].join("\n")

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate + exampleData], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "user_upload_template.csv"
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
        setParsedUsers(result.users)
        setErrors(result.errors)

        if (result.users.length > 0 && result.errors.length === 0) {
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

  const parseCSV = (text: string): { users: CSVUser[]; errors: string[] } => {
    const errors: string[] = []
    const users: CSVUser[] = []

    const lines = text.split(/\r?\n/)
    const headers = lines[0].toLowerCase().split(",")

    // Validate headers
    const requiredHeaders = ["name", "email", "role", "bidrole"]
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h))

    if (missingHeaders.length > 0) {
      errors.push(`Missing required headers: ${missingHeaders.join(", ")}`)
      return { users, errors }
    }

    // Parse each line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const values = line.split(",")
      if (values.length < 4) {
        errors.push(`Line ${i + 1}: Not enough values`)
        continue
      }

      const user: CSVUser = {
        name: values[0],
        email: values[1],
        role: values[2],
        bidRole: values[3],
        district: values[4] || undefined,
        school: values[5] || undefined,
        status: values[6] || "Pending",
      }

      // Validate required fields
      if (!user.name) {
        errors.push(`Line ${i + 1}: Name is required`)
      }

      if (!user.email) {
        errors.push(`Line ${i + 1}: Email is required`)
      } else if (!/\S+@\S+\.\S+/.test(user.email)) {
        errors.push(`Line ${i + 1}: Invalid email format`)
      }

      // Validate role
      const validRoles = ["Co-op Admin", "District Admin", "School Admin", "Viewer"]
      if (!validRoles.includes(user.role)) {
        errors.push(`Line ${i + 1}: Invalid role. Must be one of: ${validRoles.join(", ")}`)
      }

      // Validate bid role
      const validBidRoles = ["Bid Administrator", "Bid Viewer"]
      if (!validBidRoles.includes(user.bidRole)) {
        errors.push(`Line ${i + 1}: Invalid bid role. Must be one of: ${validBidRoles.join(", ")}`)
      }

      // Add user if no validation errors
      if (user.name && user.email && validRoles.includes(user.role) && validBidRoles.includes(user.bidRole)) {
        users.push(user)
      }
    }

    return { users, errors }
  }

  const handleUpload = () => {
    // Convert CSVUser to User
    const newUsers: User[] = parsedUsers.map((user, index) => {
      // Create roles based on the role type
      const roles: Role[] = [
        {
          type: user.role,
          scope: {
            type: user.role.includes("Co-op")
              ? "co-op"
              : user.role.includes("District")
                ? "district"
                : user.role.includes("School")
                  ? "school"
                  : "system",
            id: user.role.includes("School")
              ? "school1"
              : user.role.includes("District")
                ? "district1"
                : user.role.includes("Co-op")
                  ? "coop1"
                  : "system",
            name: user.district || (user.role.includes("School") ? user.school : undefined),
          },
          permissions: [],
        },
      ]

      // Create bid roles
      const bidRoles: BidRole[] = [
        {
          type: user.bidRole,
          scope: {
            type: "system",
            id: "system",
          },
          permissions: [],
        },
      ]

      return {
        id: `new-${index + 1}`,
        name: user.name,
        email: user.email,
        roles,
        bidRoles,
        status: (user.status as "Active" | "Inactive" | "Pending") || "Pending",
        lastLogin: null,
      }
    })

    onUpload(newUsers)
    handleClose()
  }

  const handleClose = () => {
    setFile(null)
    setParsedUsers([])
    setErrors([])
    setActiveTab("upload")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Users</DialogTitle>
          <DialogDescription>Upload multiple users at once using a CSV file.</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upload">Upload CSV</TabsTrigger>
            <TabsTrigger value="review" disabled={parsedUsers.length === 0}>
              Review Users
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
                  <p className="text-sm text-muted-foreground">or click to browse files (max 500 users)</p>
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
                    setParsedUsers([])
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

            {parsedUsers.length > 0 && errors.length === 0 && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success</AlertTitle>
                <AlertDescription className="text-green-700">
                  {parsedUsers.length} users parsed successfully. Please review them in the next tab.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="review" className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Bid Role</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedUsers.map((user, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.bidRole}</TableCell>
                      <TableCell>{user.district || "-"}</TableCell>
                      <TableCell>{user.school || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            user.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : user.status === "Inactive"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {user.status || "Pending"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{parsedUsers.length} users ready to be uploaded</p>
              <Button onClick={handleUpload}>Upload Users</Button>
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
