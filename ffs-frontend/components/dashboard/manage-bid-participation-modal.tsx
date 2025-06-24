"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Plus, Trash2, CheckSquare, Square, Users } from "lucide-react"
import { mockBids } from "@/data/mock-bids"

interface ManageBidParticipationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  district: any
  schools: any[]
  participatingBids: any[]
  onSave: (updatedBids: any[]) => void
}

// Helper function to get bid description
const getBidDescription = (bidName: string) => {
  const descriptions: Record<string, string> = {
    Bagel: "Fresh and frozen bagel products for breakfast programs",
    Bread: "Fresh bread products including sandwich bread, rolls, and specialty items",
    Dairy: "Milk, cheese, yogurt, and other dairy products for meal programs",
    Desks: "Student desks, chairs, and classroom furniture",
    "Fresh Produce": "Fresh fruits and vegetables for healthy meal options",
    "Frozen Foods": "Frozen meal components, vegetables, and prepared foods",
    "Office Supplies": "General office supplies, paper, pens, and administrative materials",
    "Paper Products": "Paper plates, napkins, cups, and disposable food service items",
    Technology: "Computer equipment, tablets, interactive boards, and educational technology",
    "Cleaning Supplies": "Janitorial supplies, disinfectants, and maintenance products",
    "Food Service Equipment": "Kitchen equipment, serving lines, and food preparation tools",
    "Maintenance Supplies": "General maintenance and repair supplies",
  }
  return descriptions[bidName] || "No description available"
}

export function ManageBidParticipationModal({
  open,
  onOpenChange,
  district,
  schools,
  participatingBids,
  onSave,
}: ManageBidParticipationModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBids, setSelectedBids] = useState<any[]>([])
  const [editingBid, setEditingBid] = useState<any>(null)

  // Initialize selected bids when modal opens
  useEffect(() => {
    if (open) {
      setSelectedBids(
        participatingBids.map((bid) => ({
          ...bid,
          participatingSchools: bid.participatingSchools || schools.map((s) => s.id),
        })),
      )
    }
  }, [open, participatingBids, schools])

  // Get available bids (all bids not currently selected)
  const availableBids = mockBids.filter(
    (bid) =>
      !selectedBids.some((selectedBid) => selectedBid.id === bid.id) &&
      (bid.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getBidDescription(bid.name).toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleAddBid = (bid: any) => {
    const newBid = {
      ...bid,
      description: getBidDescription(bid.name),
      participatingSchools: schools.map((s) => s.id), // Default to all schools
    }
    setSelectedBids([...selectedBids, newBid])
  }

  const handleRemoveBid = (bidId: string) => {
    setSelectedBids(selectedBids.filter((bid) => bid.id !== bidId))
  }

  const handleEditBid = (bid: any) => {
    setEditingBid({
      ...bid,
      participatingSchools: [...(bid.participatingSchools || [])],
    })
  }

  const handleSaveEditBid = () => {
    if (editingBid) {
      setSelectedBids(selectedBids.map((bid) => (bid.id === editingBid.id ? editingBid : bid)))
      setEditingBid(null)
    }
  }

  const handleSchoolToggle = (schoolId: string, checked: boolean) => {
    if (!editingBid) return

    setEditingBid({
      ...editingBid,
      participatingSchools: checked
        ? [...editingBid.participatingSchools, schoolId]
        : editingBid.participatingSchools.filter((id: string) => id !== schoolId),
    })
  }

  const handleSelectAllSchools = () => {
    if (!editingBid) return
    setEditingBid({
      ...editingBid,
      participatingSchools: schools.map((s) => s.id),
    })
  }

  const handleDeselectAllSchools = () => {
    if (!editingBid) return
    setEditingBid({
      ...editingBid,
      participatingSchools: [],
    })
  }

  const handleSelectByType = (schoolType: string) => {
    if (!editingBid) return
    const schoolsOfType = schools.filter((s) => s.type === schoolType).map((s) => s.id)
    setEditingBid({
      ...editingBid,
      participatingSchools: [...new Set([...editingBid.participatingSchools, ...schoolsOfType])],
    })
  }

  const handleSubmit = () => {
    onSave(selectedBids)
  }

  const schoolTypes = [...new Set(schools.map((s) => s.type).filter(Boolean))]

  if (editingBid) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Edit School Participation - {editingBid.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium">{editingBid.name}</h4>
              <p className="text-sm text-muted-foreground mt-1">{editingBid.description}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Select Participating Schools</h3>
                <div className="text-sm text-muted-foreground">
                  {editingBid.participatingSchools.length} of {schools.length} schools selected
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={handleSelectAllSchools}>
                  <CheckSquare className="mr-1 h-3 w-3" />
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeselectAllSchools}>
                  <Square className="mr-1 h-3 w-3" />
                  Deselect All
                </Button>
                {schoolTypes.map((type) => (
                  <Button key={type} variant="outline" size="sm" onClick={() => handleSelectByType(type)}>
                    <Users className="mr-1 h-3 w-3" />
                    {type}s
                  </Button>
                ))}
              </div>

              <ScrollArea className="h-64 border rounded-md p-4">
                <div className="space-y-2">
                  {schools.map((school) => (
                    <div key={school.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`school-${school.id}`}
                        checked={editingBid.participatingSchools.includes(school.id)}
                        onCheckedChange={(checked) => handleSchoolToggle(school.id, checked as boolean)}
                      />
                      <Label htmlFor={`school-${school.id}`} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span>{school.name}</span>
                          <div className="flex items-center gap-2">
                            {school.type && (
                              <Badge variant="outline" className="text-xs">
                                {school.type}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {school.enrollment?.toLocaleString()} students
                            </span>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingBid(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditBid}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Manage Bid Participation - {district.name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current">Current Participation ({selectedBids.length})</TabsTrigger>
            <TabsTrigger value="available">Available Bids</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Bids that {district.name} is currently participating in.
            </div>

            <ScrollArea className="h-96">
              {selectedBids.length > 0 ? (
                <div className="space-y-3">
                  {selectedBids.map((bid) => (
                    <Card key={bid.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{bid.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{bid.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>
                                Status:{" "}
                                <Badge variant="outline" className="ml-1 text-xs">
                                  {bid.status}
                                </Badge>
                              </span>
                              <span>Year: {bid.bidYear}</span>
                              <span>
                                Schools: {bid.participatingSchools?.length || 0} of {schools.length}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditBid(bid)}>
                              Edit Schools
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleRemoveBid(bid.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No bids selected for participation yet.</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="available" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search available bids..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>

              <ScrollArea className="h-96">
                {availableBids.length > 0 ? (
                  <div className="space-y-3">
                    {availableBids.map((bid) => (
                      <Card key={bid.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{bid.name}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{getBidDescription(bid.name)}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>
                                  Status:{" "}
                                  <Badge variant="outline" className="ml-1 text-xs">
                                    {bid.status}
                                  </Badge>
                                </span>
                                <span>Year: {bid.bidYear}</span>
                                <span>Type: {bid.awardType}</span>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleAddBid(bid)}>
                              <Plus className="mr-1 h-4 w-4" />
                              Add
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No available bids found.</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Participation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
