"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"

export interface BidFilters {
  year: string
  status: string[]
  awardType: string
  myBids: boolean
}

interface BidFiltersModalProps {
  isOpen: boolean
  onClose: () => void
  filters: BidFilters
  onApplyFilters: (filters: BidFilters) => void
  bidYears: string[]
  availableStatuses: string[]
  isManager: boolean
}

export function BidFiltersModal({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  bidYears,
  availableStatuses,
  isManager,
}: BidFiltersModalProps) {
  const [localFilters, setLocalFilters] = useState<BidFilters>({ ...filters })

  const handleReset = () => {
    setLocalFilters({
      year: "all",
      status: availableStatuses,
      awardType: "all",
      myBids: false,
    })
  }

  const handleApply = () => {
    onApplyFilters(localFilters)
    onClose()
  }

  const handleStatusChange = (status: string) => {
    setLocalFilters((prev) => {
      const newStatus = prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status]
      return { ...prev, status: newStatus }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Filter Bids</DialogTitle>
          <DialogDescription>Apply filters to narrow down the bid list.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Year filter */}
          <div className="grid gap-2">
            <Label htmlFor="year-filter">Bid Year</Label>
            <Select
              value={localFilters.year}
              onValueChange={(value) => setLocalFilters({ ...localFilters, year: value })}
            >
              <SelectTrigger id="year-filter">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {bidYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status filter */}
          <div className="grid gap-2">
            <Label>Status</Label>
            <div className="grid grid-cols-2 gap-2">
              {availableStatuses.map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status.toLowerCase()}`}
                    checked={localFilters.status.includes(status)}
                    onCheckedChange={() => handleStatusChange(status)}
                  />
                  <label
                    htmlFor={`status-${status.toLowerCase()}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {status}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Award Type filter */}
          <div className="grid gap-2">
            <Label htmlFor="award-type-filter">Award Type</Label>
            <Select
              value={localFilters.awardType}
              onValueChange={(value) => setLocalFilters({ ...localFilters, awardType: value })}
            >
              <SelectTrigger id="award-type-filter">
                <SelectValue placeholder="Select award type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Award Types</SelectItem>
                <SelectItem value="Single">Single</SelectItem>
                <SelectItem value="Multiple">Multiple</SelectItem>
                <SelectItem value="Line Item">Line Item</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* My Bids filter - only show if user is a bid manager */}
          {isManager && (
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="my-bids-filter">Show only my bids</Label>
                <Switch
                  id="my-bids-filter"
                  checked={localFilters.myBids}
                  onCheckedChange={(checked) => setLocalFilters({ ...localFilters, myBids: checked })}
                />
              </div>
              <p className="text-sm text-gray-500">Only show bids where you are assigned as the Bid Manager</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
