"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, FileEdit, Eye, Trash2, Download } from "lucide-react"
import { format } from "date-fns"
import { CreateBidModal } from "@/components/dashboard/create-bid-modal"
import { EditBidModal } from "@/components/dashboard/edit-bid-modal"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { ToastContextProvider, useToast } from "@/components/ui/toast-context"
import { ViewBidModal } from "@/components/dashboard/view-bid-modal"
import { mockUsers } from "@/data/mock-users"

// Sample bid managers for the select list
export const bidManagers = mockUsers
  .filter((user) => user.bidRoles.some((role) => role.type === "Bid Administrator"))
  .map((user) => ({ id: user.id, name: user.name }))

// Sample bid data with updated properties
const initialBids = [
  {
    id: "BID-2023-001",
    name: "Fresh Produce Supply",
    note: "Annual bid for fresh fruits and vegetables",
    bidYear: "2023-2024",
    category: "Food",
    status: "Published",
    startDate: new Date("2023-05-01"),
    endDate: new Date("2024-04-30"),
    anticipatedOpeningDate: new Date("2023-06-15T10:00:00"),
    awardDate: new Date("2023-06-30"),
    bidManager: "1", // John Smith
    description: "Seeking suppliers for fresh fruits and vegetables for the 2023-2024 school year.",
    estimatedValue: "$250,000",
  },
  {
    id: "BID-2023-002",
    name: "Dairy Products Supply",
    note: "Milk, cheese, and yogurt for all schools",
    bidYear: "2023-2024",
    category: "Food",
    status: "Draft",
    startDate: new Date("2023-07-01"),
    endDate: new Date("2024-06-30"),
    anticipatedOpeningDate: new Date("2023-07-10T14:00:00"),
    awardDate: null,
    bidManager: "2", // Sarah Johnson
    description: "Seeking suppliers for dairy products including milk, cheese, and yogurt.",
    estimatedValue: "$175,000",
  },
  {
    id: "BID-2023-003",
    name: "Classroom Technology Equipment",
    note: "Projectors, tablets, and interactive whiteboards",
    bidYear: "2023-2024",
    category: "Technology",
    status: "Closed",
    startDate: new Date("2023-03-15"),
    endDate: new Date("2024-03-14"),
    anticipatedOpeningDate: new Date("2023-04-30T09:00:00"),
    awardDate: new Date("2023-05-15"),
    bidManager: "3", // Michael Brown
    description: "Seeking suppliers for classroom technology including projectors and tablets.",
    estimatedValue: "$500,000",
  },
  {
    id: "BID-2023-004",
    name: "School Bus Maintenance Services",
    note: "Regular maintenance and emergency repairs",
    bidYear: "2023-2024",
    category: "Services",
    status: "Published",
    startDate: new Date("2023-04-20"),
    endDate: new Date("2024-04-19"),
    anticipatedOpeningDate: new Date("2023-06-01T13:30:00"),
    awardDate: null,
    bidManager: "4", // Lisa Garcia
    description: "Seeking qualified vendors for school bus maintenance and repair services.",
    estimatedValue: "$120,000",
  },
  {
    id: "BID-2023-005",
    name: "Cafeteria Furniture Replacement",
    note: "Tables, chairs, and serving line equipment",
    bidYear: "2023-2024",
    category: "Furniture",
    status: "Draft",
    startDate: null,
    endDate: null,
    anticipatedOpeningDate: new Date("2023-08-15T11:00:00"),
    awardDate: null,
    bidManager: "5", // David Wilson
    description: "Seeking suppliers for cafeteria tables, chairs, and serving line equipment.",
    estimatedValue: "$350,000",
  },
]

// Bid status badge colors
const statusColors = {
  Draft: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100",
  Published: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
  Closed: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100",
  Awarded: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",
  Cancelled: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
}

function BidsContent() {
  const [bids, setBids] = useState(initialBids)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedBid, setSelectedBid] = useState<any>(null)
  const { toast } = useToast()
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [userData, setUserData] = useState<any>(null)

  // Load user data from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUserData(parsedUser)
        console.log("User data loaded:", parsedUser)
      } catch (e) {
        console.error("Failed to parse user data:", e)
      }
    }
  }, [])

  // Check if user can edit bids
  const canEditBids = () => {
    if (!userData) return false

    // Administrator can always edit
    if (userData.role === "Administrator") return true

    // Check for bid-specific roles
    if (userData.bidRole === "Bid Administrator") return true

    // Check for bid-specific permissions
    if (
      userData.bidPermissions &&
      (userData.bidPermissions.includes("create_bids") || userData.bidPermissions.includes("edit_bids"))
    ) {
      return true
    }

    return false
  }

  const handleCreateBid = (newBid: any) => {
    // Generate a new ID for the bid
    const newId = `BID-${new Date().getFullYear()}-${(bids.length + 1).toString().padStart(3, "0")}`
    const bidWithId = { ...newBid, id: newId }

    setBids([...bids, bidWithId])
    setCreateModalOpen(false)
    toast({
      title: "Bid Created",
      description: `Bid ${newId} has been successfully created.`,
      variant: "success",
    })
  }

  const handleEditBid = (updatedBid: any) => {
    setBids(bids.map((bid) => (bid.id === updatedBid.id ? updatedBid : bid)))
    setEditModalOpen(false)
    toast({
      title: "Bid Updated",
      description: `Bid ${updatedBid.id} has been successfully updated.`,
      variant: "success",
    })
  }

  const handleDeleteClick = (bid: any) => {
    setSelectedBid(bid)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedBid) {
      setBids(bids.filter((bid) => bid.id !== selectedBid.id))
      setDeleteModalOpen(false)
      toast({
        title: "Bid Deleted",
        description: `Bid ${selectedBid.id} has been successfully deleted.`,
        variant: "success",
      })
      setSelectedBid(null)
    }
  }

  const handleEditClick = (bid: any) => {
    setSelectedBid(bid)
    setEditModalOpen(true)
  }

  const handleViewClick = (bid: any) => {
    setSelectedBid(bid)
    setViewModalOpen(true)
  }

  // Helper function to get bid manager name by ID
  const getBidManagerName = (managerId: string) => {
    const manager = bidManagers.find((manager) => manager.id === managerId)
    return manager ? manager.name : "Not assigned"
  }

  // Helper function to format date and time
  const formatDateTime = (date: Date | null) => {
    if (!date) return "Not set"
    return format(new Date(date), "MMM d, yyyy 'at' h:mm a")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bid Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage bids for your procurement needs.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="cursor-pointer">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          {canEditBids() && (
            <Button className="bg-black hover:bg-gray-800 cursor-pointer" onClick={() => setCreateModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Bid
            </Button>
          )}
        </div>
      </div>

      <Card className="shadow-sm hover:shadow transition-shadow">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-white pb-6">
          <CardTitle>Bids</CardTitle>
          <CardDescription>View and manage all your bids in one place.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow className="border-t border-b">
                <TableHead className="py-3">Bid ID</TableHead>
                <TableHead className="py-3">Bid Name</TableHead>
                <TableHead className="py-3">Bid Year</TableHead>
                <TableHead className="py-3">Status</TableHead>
                <TableHead className="py-3">Start Date</TableHead>
                <TableHead className="py-3">End Date</TableHead>
                <TableHead className="py-3">Opening Date</TableHead>
                <TableHead className="py-3">Bid Manager</TableHead>
                <TableHead className="text-right py-3">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bids.map((bid, index) => (
                <TableRow key={bid.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <TableCell className="font-medium">{bid.id}</TableCell>
                  <TableCell>{bid.name}</TableCell>
                  <TableCell>{bid.bidYear}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusColors[bid.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}
                    >
                      {bid.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{bid.startDate ? format(new Date(bid.startDate), "MMM d, yyyy") : "Not set"}</TableCell>
                  <TableCell>{bid.endDate ? format(new Date(bid.endDate), "MMM d, yyyy") : "Not set"}</TableCell>
                  <TableCell>
                    {bid.anticipatedOpeningDate
                      ? format(new Date(bid.anticipatedOpeningDate), "MMM d, yyyy")
                      : "Not set"}
                  </TableCell>
                  <TableCell>{getBidManagerName(bid.bidManager)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="View Bid Details"
                        onClick={() => handleViewClick(bid)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      {canEditBids() && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            onClick={() => handleEditClick(bid)}
                            title="Edit Bid"
                          >
                            <FileEdit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteClick(bid)}
                            title="Delete Bid"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Bid Modal */}
      <CreateBidModal open={createModalOpen} onOpenChange={setCreateModalOpen} onSubmit={handleCreateBid} />

      {/* Edit Bid Modal */}
      {selectedBid && (
        <EditBidModal bid={selectedBid} open={editModalOpen} onOpenChange={setEditModalOpen} onSubmit={handleEditBid} />
      )}

      {/* View Bid Modal */}
      {selectedBid && (
        <ViewBidModal
          bid={selectedBid}
          open={viewModalOpen}
          onOpenChange={setViewModalOpen}
          canEdit={canEditBids()}
          onEdit={() => {
            setViewModalOpen(false)
            setEditModalOpen(true)
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Bid"
        description={`Are you sure you want to delete bid ${selectedBid?.id}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  )
}

export default function BidsPage() {
  return (
    <ToastContextProvider>
      <BidsContent />
    </ToastContextProvider>
  )
}
