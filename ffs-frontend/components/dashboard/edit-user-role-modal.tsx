"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { getFullName } from "@/types/user"

// Mock data for districts and schools
const mockDistricts = [
  { id: "district1", name: "Springfield School District" },
  { id: "district2", name: "Riverdale School District" },
  { id: "district3", name: "Oakwood School District" },
  { id: "district4", name: "Westfield School District" },
]

const mockSchools = [
  { id: "school1", name: "Springfield Elementary School", districtId: "district1" },
  { id: "school2", name: "Springfield Middle School", districtId: "district1" },
  { id: "school3", name: "Springfield High School", districtId: "district1" },
  { id: "school4", name: "Riverdale Elementary", districtId: "district2" },
  { id: "school5", name: "Riverdale High School", districtId: "district2" },
]

// Updated roles with detailed descriptions
const userRoles = [
  {
    id: "group_admin",
    name: "Group Admin",
    description: "Manages multiple districts within a cooperative group",
  },
  {
    id: "district_admin",
    name: "District Admin",
    description: "Manages a single district",
  },
  {
    id: "school_admin",
    name: "School Admin",
    description: "Manages a specific school within a district",
  },
  {
    id: "viewer",
    name: "Viewer",
    description: "View-only access to information",
  },
]

// Bid roles with descriptions - Updated "Bid Manager" to "Bid Administrator"
const bidRoles = [
  {
    id: "bid_administrator",
    name: "Bid Administrator",
    description: "Can create, edit, and manage bids, and assign other bid administrators",
  },
  {
    id: "bid_viewer",
    name: "Bid Viewer",
    description: "View-only access to bids",
  },
]

interface User {
  id: string
  name: string
  email: string
  role: string
  bidRole?: string
  districtId?: string
  schoolId?: string
  permissions?: string[]
  bidPermissions?: string[]
}

interface EditUserRoleModalProps {
  isOpen: boolean
  onClose: () => void
  user: User
  onSave: (
    role: string,
    bidRole: string,
    additionalData: {
      districtId?: string
      schoolId?: string
      permissions?: string[]
      bidPermissions?: string[]
    },
  ) => void
  currentUserRole?: string
  currentUserOrganizationType?: "Coop" | "SingleDistrict"
  isBidManager?: boolean
}

export function EditUserRoleModal({
  isOpen,
  onClose,
  user,
  onSave,
  currentUserRole = "Group Admin",
  currentUserOrganizationType = "Coop",
  isBidManager = false,
}: EditUserRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState(user.role)
  const [selectedBidRole, setSelectedBidRole] = useState(user.bidRole || "Bid Viewer")
  const [selectedDistrict, setSelectedDistrict] = useState(user.districtId || "")
  const [selectedSchool, setSelectedSchool] = useState(user.schoolId || "")
  const [activeTab, setActiveTab] = useState("user-info")
  const [errors, setErrors] = useState<{
    role?: string
    district?: string
    school?: string
    bidRole?: string
  }>({})

  // Filter available roles based on current user's role
  const getAvailableRoles = () => {
    if (isBidManager) {
      // Bid Administrators can only assign Viewer role
      return userRoles.filter((r) => r.id === "viewer")
    }

    if (currentUserRole === "Group Admin") {
      return userRoles
    } else if (currentUserRole === "District Admin") {
      return userRoles.filter((r) => r.id !== "group_admin")
    } else if (currentUserRole === "School Admin") {
      return userRoles.filter((r) => r.id === "viewer")
    }
    return userRoles
  }

  // Get available districts based on user role
  const getAvailableDistricts = () => {
    if (currentUserRole === "Group Admin" && currentUserOrganizationType === "Coop") {
      return mockDistricts
    } else if (currentUserRole === "District Admin") {
      // For District Admin, only show their own district
      return mockDistricts.filter((d) => d.id === "district1") // Assuming district1 is the current user's district
    }
    return []
  }

  // Get available schools based on selected district
  const getAvailableSchools = () => {
    if (!selectedDistrict) return []
    return mockSchools.filter((s) => s.districtId === selectedDistrict)
  }

  // Reset form when modal closes or user changes
  useEffect(() => {
    if (isOpen) {
      setSelectedRole(user.role)
      setSelectedBidRole(user.bidRole || "Bid Viewer")
      setSelectedDistrict(user.districtId || "")
      setSelectedSchool(user.schoolId || "")
      setActiveTab("user-info")
      setErrors({})
    }
  }, [isOpen, user])

  // Update district/school selection when role changes
  useEffect(() => {
    if (selectedRole === "School Admin" && !selectedDistrict) {
      // If School Admin is selected and no district is selected, select the first available district
      const availableDistricts = getAvailableDistricts()
      if (availableDistricts.length > 0) {
        setSelectedDistrict(availableDistricts[0].id)
      }
    }
  }, [selectedRole])

  const validateForm = () => {
    const newErrors: {
      role?: string
      district?: string
      school?: string
      bidRole?: string
    } = {}

    if (!selectedRole) {
      newErrors.role = "Role is required"
    }

    // Validate district selection for Group Admin, District Admin, and School Admin
    if (
      (selectedRole === "Group Admin" || selectedRole === "District Admin" || selectedRole === "School Admin") &&
      !selectedDistrict
    ) {
      newErrors.district = "Please select a district"
    }

    // Validate school selection for School Admin
    if (selectedRole === "School Admin" && !selectedSchool) {
      newErrors.school = "Please select a school"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      // Determine permissions based on role
      const permissions: string[] = []
      if (selectedRole === "Group Admin") {
        permissions.push("manage_coop", "manage_districts", "manage_users", "view_all")
      } else if (selectedRole === "District Admin") {
        permissions.push("manage_district", "manage_schools", "manage_users", "view_all")
      } else if (selectedRole === "School Admin") {
        permissions.push("manage_school", "view_district", "view_coop")
      } else if (selectedRole === "Viewer") {
        permissions.push("view_all")
      }

      // Determine bid permissions based on bid role
      const bidPermissions: string[] = []
      if (selectedBidRole === "Bid Administrator") {
        bidPermissions.push("create_bids", "edit_bids", "manage_bid_items", "assign_bid_administrators")
      } else {
        bidPermissions.push("view_bids") // Default for Bid Viewer
      }

      const additionalData = {
        districtId: selectedDistrict || undefined,
        schoolId: selectedRole === "School Admin" ? selectedSchool : undefined,
        permissions,
        bidPermissions,
      }

      onSave(selectedRole, selectedBidRole, additionalData)
    }
  }

  const handleClose = () => {
    onClose()
  }

  const availableRoles = getAvailableRoles()
  const availableDistricts = getAvailableDistricts()
  const availableSchools = getAvailableSchools()

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User Role</DialogTitle>
          <DialogDescription>Update role and permissions for {getFullName(user)}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="user-info">User Information</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>

            <TabsContent value="user-info" className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="col-span-4">
                    <p className="text-sm font-medium mb-2">User Information</p>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Role</Label>
                  <RadioGroup value={selectedRole} onValueChange={setSelectedRole} className="gap-3">
                    {availableRoles.map((role) => (
                      <div key={role.id} className="flex items-start space-x-2 rounded-md border p-3">
                        <RadioGroupItem value={role.name} id={`role-${role.id}`} className="mt-1" />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor={`role-${role.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {role.name}
                          </label>
                          <p className="text-sm text-muted-foreground">{role.description}</p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                  {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
                </div>

                {/* District selection for Group Admin, District Admin, and School Admin */}
                {(selectedRole === "Group Admin" ||
                  selectedRole === "District Admin" ||
                  selectedRole === "School Admin") && (
                  <div className="grid gap-2">
                    <Label htmlFor="edit-district">District</Label>
                    <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                      <SelectTrigger id="edit-district">
                        <SelectValue placeholder="Select a district" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDistricts.map((district) => (
                          <SelectItem key={district.id} value={district.id}>
                            {district.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.district && <p className="text-sm text-red-500">{errors.district}</p>}
                  </div>
                )}

                {/* School selection for School Admin */}
                {selectedRole === "School Admin" && selectedDistrict && (
                  <div className="grid gap-2">
                    <Label htmlFor="edit-school">School</Label>
                    <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                      <SelectTrigger id="edit-school">
                        <SelectValue placeholder="Select a school" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSchools.map((school) => (
                          <SelectItem key={school.id} value={school.id}>
                            {school.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.school && <p className="text-sm text-red-500">{errors.school}</p>}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Bid Management Role</Label>
                  <RadioGroup value={selectedBidRole} onValueChange={setSelectedBidRole} className="gap-3">
                    {bidRoles.map((bidRole) => (
                      <div key={bidRole.id} className="flex items-start space-x-2 rounded-md border p-3">
                        <RadioGroupItem value={bidRole.name} id={`bid-role-${bidRole.id}`} className="mt-1" />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor={`bid-role-${bidRole.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {bidRole.name}
                          </label>
                          <p className="text-sm text-muted-foreground">{bidRole.description}</p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                  {errors.bidRole && <p className="text-sm text-red-500">{errors.bidRole}</p>}
                </div>

                {/* Additional permissions could be added here */}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
