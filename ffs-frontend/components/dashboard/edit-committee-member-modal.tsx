"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast-context"

interface CommitteeMember {
  id: string
  userId?: string
  name: string
  district: string
  email: string
  phone: string
  bidId: string
  isManager?: boolean
}

interface EditCommitteeMemberModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: CommitteeMember | null
  onMemberUpdated: (member: CommitteeMember) => void
}

export function EditCommitteeMemberModal({
  open,
  onOpenChange,
  member,
  onMemberUpdated,
}: EditCommitteeMemberModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    id: "",
    userId: "",
    name: "",
    district: "",
    email: "",
    phone: "",
    bidId: "",
  })

  useEffect(() => {
    if (member) {
      setFormData({
        id: member.id,
        userId: member.userId || "",
        name: member.name,
        district: member.district,
        email: member.email,
        phone: member.phone || "",
        bidId: member.bidId,
      })
    }
  }, [member])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!member) return

    try {
      // Validate form
      if (!formData.name || !formData.district || !formData.email) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        })
        return
      }

      // Update member via API
      const response = await fetch(`/api/committee-members/${member.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          district: formData.district,
          email: formData.email,
          phone: formData.phone,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update committee member")
      }

      const updatedMember = await response.json()

      // Add back the isManager flag if it was present
      if (member.isManager) {
        updatedMember.isManager = true
      }

      // Notify parent component
      onMemberUpdated(updatedMember)

      // Close modal
      onOpenChange(false)

      toast({
        title: "Committee Member Updated",
        description: `${updatedMember.name}'s information has been updated.`,
        variant: "success",
      })
    } catch (error) {
      console.error("Error updating committee member:", error)
      toast({
        title: "Error",
        description: "Failed to update committee member. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!member) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Committee Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="district" className="text-right">
                District <span className="text-red-500">*</span>
              </Label>
              <Input
                id="district"
                name="district"
                value={formData.district || ""}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                className="col-span-3"
                placeholder="(xxx) xxx-xxxx"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
