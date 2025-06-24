"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { UserPlus } from "lucide-react"
import { AssignBidManagerModal } from "./assign-bid-manager-modal"
import { statusColors } from "@/data/mock-bids"
import type { User } from "@/types/user"
import { mockUsers } from "@/data/mock-users"
import { getFullName } from "@/types/user"

// Fetch bid categories from API or use mock data
const bidCategories = [
  { id: "1", name: "Frozen", description: "Frozen food items including vegetables, meats, and prepared meals" },
  { id: "2", name: "Bread", description: "Bread products including sandwich bread, rolls, and buns" },
  { id: "3", name: "Produce", description: "Fresh fruits and vegetables" },
  { id: "4", name: "Dairy", description: "Milk, cheese, yogurt, and other dairy products" },
  { id: "5", name: "Meat", description: "Fresh and processed meat products" },
  { id: "6", name: "Grocery", description: "Shelf-stable food items and pantry staples" },
  { id: "7", name: "Paper", description: "Paper products including napkins, plates, and towels" },
  { id: "8", name: "Cleaning", description: "Cleaning supplies and janitorial products" },
]

interface ViewBidModalProps {
  bid: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: () => void
  canEdit?: boolean
  userData?: User | null
}

export function ViewBidModal({ bid, open, onOpenChange, onEdit, canEdit = true, userData }: ViewBidModalProps) {
  const [isAssignManagerModalOpen, setIsAssignManagerModalOpen] = useState(false)
  const [localMockUsers, setLocalMockUsers] = useState<any[]>(mockUsers)

  useEffect(() => {
    // Load mock users from localStorage
    const loadMockUsers = () => {
      try {
        const storedUsers = localStorage.getItem("mockUsers")
        if (storedUsers) {
          setLocalMockUsers(JSON.parse(storedUsers))
        } else {
          // If not in localStorage yet, try to get from the initial login
          const storedUser = localStorage.getItem("user")
          if (storedUser) {
            const user = JSON.parse(storedUser)
            if (user.allUsers) {
              setLocalMockUsers(user.allUsers)
              // Store for future use
              localStorage.setItem("mockUsers", JSON.stringify(user.allUsers))
            } else {
              // Use mockUsers as a fallback
              setLocalMockUsers(mockUsers)
              localStorage.setItem("mockUsers", JSON.stringify(mockUsers))
            }
          } else {
            // Use mockUsers as a fallback
            setLocalMockUsers(mockUsers)
            localStorage.setItem("mockUsers", JSON.stringify(mockUsers))
          }
        }
      } catch (error) {
        console.error("Error loading mock users:", error)
        // Use mockUsers as a fallback
        setLocalMockUsers(mockUsers)
      }
    }

    loadMockUsers()
  }, [])

  if (!bid) return null

  // Helper function to get bid manager name by ID
  const getBidManagerName = (managerId: string) => {
    // First try to find the manager in the mockUsers array
    const manager = mockUsers.find((user) => user.id === managerId)
    if (manager) return getFullName(manager)

    // If not found in the mock users, try to find in local mock users
    const localManager = localMockUsers.find((user) => user.id === managerId)
    if (localManager) return getFullName(localManager)

    return "Not assigned"
  }

  // Helper function to get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = bidCategories.find((cat) => cat.id === categoryId)
    return category ? category.name : "Unknown category"
  }

  // Helper function to format date
  const formatDate = (date: Date | null) => {
    if (!date) return "Not set"
    return format(new Date(date), "MMMM d, yyyy")
  }

  // Helper function to format date and time
  const formatDateTime = (date: Date | null) => {
    if (!date) return "Not set"
    return format(new Date(date), "MMMM d, yyyy 'at' h:mm a")
  }

  // Check if user can assign bid managers
  const canAssignBidManagers = () => {
    if (!userData) return false

    // User needs to be a Bid Administrator
    return (
      userData.bidRoles &&
      userData.bidRoles.some(
        (role) => role.type === "Bid Administrator" && role.permissions.includes("assign_bid_administrators"),
      )
    )
  }

  const handleAssignBidManager = (bidId: string, managerId: string) => {
    // In a real app, this would call an API to assign the bid manager
    console.log(`Assigning user ${managerId} as manager for bid ${bidId}`)
    setIsAssignManagerModalOpen(false)
    // You would update the bid manager here and refresh the data
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="space-y-6 py-4">
            {/* Header section with key information */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">{bid.name}</h2>
                <p className="text-muted-foreground">{bid.note}</p>
              </div>
              <div className="flex items-center">
                <Badge
                  variant="outline"
                  className={statusColors[bid.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}
                >
                  {bid.status}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Bid ID</h4>
                  <p>{bid.id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Bid Year</h4>
                  <p>{bid.bidYear}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
                  <p>{getCategoryName(bid.category)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Award Type</h4>
                  <p>{bid.awardType || "Not specified"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Estimated Value</h4>
                  <p>{bid.estimatedValue}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Organization</h4>
                  <p>
                    {bid.organizationType === "co-op" ? "Cooperative" : "District"}: {bid.organizationId}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Dates */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Important Dates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Start Date</h4>
                  <p>{formatDate(bid.startDate)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">End Date</h4>
                  <p>{formatDate(bid.endDate)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Anticipated Opening Date & Time</h4>
                  <p>{formatDateTime(bid.anticipatedOpeningDate)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Award Date</h4>
                  <p>{formatDate(bid.awardDate)}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Contacts */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Contacts</h3>
                {canAssignBidManagers() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAssignManagerModalOpen(true)}
                    className="flex items-center gap-1"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Assign Manager</span>
                  </Button>
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Bid Manager</h4>
                <p>{getBidManagerName(bid.bidManagerId)}</p>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="whitespace-pre-wrap">{bid.description}</p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {canEdit && <Button onClick={onEdit}>Edit Bid</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Bid Manager Modal */}
      <AssignBidManagerModal
        bid={bid}
        open={isAssignManagerModalOpen}
        onOpenChange={setIsAssignManagerModalOpen}
        onSubmit={handleAssignBidManager}
        availableUsers={localMockUsers}
      />
    </>
  )
}
