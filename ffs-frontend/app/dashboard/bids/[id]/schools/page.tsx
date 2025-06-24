"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ClipboardList, ChevronRight, School, ChevronLeft, Search, X } from "lucide-react"
import { mockBids, statusColors } from "@/data/mock-bids"
import { mockParticipatingSchools } from "@/data/mock-participating-entities"
import { ToastContextProvider, useToast } from "@/components/ui/toast-context"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

function ParticipatingSchoolsContent({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [bid, setBid] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [schools, setSchools] = useState(mockParticipatingSchools)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Load bid data
  useEffect(() => {
    const loadData = () => {
      const foundBid = mockBids.find((b) => b.id === params.id)
      if (foundBid) {
        setBid(foundBid)
      } else {
        toast({
          title: "Bid Not Found",
          description: "The requested bid could not be found.",
          variant: "destructive",
        })
        router.push("/dashboard/bids/all")
      }
      setLoading(false)
    }

    loadData()
  }, [params.id, router, toast])

  // Filter schools based on search term
  const filteredSchools = schools.filter(
    (school) =>
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.principalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calculate pagination
  const totalItems = filteredSchools.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
  const currentItems = filteredSchools.slice(startIndex, endIndex)

  // Helper function to get category name by ID
  const getCategoryName = (categoryId: string) => {
    const bidCategories = [
      { id: "1", name: "Frozen" },
      { id: "2", name: "Bread" },
      { id: "3", name: "Produce" },
      { id: "4", name: "Dairy" },
      { id: "5", name: "Meat" },
      { id: "6", name: "Grocery" },
      { id: "7", name: "Paper" },
      { id: "8", name: "Cleaning" },
    ]

    if (!categoryId) return bid?.name || "Unnamed Bid"
    const category = bidCategories.find((cat) => cat.id === categoryId)
    return category ? category.name : bid?.name || "Unnamed Bid"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!bid) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.push("/dashboard/bids/all")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Bids
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="text-xl font-semibold text-gray-700">Bid Not Found</h2>
            <p className="text-muted-foreground mt-2">The requested bid could not be found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <Link
                href="/dashboard/bids/all"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                Bids
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <Link
                  href={`/dashboard/bids/${bid.id}`}
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  {bid.name || `${bid.bidYear} ${getCategoryName(bid.category)}`}
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Participating Schools</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Page title and bid info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Participating Schools</h1>
          <Badge
            variant="outline"
            className={statusColors[bid.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}
          >
            {bid.status}
          </Badge>
        </div>
        <Button variant="outline" onClick={() => router.push(`/dashboard/bids/${bid.id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Bid Details
        </Button>
      </div>

      {/* Bid Details Summary */}
      <Card className="max-w-3xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <School className="h-5 w-5" />
            Bid Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Bid Name:</span>
              <p className="mt-1">{bid.name || getCategoryName(bid.category)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Bid Number:</span>
              <p className="mt-1">{bid.id}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Bid Year:</span>
              <p className="mt-1">{bid.bidYear}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schools Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Participating Schools</CardTitle>
          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search schools..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("")
                    setCurrentPage(1)
                  }}
                  className="absolute right-2.5 top-2.5"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Showing {totalItems > 0 ? startIndex + 1 : 0}-{endIndex} of {totalItems}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School Name</TableHead>
                  <TableHead>Principal Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Enrollment</TableHead>
                  <TableHead>Billing Contact</TableHead>
                  <TableHead>Billing Address</TableHead>
                  <TableHead>Billing Email</TableHead>
                  <TableHead>Billing Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length > 0 ? (
                  currentItems.map((school) => (
                    <TableRow key={school.id}>
                      <TableCell className="font-medium">{school.name}</TableCell>
                      <TableCell>{school.principalName}</TableCell>
                      <TableCell>{school.address}</TableCell>
                      <TableCell>{school.phone}</TableCell>
                      <TableCell>{school.email}</TableCell>
                      <TableCell>{school.enrollment.toLocaleString()}</TableCell>
                      <TableCell>{school.billingContact}</TableCell>
                      <TableCell>{school.billingAddress}</TableCell>
                      <TableCell>{school.billingEmail}</TableCell>
                      <TableCell>{school.billingPhone}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      {searchTerm ? "No schools match your search criteria" : "No schools found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ParticipatingSchoolsPage({ params }: { params: { id: string } }) {
  return (
    <ToastContextProvider>
      <ParticipatingSchoolsContent params={params} />
    </ToastContextProvider>
  )
}
