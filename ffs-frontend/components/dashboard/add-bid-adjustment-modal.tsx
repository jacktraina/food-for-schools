"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { useToast } from "@/components/ui/toast-context"
import type { AdjustmentType, BidAdjustment } from "@/data/mock-bid-adjustments"
import { Upload } from "lucide-react"

interface AddBidAdjustmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bidId: string
  onAdjustmentAdded: (adjustment: BidAdjustment) => void
}

export function AddBidAdjustmentModal({ open, onOpenChange, bidId, onAdjustmentAdded }: AddBidAdjustmentModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Form state
  const [itemAffected, setItemAffected] = useState("")
  const [lisdnaCode, setLisdnaCode] = useState("")
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType | "">("")
  const [effectiveDate, setEffectiveDate] = useState<Date | undefined>(undefined)
  const [note, setNote] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!itemAffected || !adjustmentType || !effectiveDate || !note) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // In a real app, you would upload the file to a server here
      // and get back a URL to store in the adjustment record

      // Create a new adjustment object
      const newAdjustment: BidAdjustment = {
        id: `adj-${Date.now()}`,
        bidId,
        itemAffected,
        lisdnaCode: lisdnaCode || undefined,
        adjustmentType: adjustmentType as AdjustmentType,
        effectiveDate,
        note,
        fileUrl: selectedFile ? URL.createObjectURL(selectedFile) : undefined,
        fileName: selectedFile ? selectedFile.name : undefined,
        enteredBy: "user-001", // In a real app, this would be the current user's ID
        enteredDate: new Date(),
      }

      // Call the callback to add the adjustment
      onAdjustmentAdded(newAdjustment)

      // Reset form and close modal
      resetForm()
      onOpenChange(false)

      toast({
        title: "Adjustment Added",
        description: "The bid adjustment has been successfully added.",
        variant: "success",
      })
    } catch (error) {
      console.error("Error adding adjustment:", error)
      toast({
        title: "Error",
        description: "There was an error adding the adjustment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setItemAffected("")
    setLisdnaCode("")
    setAdjustmentType("")
    setEffectiveDate(undefined)
    setNote("")
    setSelectedFile(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add Bid Adjustment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="itemAffected" className="text-right">
                Item Affected <span className="text-red-500">*</span>
              </Label>
              <Input
                id="itemAffected"
                value={itemAffected}
                onChange={(e) => setItemAffected(e.target.value)}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lisdnaCode" className="text-right">
                District Code
              </Label>
              <Input
                id="lisdnaCode"
                value={lisdnaCode}
                onChange={(e) => setLisdnaCode(e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="adjustmentType" className="text-right whitespace-nowrap">
                Adjustment Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={adjustmentType}
                onValueChange={(value) => setAdjustmentType(value as AdjustmentType)}
                required
              >
                <SelectTrigger id="adjustmentType" className="col-span-3">
                  <SelectValue placeholder="Select adjustment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Price Change">Price Change</SelectItem>
                  <SelectItem value="Code Change">Code Change</SelectItem>
                  <SelectItem value="Item Change">Item Change</SelectItem>
                  <SelectItem value="Vendor Change">Vendor Change</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="effectiveDate" className="text-right">
                Effective Date <span className="text-red-500">*</span>
              </Label>
              <div className="col-span-3">
                <DatePicker date={effectiveDate} setDate={setEffectiveDate} className="w-full" />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="note" className="text-right">
                Note <span className="text-red-500">*</span>
              </Label>
              <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} className="col-span-3" required />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file" className="text-right">
                File
              </Label>
              <div className="col-span-3">
                <div className="flex items-center gap-2">
                  <Input id="file" type="file" onChange={handleFileChange} className="hidden" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("file")?.click()}
                    className="w-full justify-start"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {selectedFile ? selectedFile.name : "Upload file"}
                  </Button>
                  {selectedFile && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Adjustment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
