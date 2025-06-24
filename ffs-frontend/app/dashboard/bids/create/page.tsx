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
import { statusColors } from "@/data/mock-bids"
import { getFullName } from "@/types/user"
import { getAllBids, createBid } from "@/lib/api/bids"
import { getAllUsers } from "@/lib/api/users"

function BidsContent() {
  const [bids, setBids] = useState<any[]>([])
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedBid, setSelectedBid] = useState<any>(null)
  const { toast } = useToast()
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [localMockUsers, setLocalMockUsers] = useState<any[]>([])

  // Load user data from localStorage on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          setUserData(parsedUser)
        }

        // Load data from database
        const [dbBids, dbUsers] = await Promise.all([getAllBids(), getAllUsers()])

        setBids(dbBids)
        setLocalMockUsers(dbUsers)
      } catch (error) {
        console.error("Failed to load data:", error)
      }
    }

    loadData()
  }, [])

  // Check if user can edit bids
  const canEditBids = () => {
    return (
      userData?.bidRole === "Bid Administrator" ||
      userData?.bidPermissions?.includes("create_bids") ||
      userData?.bidPermissions?.includes("edit_bids")
    )
  }

  const handleCreateBid = async (newBid: any) => {
    try {
      const createdBid = await createBid(newBid)
      setBids([...bids, createdBid])
      setCreateModalOpen(false)
      toast({
        title: "Bid Created",
        description: `Bid ${createdBid.id} has been successfully created.`,
        variant: "success",
      })
    } catch (error) {
      console.error("Failed to create bid:", error)
      toast({
        title: "Error",
        description: "Failed to create bid",
        variant: "destructive",
      })
    }
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

  // Helper function to get bid manager name by ID
  const getBidManagerName = (managerId: string) => {
    const manager = localMockUsers.find((user) => user.id === managerId)
    return manager ? getFullName(manager) : "Not assigned"
  }

  // Helper function to format date and time
  const formatDateTime = (date: Date | null) => {
    if (!date) return "Not set"
    return format(new Date(date), "MMM d, yyyy 'at' h:mm a")
  }

  const handleViewClick = (bid: any) => {
    setSelectedBid(bid)
    setViewModalOpen(true)
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
                <TableHead className="py-3">Award Type</TableHead>
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
                  <TableCell>{bid.awardType || "Not specified"}</TableCell>
                  <TableCell>{bid.startDate ? format(new Date(bid.startDate), "MMM d, yyyy") : "Not set"}</TableCell>
                  <TableCell>{bid.endDate ? format(new Date(bid.endDate), "MMM d, yyyy") : "Not set"}</TableCell>
                  <TableCell>
                    {bid.anticipatedOpeningDate
                      ? format(new Date(bid.anticipatedOpeningDate), "MMM d, yyyy")
                      : "Not set"}
                  </TableCell>
                  <TableCell>{getBidManagerName(bid.userId || bid.bidManagerId)}</TableCell>
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
          userData={userData}
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
