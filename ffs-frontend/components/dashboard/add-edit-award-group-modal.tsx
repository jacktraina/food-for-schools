"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface AddEditAwardGroupModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { name: string; itemIds: string[] }) => void
  awardGroup?: string
  allItems: any[]
  selectedItemIds?: string[]
  isEdit?: boolean
}

export function AddEditAwardGroupModal({
  isOpen,
  onClose,
  onSave,
  awardGroup = "",
  allItems,
  selectedItemIds = [],
  isEdit = false,
}: AddEditAwardGroupModalProps) {
  const [name, setName] = useState(awardGroup)
  const [itemIds, setItemIds] = useState<string[]>(selectedItemIds)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredItems, setFilteredItems] = useState(allItems)

  useEffect(() => {
    setName(awardGroup)
    setItemIds(selectedItemIds)
  }, [awardGroup, selectedItemIds, isOpen])

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      setFilteredItems(
        allItems.filter(
          (item) =>
            item.itemName.toLowerCase().includes(query) ||
            item.id.toLowerCase().includes(query) ||
            (item.acceptableBrands && item.acceptableBrands.toLowerCase().includes(query)),
        ),
      )
    } else {
      setFilteredItems(allItems)
    }
  }, [searchQuery, allItems])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ name, itemIds })
    onClose()
  }

  const toggleItem = (itemId: string) => {
    setItemIds((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId)
      } else {
        return [...prev, itemId]
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isEdit ? `Edit Award Group: ${awardGroup}` : "Add Award Group"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Award Group Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter award group name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Select Items</Label>
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-2"
              />
              <div className="border rounded-md p-4 max-h-[400px] overflow-y-auto">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No items found</div>
                ) : (
                  <div className="space-y-2">
                    {filteredItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`item-${item.id}`}
                          checked={itemIds.includes(item.id)}
                          onCheckedChange={() => toggleItem(item.id)}
                        />
                        <Label htmlFor={`item-${item.id}`} className="flex-1 cursor-pointer">
                          <span className="font-medium">{item.id}</span> - {item.itemName}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {itemIds.length} {itemIds.length === 1 ? "item" : "items"} selected
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{isEdit ? "Update" : "Create"} Award Group</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
