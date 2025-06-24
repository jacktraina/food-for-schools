"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  FileEdit,
  Trash2,
  ArrowLeft,
  ClipboardList,
  Plus,
  Search,
  Download,
  ChevronRight,
  Building,
} from "lucide-react"
import { format } from "date-fns"
import { mockBids, statusColors } from "@/data/mock-bids"
import { mockUsers } from "@/data/mock-users"
import { ToastContextProvider, useToast } from "@/components/ui/toast-context"
import { AddBidAdjustmentModal } from "@/components/dashboard/add-bid-adjustment-modal"
import { mockBidAdjustments, type BidAdjustment } from "@/data/mock-bid-adjustments"
import type { User } from "@/types/user"
import { getFullName } from "@/types/user"

function BidAdjustmentsContent({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [bid, setBid] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<User | null>(null)
  const [localMockUsers, setLocalMockUsers] = useState<any[]>(mockUsers)

  // Bid Adjustments state
  const [adjustments, setAdjustments] = useState<BidAdjustment[]>([])
  const [filteredAdjustments, setFilteredAdjustments] = useState<BidAdjustment[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [addAdjustmentModalOpen, setAddAdjustmentModalOpen] = useState(false)

  // Load user data and bid data
  useEffect(() => {
    const loadData = () => {
      // Load user data
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser) as User
          setUserData(parsedUser)

          // Also load mock users if available
          if (parsedUser.allUsers) {
            setLocalMockUsers(parsedUser.allUsers)
          } else {
            const storedMockUsers = localStorage.getItem("mockUsers")
            if (storedMockUsers) {
              setLocalMockUsers(JSON.parse(storedMockUsers))
            }
          }
        } catch (e) {
          console.error("Failed to parse user data:", e)
        }
      }

      // Find the bid with the matching ID
      const foundBid = mockBids.find((b) => b.id === params.id)
      if (foundBid) {
        setBid(foundBid)

        // Load adjustments for this bid
        const bidAdjustments = mockBidAdjustments.filter((adjustment) => adjustment.bidId === params.id)
        setAdjustments(bidAdjustments)
        setFilteredAdjustments(bidAdjustments)
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

  // Filter adjustments when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAdjustments(adjustments)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = adjustments.filter(
        (adjustment) =>
          adjustment.itemAffected.toLowerCase().includes(query) ||
          (adjustment.lisdnaCode && adjustment.lisdnaCode.toLowerCase().includes(query)) ||
          adjustment.adjustmentType.toLowerCase().includes(query) ||
          adjustment.note.toLowerCase().includes(query),
      )
      setFilteredAdjustments(filtered)
    }
  }, [searchQuery, adjustments])

  // Check if user can edit bids
  const canEditBid = (): boolean => {
    if (!userData) return false

    // Administrator can always edit
    if (userData.roles.some((role) => role.type === "Co-op Admin" || role.type === "District Admin")) return true

    // Bid Administrator with specific permissions
    if (
      userData.bidRoles &&
      userData.bidRoles.some((role) => role.type === "Bid Administrator" && role.permissions.includes("edit_bids"))
    )
      return true

    // Check if user is specifically assigned as a manager for this bid
    if (bid && userData.managedBids && userData.managedBids.includes(bid.id)) return true

    return false
  }

  // Bid Adjustment functions
  const handleAddAdjustment = (newAdjustment: BidAdjustment) => {
    setAdjustments((prev) => [...prev, newAdjustment])
  }

  const handleDeleteAdjustment = (adjustmentId: string) => {
    // In a real app, this would be an API call
    setAdjustments((prev) => prev.filter((adjustment) => adjustment.id !== adjustmentId))

    toast({
      title: "Adjustment Deleted",
      description: "The bid adjustment has been successfully deleted.",
      variant: "success",
    })
  }

  // Helper function to get user name by ID
  const getUserName = (userId: string) => {
    // First try to find the user in the mockUsers array
    const user = mockUsers.find((user) => user.id === userId)
    if (user) return getFullName(user)

    // If not found in the mock users, try to find in local mock users
    const localUser = localMockUsers.find((user) => user.id === userId)
    if (localUser) return getFullName(localUser)

    return "Unknown User"
  }

  // Helper function to get category name by ID
  const getCategoryName = (categoryId: string) => {
    // If no category ID is provided, return the bid name or a default
    if (!categoryId) return bid?.name || "Unnamed Bid"

    // Try to find the category in our list
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
    const category = bidCategories.find((cat) => cat.id === categoryId)

    // If found, return the name, otherwise return the bid name or a default
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
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Adjustments</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Page title and bid info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Bid Adjustments</h1>
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

      {/* Bid Details Summary - Matching Participating Districts page */}
      <Card className="max-w-3xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building className="h-5 w-5" />
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

      {/* Bid Adjustments Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <CardTitle className="text-lg">Bid Adjustments</CardTitle>
            {canEditBid() && (
              <Button onClick={() => setAddAdjustmentModalOpen(true)} size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add Bid Adjustment
              </Button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search adjustments..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Showing {filteredAdjustments.length} of {adjustments.length}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Affected</TableHead>
                  <TableHead>District Code</TableHead>
                  <TableHead>Adjustment Type</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Entered By</TableHead>
                  <TableHead>Date</TableHead>
                  {canEditBid() && <TableHead className="w-24">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdjustments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canEditBid() ? 9 : 8} className="text-center py-8 text-gray-500">
                      No adjustments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdjustments.map((adjustment) => (
                    <TableRow key={adjustment.id}>
                      <TableCell className="font-medium">{adjustment.itemAffected}</TableCell>
                      <TableCell>{adjustment.lisdnaCode || "-"}</TableCell>
                      <TableCell>{adjustment.adjustmentType}</TableCell>
                      <TableCell>{format(new Date(adjustment.effectiveDate), "MM/dd/yyyy")}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={adjustment.note}>
                        {adjustment.note}
                      </TableCell>
                      <TableCell>
                        {adjustment.fileUrl ? (
                          <a
                            href={adjustment.fileUrl}
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            {adjustment.fileName}
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{getUserName(adjustment.enteredBy)}</TableCell>
                      <TableCell>{format(new Date(adjustment.enteredDate), "MM/dd/yyyy")}</TableCell>
                      {canEditBid() && (
                        <TableCell>
                          <div className="flex justify-end gap-2 items-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                              title="Edit Adjustment"
                            >
                              <FileEdit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteAdjustment(adjustment.id)}
                              title="Delete Adjustment"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Adjustment Modal */}
      <AddBidAdjustmentModal
        open={addAdjustmentModalOpen}
        onOpenChange={setAddAdjustmentModalOpen}
        bidId={bid.id}
        onAdjustmentAdded={handleAddAdjustment}
      />
    </div>
  )
}

export default function BidAdjustmentsPage({ params }: { params: { id: string } }) {
  return (
    <ToastContextProvider>
      <BidAdjustmentsContent params={params} />
    </ToastContextProvider>
  )
}
