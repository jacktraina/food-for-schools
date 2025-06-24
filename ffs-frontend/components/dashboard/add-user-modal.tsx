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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data for bids, districts, and schools
const mockBids = [
  { id: "bid1", title: "School Lunch Program 2023" },
  { id: "bid2", title: "Breakfast Program Supplies" },
  { id: "bid3", title: "Fresh Fruit and Vegetable Initiative" },
  { id: "bid4", title: "Cafeteria Equipment Upgrade" },
  { id: "bid5", title: "Nutrition Education Materials" },
]

const mockDistricts = [
  { id: "district1", name: "Springfield School District", isInCoop: true, coopId: "coop1" },
  { id: "district2", name: "Riverdale School District", isInCoop: true, coopId: "coop1" },
  { id: "district3", name: "Oakwood School District", isInCoop: false },
  { id: "district4", name: "Westfield School District", isInCoop: true, coopId: "coop2" },
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

// Bid roles with descriptions
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

interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
  onInvite: (data: {
    firstName: string
    lastName: string
    email: string
    role: string
    bidRole: string
    districtId?: string
    schoolId?: string
    permissions?: string[]
    bidPermissions?: string[]
  }) => void
  currentUser?: any
  currentUserRole?: string
  currentUserOrganizationType?: "Coop" | "SingleDistrict"
  isBidManager?: boolean
}

// Export both the new name and the old name for backward compatibility
export function AddUserModal({
  isOpen,
  onClose,
  onInvite,
  currentUser,
  currentUserRole = "Group Admin",
  currentUserOrganizationType = "Coop",
  isBidManager = false,
}: AddUserModalProps) {
  // Split name into first and last name
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("")
  const [bidRole, setBidRole] = useState("Bid Viewer")
  const [selectedDistrict, setSelectedDistrict] = useState("none")
  const [selectedSchool, setSelectedSchool] = useState("none")
  const [activeTab, setActiveTab] = useState("user-info")
  const [errors, setErrors] = useState<{
    firstName?: string
    lastName?: string
    email?: string
    role?: string
    district?: string
    school?: string
    bidRole?: string
  }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const hasRole = (user: any, roleName: string) => {
    return user?.roles?.some((role) => role.type === roleName)
  }

  // Get available districts based on user role
  const getAvailableDistricts = () => {
    if (!currentUser) return []

    // Group Admins can see all districts in their co-op
    if (hasRole(currentUser, "Group Admin")) {
      // Get the co-op IDs the current user administers
      const coopRoles = currentUser.roles.filter((role) => role.type === "Group Admin" && role.scope.type === "coop")
      const coopIds = coopRoles.map((role) => role.scope.id)

      // Return all districts that belong to these co-ops
      return mockDistricts.filter((district) => district.isInCoop && coopIds.includes(district.coopId || ""))
    }

    // District Admins can only see their own district
    if (hasRole(currentUser, "District Admin")) {
      const districtRoles = currentUser.roles.filter(
        (role) => role.type === "District Admin" && role.scope.type === "district",
      )
      const districtIds = districtRoles.map((role) => role.scope.id)

      return mockDistricts.filter((district) => districtIds.includes(district.id))
    }

    // School Admins can see the district their school belongs to
    if (hasRole(currentUser, "School Admin")) {
      const schoolRoles = currentUser.roles.filter(
        (role) => role.type === "School Admin" && role.scope.type === "school",
      )
      const schoolIds = schoolRoles.map((role) => role.scope.id)

      // Find districts that contain these schools
      const districtIds = new Set<string>()
      schoolIds.forEach((schoolId) => {
        const school = mockSchools.find((s) => s.id === schoolId)
        if (school) {
          districtIds.add(school.districtId)
        }
      })

      return mockDistricts.filter((district) => districtIds.has(district.id))
    }

    return []
  }

  // Get available schools based on selected district
  const getAvailableSchools = () => {
    if (!selectedDistrict || selectedDistrict === "none") return []

    // Return all schools in the selected district
    return mockSchools.filter((school) => school.districtId === selectedDistrict)
  }

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  // Auto-select district if user only has access to one district
  useEffect(() => {
    if (currentUser && isOpen) {
      const availableDistricts = getAvailableDistricts()
      if (availableDistricts.length === 1 && selectedDistrict === "none") {
        setSelectedDistrict(availableDistricts[0].id)
      }
    }
  }, [currentUser, isOpen])

  // Reset school selection when district changes
  useEffect(() => {
    setSelectedSchool("none")
  }, [selectedDistrict])

  // Validate form for submission
  const validateForm = () => {
    const newErrors: {
      firstName?: string
      lastName?: string
      email?: string
      role?: string
      district?: string
      school?: string
      bidRole?: string
    } = {}

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid"
    }

    if (!role) {
      newErrors.role = "Role is required"
    }

    // Validate district selection based on role requirements
    if (role === "District Admin" || role === "School Admin") {
      if (selectedDistrict === "none" || !selectedDistrict) {
        newErrors.district = "Please select a district"
      }
    }

    // Validate school selection for School Admin
    if (role === "School Admin" && (selectedSchool === "none" || !selectedSchool)) {
      newErrors.school = "Please select a school"
    }

    if (!bidRole) {
      newErrors.bidRole = "Bid role is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle tab change - no validation when moving to permissions
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  // Handle Next button click - move to permissions tab
  const handleNext = () => {
    setActiveTab("permissions")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Only validate on final submission
    if (validateForm()) {
      // Determine permissions based on role
      const permissions: string[] = []
      if (role === "Group Admin") {
        permissions.push("manage_coop", "manage_districts", "manage_users", "view_all")
      } else if (role === "District Admin") {
        permissions.push("manage_district", "manage_schools", "manage_users", "view_all")
      } else if (role === "School Admin") {
        permissions.push("manage_school", "view_district", "view_coop")
      } else if (role === "Viewer") {
        permissions.push("view_all")
      }

      // Determine bid permissions based on bid role
      const bidPermissions: string[] = []
      if (bidRole === "Bid Administrator") {
        bidPermissions.push("create_bids", "edit_bids", "manage_bid_items", "assign_bid_administrators")
      } else {
        bidPermissions.push("view_bids") // Default for Bid Viewer
      }

      const userData = {
        firstName,
        lastName,
        email,
        role,
        bidRole,
        districtId: selectedDistrict !== "none" ? selectedDistrict : undefined,
        schoolId: selectedSchool !== "none" ? selectedSchool : undefined,
        permissions,
        bidPermissions,
        status: "Pending", // Set status to Pending for new invites
      }

      onInvite(userData)
      resetForm()
    } else if (activeTab === "permissions") {
      // If there are errors in the user info tab, switch to it
      setActiveTab("user-info")
    }
  }

  const resetForm = () => {
    setFirstName("")
    setLastName("")
    setEmail("")
    setRole("")
    setBidRole("Bid Viewer")
    setSelectedDistrict("none")
    setSelectedSchool("none")
    setActiveTab("user-info")
    setErrors({})
    setIsSubmitting(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const availableRoles = getAvailableRoles()
  const availableDistricts = getAvailableDistricts()
  const availableSchools = getAvailableSchools()

  // Required field indicator component
  const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center">
      {children}
      <span className="text-red-500 ml-1">*</span>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>Invite a new user to your organization.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="user-info">User Information</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>

            <TabsContent value="user-info" className="space-y-4 mt-0">
              <div className="grid gap-4 py-2">
                {/* First Name and Last Name fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <RequiredLabel>
                      <Label htmlFor="firstName">First Name</Label>
                    </RequiredLabel>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter first name"
                    />
                    {isSubmitting && errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
                  </div>
                  <div className="grid gap-2">
                    <RequiredLabel>
                      <Label htmlFor="lastName">Last Name</Label>
                    </RequiredLabel>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter last name"
                    />
                    {isSubmitting && errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
                  </div>
                </div>

                {/* Email field */}
                <div className="grid gap-2">
                  <RequiredLabel>
                    <Label htmlFor="email">Email</Label>
                  </RequiredLabel>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter user's email address"
                  />
                  {isSubmitting && errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>

                {/* District field with updated label */}
                <div className="grid gap-2">
                  <Label htmlFor="district">District (if applicable)</Label>
                  <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                    <SelectTrigger id="district">
                      <SelectValue placeholder="Select a district" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {availableDistricts.map((district) => (
                        <SelectItem key={district.id} value={district.id}>
                          {district.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isSubmitting && errors.district && <p className="text-sm text-red-500">{errors.district}</p>}
                </div>

                {/* School field with updated label */}
                <div className="grid gap-2">
                  <Label htmlFor="school">School (if applicable)</Label>
                  <Select
                    value={selectedSchool}
                    onValueChange={setSelectedSchool}
                    disabled={selectedDistrict === "none"}
                  >
                    <SelectTrigger id="school">
                      <SelectValue
                        placeholder={selectedDistrict === "none" ? "Select a district first" : "Select a school"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {availableSchools.map((school) => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isSubmitting && errors.school && <p className="text-sm text-red-500">{errors.school}</p>}
                </div>

                {/* Role field */}
                <div className="grid gap-2">
                  <RequiredLabel>
                    <Label>Role</Label>
                  </RequiredLabel>
                  <RadioGroup value={role} onValueChange={setRole} className="gap-3">
                    {availableRoles.map((availableRole) => (
                      <div key={availableRole.id} className="flex items-start space-x-2 rounded-md border p-3">
                        <RadioGroupItem value={availableRole.name} id={availableRole.id} className="mt-1" />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor={availableRole.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {availableRole.name}
                          </label>
                          <p className="text-sm text-muted-foreground">{availableRole.description}</p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                  {isSubmitting && errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleNext}>
                  Next
                </Button>
              </DialogFooter>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <RequiredLabel>
                    <Label>Bid Management Role</Label>
                  </RequiredLabel>
                  <RadioGroup value={bidRole} onValueChange={setBidRole} className="gap-3">
                    {bidRoles.map((availableBidRole) => (
                      <div key={availableBidRole.id} className="flex items-start space-x-2 rounded-md border p-3">
                        <RadioGroupItem value={availableBidRole.name} id={availableBidRole.id} className="mt-1" />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor={availableBidRole.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {availableBidRole.name}
                          </label>
                          <p className="text-sm text-muted-foreground">{availableBidRole.description}</p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                  {isSubmitting && errors.bidRole && <p className="text-sm text-red-500">{errors.bidRole}</p>}
                </div>

                {/* Additional permissions could be added here */}
              </div>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setActiveTab("user-info")}>
                  Back
                </Button>
                <Button type="submit">Send Invite</Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// For backward compatibility
export { AddUserModal as InviteUserModal }
