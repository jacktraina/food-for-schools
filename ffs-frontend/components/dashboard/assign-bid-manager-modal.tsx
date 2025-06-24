"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockUsers } from "@/data/mock-users"

interface AssignBidManagerModalProps {
  bid: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (bidId: string, managerId: string) => void
  availableUsers?: any[]
}

export function AssignBidManagerModal({
  bid,
  open,
  onOpenChange,
  onSubmit,
  availableUsers = mockUsers,
}: AssignBidManagerModalProps) {
  const [selectedManager, setSelectedManager] = useState(bid.bidManagerId || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(bid.id, selectedManager)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Bid Manager</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="bidManager">Select Bid Manager</Label>
            <Select value={selectedManager} onValueChange={setSelectedManager} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a bid manager" />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Assign Manager</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
