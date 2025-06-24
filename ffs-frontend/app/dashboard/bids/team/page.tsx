"use client"

import { useState, useEffect } from "react"
import { Check, Edit, MoreHorizontal, Search, Trash, UserPlus, X, Filter, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AddUserModal } from "@/components/dashboard/add-user-modal"
import { EditUserRoleModal } from "@/components/dashboard/edit-user-role-modal"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { useToast } from "@/components/ui/toast-context"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import type { User, Role, BidRole } from "@/types/user"
import { hasRole, canAccessUserManagement, getVisibleUsers, getUserEntities, getFullName } from "@/types/user"
import { BulkUploadUsersModal } from "@/components/dashboard/bulk-upload-users-modal"

// Mock data for districts and schools
const mockDistricts = [
  { id: "district-123", name: "Springfield School District" },
  { id: "district-456", name: "Riverdale School District" },
  { id: "district-789", name: "Oakwood School District" },
  { id: "district-101", name: "Westfield School District" },
]

const mockSchools = [
  { id: "school-789", name: "Springfield Elementary School", districtId: "district-123" },
  { id: "school-456", name: "Springfield Middle School", districtId: "district-123" },
  { id: "school-123", name: "Springfield High School", districtId: "district-123" },
  { id: "school-234", name: "Riverdale Elementary", districtId: "district-456" },
  { id: "school-345", name: "Riverdale High School", districtId: "district-456" },
]

// Mock data for users with the new role structure
const mockUsers: User[] = [
  // Co-op Admin
  {
    id: "1",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "democoopadmin@foodforschools.com",
    roles: [
      {
        type: "Co-op Admin",
        scope: {
          type: "co-op",
          id: "coop-456",
          name: "Central State Cooperative",
        },
        permissions: ["manage_coop", "manage_districts", "manage_users", "view_all"],
      },
    ],
    bidRoles: [
      {
        type: "Bid Administrator",
        scope: {
          type: "co-op",
          id: "coop-456",
          name: "Central State Cooperative",
        },
        permissions: ["create_bids", "edit_bids", "manage_bid_items", "assign_bid_administrators"],
      },
    ],
    status: "Active",
    lastLogin: "2023-05-15T10:30:00",
  },

  // District Admin
  {
    id: "2",
    firstName: "John",
    lastName: "Smith",
    email: "demodistrictadmin@foodforschools.com",
    roles: [
      {
        type: "District Admin",
        scope: {
          type: "district",
          id: "district-123",
          name: "Springfield School District",
        },
        permissions: ["manage_district", "manage_schools", "manage_users", "view_all"],
      },
    ],
    bidRoles: [
      {
        type: "Bid Administrator",
        scope: {
          type: "district",
          id: "district-123",
          name: "Springfield School District",
        },
        permissions: ["create_bids", "edit_bids", "manage_bid_items", "assign_bid_administrators"],
      },
    ],
    status: "Active",
    lastLogin: "2023-05-14T14:45:00",
  },

  // School Admin
  {
    id: "3",
    firstName: "Robert",
    lastName: "Chen",
    email: "demoschooladmin@foodforschools.com",
    roles: [
      {
        type: "School Admin",
        scope: {
          type: "school",
          id: "school-789",
          name: "Springfield Elementary School",
        },
        permissions: ["manage_school", "view_district", "view_coop"],
      },
    ],
    bidRoles: [
      {
        type: "Bid Viewer",
        scope: {
          type: "district",
          id: "district-123",
          name: "Springfield School District",
        },
        permissions: ["view_bids"],
      },
    ],
    status: "Active",
    lastLogin: "2023-04-30T09:15:00",
  },

  // Viewer
  {
    id: "4",
    firstName: "Jessica",
    lastName: "Martinez",
    email: "demoreadonly@foodforschools.com",
    roles: [
      {
        type: "Viewer",
        scope: {
          type: "district",
          id: "district-123",
          name: "Springfield School District",
        },
        permissions: ["view_all"],
      },
    ],
    bidRoles: [
      {
        type: "Bid Viewer",
        scope: {
          type: "district",
          id: "district-123",
          name: "Springfield School District",
        },
        permissions: ["view_bids"],
      },
    ],
    status: "Active",
    lastLogin: "2023-05-10T11:20:00",
  },

  // Dual Role User (Co-op Admin and District Admin)
  {
    id: "5",
    firstName: "Michael",
    lastName: "Brown",
    email: "demodualadmin@foodforschools.com",
    roles: [
      {
        type: "Co-op Admin",
        scope: {
          type: "co-op",
          id: "coop-456",
          name: "Central State Cooperative",
        },
        permissions: ["manage_coop", "manage_districts", "manage_users", "view_all"],
      },
      {
        type: "District Admin",
        scope: {
          type: "district",
          id: "district-123",
          name: "Springfield School District",
        },
        permissions: ["manage_district", "manage_schools", "manage_users", "view_all"],
      },
    ],
    bidRoles: [
      {
        type: "Bid Administrator",
        scope: {
          type: "co-op",
          id: "coop-456",
          name: "Central State Cooperative",
        },
        permissions: ["create_bids", "edit_bids", "manage_bid_items", "assign_bid_administrators"],
      },
    ],
    status: "Active",
    lastLogin: "2023-05-12T16:20:00",
  },
]

export default function UserManagementPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [bidRoleFilter, setBidRoleFilter] = useState("all")
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const { toast } = useToast()
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false)

  // Load current user data from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User
        setCurrentUser(parsedUser)

        // Check if user can access this page
        if (!canAccessUserManagement(parsedUser)) {
          // Redirect to dashboard if user doesn't have permission
          router.push("/dashboard")
        }
      } catch (e) {
        console.error("Failed to parse user data:", e)
        router.push("/dashboard")
      }
    } else {
      // If no user data is found, redirect to login
      router.push("/")
    }
  }, [router])

  // Filter users based on current user's permissions and search/filter criteria
  const getFilteredUsers = () => {
    if (!currentUser) return []

    // Get users visible to the current user based on their roles
    let filteredList = getVisibleUsers(currentUser, users)

    // Apply search filter
    if (searchQuery) {
      filteredList = filteredList.filter(
        (user) =>
          getFullName(user).toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.roles.some((role) => role.type.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Apply role filter
    if (roleFilter !== "all") {
      filteredList = filteredList.filter((user) => user.roles.some((role) => role.type === roleFilter))
    }

    // Apply bid role filter
    if (bidRoleFilter !== "all") {
      filteredList = filteredList.filter((user) => user.bidRoles.some((role) => role.type === bidRoleFilter))
    }

    return filteredList
  }

  const filteredUsers = getFilteredUsers()

  // Handle adding a new user
  const handleAddUser = (data: {
    name: string
    email: string
    role: string
    bidRole: string
    districtId?: string
    schoolId?: string
    permissions?: string[]
    bidPermissions?: string[]
  }) => {
    const newUser: User = {
      id: (users.length + 1).toString(),
      firstName: data.name.split(" ")[0],
      lastName: data.name.split(" ")[1] || "",
      email: data.email,
      roles: [
        {
          type: data.role,
          scope: {
            type: data.role === "School Admin" ? "school" : data.role === "District Admin" ? "district" : "co-op",
            id: data.role === "School Admin" ? data.schoolId! : data.districtId!,
            name: "Unknown", // This would be fetched from the database in a real app
          },
          permissions: data.permissions || [],
        },
      ],
      bidRoles: [
        {
          type: data.bidRole,
          scope: {
            type: data.role === "School Admin" ? "school" : data.role === "District Admin" ? "district" : "co-op",
            id: data.role === "School Admin" ? data.schoolId! : data.districtId!,
            name: "Unknown", // This would be fetched from the database in a real app
          },
          permissions: data.bidPermissions || [],
        },
      ],
      status: "Pending",
      lastLogin: null,
    }

    setUsers([...users, newUser])
    setIsAddUserModalOpen(false)
    toast({
      title: "User Added",
      description: `${data.email} has been added to the system`,
      variant: "success",
    })
  }

  // Handle editing a user's roles
  const handleEditRole = (userId: string, updatedRoles: Role[], updatedBidRoles: BidRole[]) => {
    setUsers(
      users.map((user) =>
        user.id === userId
          ? {
              ...user,
              roles: updatedRoles,
              bidRoles: updatedBidRoles,
            }
          : user,
      ),
    )
    setIsEditRoleModalOpen(false)
    toast({
      title: "Roles Updated",
      description: `User roles have been updated successfully`,
      variant: "success",
    })
  }

  // Handle deleting a user
  const handleDeleteUser = () => {
    if (selectedUser) {
      setUsers(users.filter((user) => user.id !== selectedUser.id))
      setIsDeleteModalOpen(false)
      toast({
        title: "User Removed",
        description: `${getFullName(selectedUser)} has been removed from the system`,
        variant: "success",
      })
    }
  }

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Get primary role for display
  const getPrimaryRole = (user: User): string => {
    // Order of precedence: Co-op Admin > District Admin > School Admin > Viewer
    if (hasRole(user, "Co-op Admin")) return "Co-op Admin"
    if (hasRole(user, "District Admin")) return "District Admin"
    if (hasRole(user, "School Admin")) return "School Admin"
    if (hasRole(user, "Viewer")) return "Viewer"
    return "User"
  }

  // Get primary bid role for display
  const getPrimaryBidRole = (user: User): string => {
    // Order of precedence: Bid Administrator > Bid Viewer > None
    if (user.bidRoles.some((role) => role.type === "Bid Administrator")) return "Bid Administrator"
    if (user.bidRoles.some((role) => role.type === "Bid Viewer")) return "Bid Viewer"
    return "None"
  }

  // Get districts for display
  const getDistricts = (user: User): string => {
    const districts = getUserEntities(user, "district")
    if (districts.length === 0) return ""

    return districts.map((d) => d.name || d.id).join(", ")
  }

  // Get schools for display
  const getSchools = (user: User): string => {
    const schools = getUserEntities(user, "school")
    if (schools.length === 0) return ""

    return schools.map((s) => s.name || s.id).join(", ")
  }

  // Check if current user can edit another user
  const canEditUser = (user: User): boolean => {
    if (!currentUser) return false

    // Can't edit yourself
    if (currentUser.id === user.id) return false

    // Co-op Admins can edit users in their co-op
    const isCoopAdmin = hasRole(currentUser, "Co-op Admin")
    const currentUserCoopIds = getUserEntities(currentUser, "co-op").map((entity) => entity.id)
    const userCoopIds = getUserEntities(user, "co-op").map((entity) => entity.id)
    const hasCoopOverlap = currentUserCoopIds.some((id) => userCoopIds.includes(id))

    // District Admins can edit users in their district
    const isDistrictAdmin = hasRole(currentUser, "District Admin")
    const currentUserDistrictIds = getUserEntities(currentUser, "district").map((entity) => entity.id)
    const userDistrictIds = getUserEntities(user, "district").map((entity) => entity.id)
    const hasDistrictOverlap = currentUserDistrictIds.some((id) => userDistrictIds.includes(id))

    // Co-op Admins can edit all users in their co-op
    if (isCoopAdmin && hasCoopOverlap) return true

    // District Admins who are not Co-op Admins can only edit users in their district
    if (isDistrictAdmin && !isCoopAdmin && hasDistrictOverlap) return true

    return false
  }

  // Handle bulk upload of users
  const handleBulkUpload = (newUsers: User[]) => {
    setUsers([...users, ...newUsers])
    toast({
      title: "Users Uploaded",
      description: `${newUsers.length} users have been uploaded successfully`,
      variant: "success",
    })
  }

  // If user data is still loading, show a loading state
  if (!currentUser) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage users and their roles for your organization</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button className="w-full sm:w-auto" onClick={() => setIsAddUserModalOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
          <Button className="w-full sm:w-auto" variant="outline" onClick={() => setIsBulkUploadModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Bulk Upload Users
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Users</CardTitle>
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[130px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <span>Role</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="Co-op Admin">Co-op Admin</SelectItem>
                    <SelectItem value="District Admin">District Admin</SelectItem>
                    <SelectItem value="School Admin">School Admin</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={bidRoleFilter} onValueChange={setBidRoleFilter}>
                  <SelectTrigger className="w-[130px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <span>Bid Role</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Bid Roles</SelectItem>
                    <SelectItem value="Bid Administrator">Bid Administrator</SelectItem>
                    <SelectItem value="Bid Viewer">Bid Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <CardDescription>Manage users and their roles for your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Bid Role</TableHead>
                <TableHead>District</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{getFullName(user)}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getPrimaryRole(user)}</TableCell>
                    <TableCell>{getPrimaryBidRole(user)}</TableCell>
                    <TableCell>{getDistricts(user)}</TableCell>
                    <TableCell>{getSchools(user)}</TableCell>
                    <TableCell>
                      {user.status === "Active" && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                          <Check className="mr-1 h-3 w-3" />
                          Active
                        </Badge>
                      )}
                      {user.status === "Inactive" && (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                          <X className="mr-1 h-3 w-3" />
                          Inactive
                        </Badge>
                      )}
                      {user.status === "Pending" && (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(user.lastLogin)}</TableCell>
                    <TableCell>
                      {canEditUser(user) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user)
                                setIsEditRoleModalOpen(true)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Roles
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user)
                                setIsDeleteModalOpen(true)
                              }}
                              className="text-red-600"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Remove User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onInvite={handleAddUser}
        currentUserRole={currentUser ? getPrimaryRole(currentUser) : undefined}
        currentUserOrganizationType={hasRole(currentUser, "Co-op Admin") ? "Coop" : "SingleDistrict"}
        isBidManager={currentUser?.bidRoles.some((role) => role.type === "Bid Administrator") || false}
      />

      {/* Edit User Role Modal */}
      {selectedUser && (
        <EditUserRoleModal
          isOpen={isEditRoleModalOpen}
          onClose={() => setIsEditRoleModalOpen(false)}
          user={selectedUser}
          currentUser={currentUser}
          onSave={(updatedRoles, updatedBidRoles) => handleEditRole(selectedUser.id, updatedRoles, updatedBidRoles)}
        />
      )}

      {/* Delete User Confirmation Modal */}
      {selectedUser && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteUser}
          title="Remove User"
          description={`Are you sure you want to remove ${getFullName(selectedUser)} from the system? This action cannot be undone.`}
          confirmText="Remove"
          cancelText="Cancel"
        />
      )}

      {/* Bulk Upload Users Modal */}
      <BulkUploadUsersModal
        isOpen={isBulkUploadModalOpen}
        onClose={() => setIsBulkUploadModalOpen(false)}
        onUpload={handleBulkUpload}
      />
    </div>
  )
}
