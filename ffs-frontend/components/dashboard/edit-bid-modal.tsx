"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { mockUsers } from "@/data/mock-users"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface EditBidModalProps {
  bid: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (bid: any) => void
}

// Custom searchable dropdown component
interface SearchableDropdownProps {
  id: string
  value: string
  onChange: (value: string) => void
  options: { id: string; name: string }[]
  placeholder: string
  required?: boolean
  className?: string
  disabled?: boolean
}

const SearchableDropdown = ({
  id,
  value,
  onChange,
  options,
  placeholder,
  required,
  className,
  disabled = false,
}: SearchableDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const filteredOptions = options.filter((option) => option.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const selectedOption = options.find((option) => option.id === value)

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <div
        className={cn(
          "flex items-center justify-between border rounded-md px-3 py-2 bg-background h-10",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex-1 truncate text-sm">{selectedOption ? selectedOption.name : placeholder}</div>
        {!disabled && <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-10 mt-1 w-full bg-background shadow-lg rounded-md border overflow-hidden">
          <div className="p-2">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="h-8 text-sm"
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-auto">
            <div className="py-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.id}
                    className={cn(
                      "px-3 py-2 cursor-pointer text-sm",
                      option.id === value ? "bg-accent" : "hover:bg-accent",
                    )}
                    onClick={() => {
                      onChange(option.id)
                      setIsOpen(false)
                      setSearchTerm("")
                    }}
                  >
                    {option.name}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-muted-foreground text-center">No options found</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function EditBidModal({ bid, open, onOpenChange, onSubmit }: EditBidModalProps) {
  const [bidData, setBidData] = useState({ ...bid })
  const [localMockUsers, setLocalMockUsers] = useState<any[]>(mockUsers)

  // Load mock users from localStorage
  useEffect(() => {
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

  // Reset form when bid changes
  useEffect(() => {
    setBidData({ ...bid })
  }, [bid])

  const handleChange = (field: string, value: any) => {
    // If changing the name field and it's a category ID, also update the category field
    if (field === "name") {
      const selectedCategory = bidCategories.find((cat) => cat.id === value)
      if (selectedCategory) {
        setBidData({
          ...bidData,
          [field]: value,
          category: value, // Set category to same value as name
        })
        return
      }
    }

    setBidData({ ...bidData, [field]: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(bidData)
  }

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
    { id: "9", name: "Dishwashing Supplies and Service", description: "Dishwashing supplies and services" },
    { id: "10", name: "Direct Diversion", description: "Direct diversion products" },
    { id: "11", name: "Drinks", description: "Beverage products" },
    { id: "12", name: "Drinks-Non Student", description: "Beverage products not for students" },
    { id: "13", name: "Bagel", description: "Bagel products" },
  ]

  // Bid status options
  const bidStatuses = [
    { id: "In Process", name: "In Process" },
    { id: "Released", name: "Released" },
    { id: "Opened", name: "Opened" },
    { id: "Awarded", name: "Awarded" },
    { id: "Canceled", name: "Canceled" },
    { id: "Archived", name: "Archived" },
  ]

  // Award type options
  const awardTypes = [
    { id: "Line Item", name: "Line Item" },
    { id: "Bottom Line", name: "Bottom Line" },
    { id: "Market Basket", name: "Market Basket" },
    { id: "RFP", name: "RFP" },
    { id: "Item Group", name: "Item Group" },
  ]

  // Format users for the searchable dropdown
  const userOptions = localMockUsers.map((user) => ({
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
  }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Bid: {bid.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Bid Name</Label>
                <SearchableDropdown
                  id="name"
                  value={bidData.name}
                  onChange={(value) => handleChange("name", value)}
                  options={bidCategories}
                  placeholder="Select a bid category"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bidYear">Bid Year</Label>
                <Input
                  id="bidYear"
                  value={bidData.bidYear}
                  onChange={(e) => handleChange("bidYear", e.target.value)}
                  placeholder="e.g., 2023-2024"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <SearchableDropdown
                  id="category"
                  value={bidData.category}
                  onChange={(value) => handleChange("category", value)}
                  options={bidCategories}
                  placeholder="Select a category"
                  required
                  disabled={true}
                />
                <p className="text-xs text-muted-foreground mt-1">Category is automatically set based on Bid Name</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <SearchableDropdown
                  id="status"
                  value={bidData.status}
                  onChange={(value) => handleChange("status", value)}
                  options={bidStatuses}
                  placeholder="Select a status"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="awardType">Award Type</Label>
                <SearchableDropdown
                  id="awardType"
                  value={bidData.awardType}
                  onChange={(value) => handleChange("awardType", value)}
                  options={awardTypes}
                  placeholder="Select an award type"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedValue">Estimated Value</Label>
                <Input
                  id="estimatedValue"
                  value={bidData.estimatedValue}
                  onChange={(e) => handleChange("estimatedValue", e.target.value)}
                  placeholder="e.g., $250,000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Short Note</Label>
                <Input
                  id="note"
                  value={bidData.note}
                  onChange={(e) => handleChange("note", e.target.value)}
                  placeholder="Brief description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bidManager">Bid Manager</Label>
                <SearchableDropdown
                  id="bidManager"
                  value={bidData.bidManager}
                  onChange={(value) => handleChange("bidManager", value)}
                  options={userOptions}
                  placeholder="Select a bid manager"
                  required
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Important Dates</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <DatePicker
                  date={bidData.startDate}
                  setDate={(date) => handleChange("startDate", date)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <DatePicker
                  date={bidData.endDate}
                  setDate={(date) => handleChange("endDate", date)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Anticipated Opening Date</Label>
                <DatePicker
                  date={bidData.anticipatedOpeningDate}
                  setDate={(date) => handleChange("anticipatedOpeningDate", date)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Award Date</Label>
                <DatePicker
                  date={bidData.awardDate}
                  setDate={(date) => handleChange("awardDate", date)}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Description</h3>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description</Label>
              <Textarea
                id="description"
                value={bidData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Enter a detailed description of the bid"
                rows={5}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
