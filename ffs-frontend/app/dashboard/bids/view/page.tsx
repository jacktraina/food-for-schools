"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Download } from "lucide-react"
import { useToast } from "@/components/ui/toast-context"

// Mock data for bids
const mockBids = [
  {
    id: "bid-001",
    title: "School Lunch Program 2023-2024",
    status: "Open",
    category: "Food Service",
    openDate: "2023-08-15",
    closeDate: "2023-09-15",
    documents: 4,
  },
  {
    id: "bid-002",
    title: "Cafeteria Equipment Procurement",
    status: "Closed",
    category: "Equipment",
    openDate: "2023-07-01",
    closeDate: "2023-08-01",
    documents: 3,
  },
  {
    id: "bid-003",
    title: "Fresh Produce Supply Chain",
    status: "Awarded",
    category: "Food Supply",
    openDate: "2023-06-01",
    closeDate: "2023-07-01",
    documents: 5,
  },
  {
    id: "bid-004",
    title: "Transportation Services",
    status: "Draft",
    category: "Services",
    openDate: "2023-09-01",
    closeDate: "2023-10-01",
    documents: 2,
  },
  {
    id: "bid-005",
    title: "Janitorial Supplies",
    status: "Open",
    category: "Supplies",
    openDate: "2023-08-01",
    closeDate: "2023-09-01",
    documents: 3,
  },
]

export default function ViewBidsPage() {
  const [bids, setBids] = useState(mockBids)
  const [selectedBid, setSelectedBid] = useState(null)
  const [userData, setUserData] = useState(null)
  const { toast } = useToast()

  // Load user data from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUserData(parsedUser)
      } catch (e) {
        console.error("Failed to parse user data:", e)
      }
    }
  }, [])

  // Update the canEditBids function to properly check for bid managers
  // Replace the existing canEditBids function with this updated version:

  const canEditBids = () => {
    if (!userData) return false

    // Administrator can always edit
    if (userData.role === "Administrator") return true

    // Check if user has Co-op Admin or District Admin role
    if (userData.roles && userData.roles.some((role) => role.type === "Co-op Admin" || role.type === "District Admin"))
      return true

    // Bid Team Member with specific permissions
    if (userData.role === "Bid Team Member" && userData.permissions?.includes("edit_bids")) return true

    // Check if user has Bid Administrator role
    if (
      userData.bidRoles &&
      userData.bidRoles.some((role) => role.type === "Bid Administrator" && role.permissions.includes("edit_bids"))
    )
      return true

    return false
  }

  const handleViewBid = (bid) => {
    setSelectedBid(bid)
    // In a real app, you would open a modal or navigate to a detailed view
    toast({
      title: "Viewing Bid",
      description: `You are viewing ${bid.title}`,
    })
  }

  const handleDownloadDocuments = (bid) => {
    // In a real app, this would trigger document downloads
    toast({
      title: "Downloading Documents",
      description: `Downloading ${bid.documents} documents for ${bid.title}`,
    })
  }

  // Function to get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case "Open":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">{status}</Badge>
      case "Closed":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>
      case "Awarded":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">{status}</Badge>
      case "Draft":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">{status}</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">View Bids</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Bids</CardTitle>
          <CardDescription>View all bids in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bid Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Open Date</TableHead>
                <TableHead>Close Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bids.map((bid) => (
                <TableRow key={bid.id}>
                  <TableCell className="font-medium">{bid.title}</TableCell>
                  <TableCell>{bid.category}</TableCell>
                  <TableCell>{getStatusBadge(bid.status)}</TableCell>
                  <TableCell>{bid.openDate}</TableCell>
                  <TableCell>{bid.closeDate}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewBid(bid)}
                        className="h-8 px-2 lg:px-3"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only md:not-sr-only md:ml-2">View</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadDocuments(bid)}
                        className="h-8 px-2 lg:px-3"
                      >
                        <Download className="h-4 w-4" />
                        <span className="sr-only md:not-sr-only md:ml-2">Documents ({bid.documents})</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
