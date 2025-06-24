"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Download,
  Eye,
  FileText,
  Search,
  Trash2,
  Upload,
  FileArchive,
  FilePlus,
  FileCheck,
  FileQuestion,
} from "lucide-react"
import { ToastContextProvider, useToast } from "@/components/ui/toast-context"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"

type UserData = {
  email: string
  name: string
  role: string
  organizationType: "SingleDistrict" | "Coop"
  organizationId: string
  permissions: string[]
}

type Document = {
  id: string
  name: string
  description: string
  category: "Bid" | "Contract" | "Policy" | "Form" | "Guide" | "Report" | "Other"
  fileType: "PDF" | "Word" | "Excel" | "PowerPoint" | "Image" | "Other"
  status: "Active" | "Archived"
  uploadedBy: string
  uploadedAt: Date
  fileSize: number
  downloadUrl: string
  tags: string[]
}

// Sample documents
const sampleDocuments: Document[] = [
  {
    id: "doc-001",
    name: "Bid Specification Template",
    description: "Standard template for creating bid specifications",
    category: "Bid",
    fileType: "Word",
    status: "Active",
    uploadedBy: "Admin User",
    uploadedAt: new Date("2023-05-15"),
    fileSize: 245000, // in bytes
    downloadUrl: "#",
    tags: ["template", "bid", "specification"],
  },
  {
    id: "doc-002",
    name: "Vendor Contract Agreement",
    description: "Standard contract agreement for vendors",
    category: "Contract",
    fileType: "PDF",
    status: "Active",
    uploadedBy: "Admin User",
    uploadedAt: new Date("2023-06-20"),
    fileSize: 350000,
    downloadUrl: "#",
    tags: ["contract", "vendor", "legal"],
  },
  {
    id: "doc-003",
    name: "Food Safety Guidelines",
    description: "Comprehensive guide on food safety standards for schools",
    category: "Guide",
    fileType: "PDF",
    status: "Active",
    uploadedBy: "Sarah Johnson",
    uploadedAt: new Date("2023-04-10"),
    fileSize: 1200000,
    downloadUrl: "#",
    tags: ["food safety", "guidelines", "standards"],
  },
  {
    id: "doc-004",
    name: "Nutrition Standards Compliance Report",
    description: "Annual report on nutrition standards compliance",
    category: "Report",
    fileType: "Excel",
    status: "Active",
    uploadedBy: "Michael Brown",
    uploadedAt: new Date("2023-07-05"),
    fileSize: 780000,
    downloadUrl: "#",
    tags: ["nutrition", "compliance", "report", "annual"],
  },
  {
    id: "doc-005",
    name: "Vendor Application Form",
    description: "Application form for new vendors",
    category: "Form",
    fileType: "PDF",
    status: "Active",
    uploadedBy: "Admin User",
    uploadedAt: new Date("2023-03-15"),
    fileSize: 180000,
    downloadUrl: "#",
    tags: ["vendor", "application", "form"],
  },
  {
    id: "doc-006",
    name: "Procurement Policy 2022",
    description: "Official procurement policy document for 2022",
    category: "Policy",
    fileType: "PDF",
    status: "Archived",
    uploadedBy: "Admin User",
    uploadedAt: new Date("2022-01-10"),
    fileSize: 420000,
    downloadUrl: "#",
    tags: ["policy", "procurement", "2022"],
  },
  {
    id: "doc-007",
    name: "Procurement Policy 2023",
    description: "Updated procurement policy document for 2023",
    category: "Policy",
    fileType: "PDF",
    status: "Active",
    uploadedBy: "Admin User",
    uploadedAt: new Date("2023-01-15"),
    fileSize: 450000,
    downloadUrl: "#",
    tags: ["policy", "procurement", "2023"],
  },
  {
    id: "doc-008",
    name: "Menu Planning Worksheet",
    description: "Worksheet for planning school menus",
    category: "Form",
    fileType: "Excel",
    status: "Active",
    uploadedBy: "Lisa Garcia",
    uploadedAt: new Date("2023-05-22"),
    fileSize: 320000,
    downloadUrl: "#",
    tags: ["menu", "planning", "worksheet"],
  },
]

function DocumentsContent() {
  const [documents, setDocuments] = useState<Document[]>(sampleDocuments)
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>(sampleDocuments)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedFileType, setSelectedFileType] = useState("All Types")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  // New document form state
  const [newDocument, setNewDocument] = useState({
    name: "",
    description: "",
    category: "Bid",
    fileType: "PDF",
    tags: "",
    file: null as File | null,
  })

  // Load user data from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as UserData
        setUserData(parsedUser)
      } catch (e) {
        console.error("Failed to parse user data:", e)
      }
    }
  }, [])

  // Filter documents based on search query, category, file type, and active tab
  useEffect(() => {
    let filtered = [...documents]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Filter by category
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter((doc) => doc.category === selectedCategory)
    }

    // Filter by file type
    if (selectedFileType !== "All Types") {
      filtered = filtered.filter((doc) => doc.fileType === selectedFileType)
    }

    // Filter by tab
    if (activeTab === "active") {
      filtered = filtered.filter((doc) => doc.status === "Active")
    } else if (activeTab === "archived") {
      filtered = filtered.filter((doc) => doc.status === "Archived")
    }

    setFilteredDocuments(filtered)
  }, [searchQuery, selectedCategory, selectedFileType, documents, activeTab])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setNewDocument({ ...newDocument, file })
    }
  }

  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newDocument.name || !newDocument.file) {
      toast({
        title: "Error",
        description: "Please provide a document name and select a file to upload",
        variant: "destructive",
      })
      return
    }

    // Create new document
    const newDoc: Document = {
      id: `doc-${Math.floor(Math.random() * 1000)}`,
      name: newDocument.name,
      description: newDocument.description,
      category: newDocument.category as "Bid",
      fileType: newDocument.fileType as "PDF",
      status: "Active",
      uploadedBy: userData?.name || "Current User",
      uploadedAt: new Date(),
      fileSize: newDocument.file.size,
      downloadUrl: "#",
      tags: newDocument.tags.split(",").map((tag) => tag.trim()),
    }

    setDocuments([newDoc, ...documents])
    setIsUploadDialogOpen(false)
    toast({
      title: "Success",
      description: "Document uploaded successfully",
      variant: "success",
    })

    // Reset form
    setNewDocument({
      name: "",
      description: "",
      category: "Bid",
      fileType: "PDF",
      tags: "",
      file: null,
    })
  }

  const handleViewDocument = (document: Document) => {
    // In a real app, this would open the document in a new tab or viewer
    window.open(document.downloadUrl, "_blank")
  }

  const handleDownloadDocument = (document: Document) => {
    // In a real app, this would trigger a download
    toast({
      title: "Download Started",
      description: `Downloading ${document.name}...`,
      variant: "success",
    })
  }

  const handleDeleteClick = (document: Document) => {
    setSelectedDocument(document)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedDocument) {
      // In a real app, you would call an API to delete the document
      const updatedDocuments = documents.filter((doc) => doc.id !== selectedDocument.id)
      setDocuments(updatedDocuments)
      setIsDeleteModalOpen(false)
      toast({
        title: "Success",
        description: "Document deleted successfully",
        variant: "success",
      })
    }
  }

  const handleArchiveDocument = (document: Document) => {
    // Toggle document status between Active and Archived
    const updatedDocuments = documents.map((doc) =>
      doc.id === document.id
        ? {
            ...doc,
            status: doc.status === "Active" ? "Archived" : "Active",
          }
        : doc,
    )
    setDocuments(updatedDocuments)
    toast({
      title: "Success",
      description: `Document ${document.status === "Active" ? "archived" : "restored"} successfully`,
      variant: "success",
    })
  }

  const isAdmin = userData?.role === "Administrator"
  const canUpload = isAdmin || userData?.role === "Bid Manager"

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  // Helper function to get file type icon
  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case "PDF":
        return <FileText className="h-4 w-4 text-red-500" />
      case "Word":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "Excel":
        return <FileText className="h-4 w-4 text-green-500" />
      case "PowerPoint":
        return <FileText className="h-4 w-4 text-orange-500" />
      case "Image":
        return <FileText className="h-4 w-4 text-purple-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  // Helper function to get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Bid":
        return <FilePlus className="h-4 w-4 text-blue-500" />
      case "Contract":
        return <FileCheck className="h-4 w-4 text-green-500" />
      case "Policy":
        return <FileText className="h-4 w-4 text-amber-500" />
      case "Form":
        return <FileQuestion className="h-4 w-4 text-purple-500" />
      case "Guide":
        return <FileText className="h-4 w-4 text-cyan-500" />
      case "Report":
        return <FileText className="h-4 w-4 text-red-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground mt-1">Access and manage important documents and resources.</p>
        </div>
        {canUpload && (
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Document Library</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Categories">All Categories</SelectItem>
                    <SelectItem value="Bid">Bid</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Policy">Policy</SelectItem>
                    <SelectItem value="Form">Form</SelectItem>
                    <SelectItem value="Guide">Guide</SelectItem>
                    <SelectItem value="Report">Report</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedFileType} onValueChange={setSelectedFileType}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="File Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Types">All Types</SelectItem>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="Word">Word</SelectItem>
                    <SelectItem value="Excel">Excel</SelectItem>
                    <SelectItem value="PowerPoint">PowerPoint</SelectItem>
                    <SelectItem value="Image">Image</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <CardDescription>Access important documents, templates, and resources.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Documents</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-4">
              <DocumentTable
                documents={filteredDocuments}
                onView={handleViewDocument}
                onDownload={handleDownloadDocument}
                onDelete={handleDeleteClick}
                onArchive={handleArchiveDocument}
                isAdmin={isAdmin}
                getFileTypeIcon={getFileTypeIcon}
                getCategoryIcon={getCategoryIcon}
                formatFileSize={formatFileSize}
              />
            </TabsContent>
            <TabsContent value="active" className="space-y-4">
              <DocumentTable
                documents={filteredDocuments}
                onView={handleViewDocument}
                onDownload={handleDownloadDocument}
                onDelete={handleDeleteClick}
                onArchive={handleArchiveDocument}
                isAdmin={isAdmin}
                getFileTypeIcon={getFileTypeIcon}
                getCategoryIcon={getCategoryIcon}
                formatFileSize={formatFileSize}
              />
            </TabsContent>
            <TabsContent value="archived" className="space-y-4">
              <DocumentTable
                documents={filteredDocuments}
                onView={handleViewDocument}
                onDownload={handleDownloadDocument}
                onDelete={handleDeleteClick}
                onArchive={handleArchiveDocument}
                isAdmin={isAdmin}
                getFileTypeIcon={getFileTypeIcon}
                getCategoryIcon={getCategoryIcon}
                formatFileSize={formatFileSize}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Upload Document Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Upload a new document to the library.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUploadDocument}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Document Name *</Label>
                <Input
                  id="name"
                  value={newDocument.name}
                  onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newDocument.description}
                  onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                  placeholder="Brief description of the document"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newDocument.category}
                  onValueChange={(value) => setNewDocument({ ...newDocument, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bid">Bid</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Policy">Policy</SelectItem>
                    <SelectItem value="Form">Form</SelectItem>
                    <SelectItem value="Guide">Guide</SelectItem>
                    <SelectItem value="Report">Report</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fileType">File Type</Label>
                <Select
                  value={newDocument.fileType}
                  onValueChange={(value) => setNewDocument({ ...newDocument, fileType: value })}
                >
                  <SelectTrigger id="fileType">
                    <SelectValue placeholder="Select file type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="Word">Word</SelectItem>
                    <SelectItem value="Excel">Excel</SelectItem>
                    <SelectItem value="PowerPoint">PowerPoint</SelectItem>
                    <SelectItem value="Image">Image</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={newDocument.tags}
                  onChange={(e) => setNewDocument({ ...newDocument, tags: e.target.value })}
                  placeholder="e.g. template, bid, form"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">File *</Label>
                <Input id="file" type="file" onChange={handleFileChange} required />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Upload</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      {selectedDocument && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Document"
          description={`Are you sure you want to delete "${selectedDocument.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}
    </div>
  )
}

interface DocumentTableProps {
  documents: Document[]
  onView: (document: Document) => void
  onDownload: (document: Document) => void
  onDelete: (document: Document) => void
  onArchive: (document: Document) => void
  isAdmin: boolean
  getFileTypeIcon: (fileType: string) => React.ReactNode
  getCategoryIcon: (category: string) => React.ReactNode
  formatFileSize: (bytes: number) => string
}

function DocumentTable({
  documents,
  onView,
  onDownload,
  onDelete,
  onArchive,
  isAdmin,
  getFileTypeIcon,
  getCategoryIcon,
  formatFileSize,
}: DocumentTableProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No documents found
              </TableCell>
            </TableRow>
          ) : (
            documents.map((document) => (
              <TableRow key={document.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{document.name}</span>
                    {document.description && (
                      <span className="text-xs text-muted-foreground truncate max-w-[250px]">
                        {document.description}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {getCategoryIcon(document.category)}
                    <span>{document.category}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {getFileTypeIcon(document.fileType)}
                    <span>{document.fileType}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{formatDate(document.uploadedAt)}</span>
                    <span className="text-xs text-muted-foreground">{document.uploadedBy}</span>
                  </div>
                </TableCell>
                <TableCell>{formatFileSize(document.fileSize)}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      document.status === "Active" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                    }
                  >
                    {document.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => onView(document)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => onDownload(document)}
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download</span>
                    </Button>
                    {isAdmin && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          onClick={() => onArchive(document)}
                        >
                          <FileArchive className="h-4 w-4" />
                          <span className="sr-only">{document.status === "Active" ? "Archive" : "Restore"}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => onDelete(document)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default function DocumentsPage() {
  return (
    <ToastContextProvider>
      <DocumentsContent />
    </ToastContextProvider>
  )
}
