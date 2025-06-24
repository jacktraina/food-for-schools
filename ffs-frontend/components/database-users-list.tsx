"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, Edit, UserPlus } from "lucide-react"
import { getAllUsers, type User } from "@/lib/api/users"

export default function DatabaseUsersList() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load users from database
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true)
        const userData = await getAllUsers()
        setUsers(userData)
        setFilteredUsers(userData)
      } catch (err) {
        setError("Failed to load users from database")
        console.error("Error loading users:", err)
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  // Filter users based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = users.filter(
        (user) =>
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.roles.some((role) => role.type.toLowerCase().includes(query)),
      )
      setFilteredUsers(filtered)
    }
  }, [searchQuery, users])

  // Get primary role for display
  const getPrimaryRole = (user: User): string => {
    if (user.roles.some((role) => role.type === "Group Admin")) return "Group Admin"
    if (user.roles.some((role) => role.type === "District Admin")) return "District Admin"
    if (user.roles.some((role) => role.type === "School Admin")) return "School Admin"
    if (user.roles.some((role) => role.type === "Viewer")) return "Viewer"
    return "User"
  }

  // Get primary bid role for display
  const getPrimaryBidRole = (user: User): string => {
    if (user.bidRoles.some((role) => role.type === "Bid Administrator")) return "Bid Administrator"
    if (user.managedBids && user.managedBids.length > 0) return "Bid Manager"
    if (user.bidRoles.some((role) => role.type === "Bid Viewer")) return "Bid Viewer"
    return "None"
  }

  // Get organization names for display
  const getOrganizationNames = (user: User): string => {
    const orgNames = user.roles.map((role) => role.scope.name).filter(Boolean)
    return orgNames.length > 0 ? orgNames.join(", ") : "None"
  }

  // Format last login date
  const formatLastLogin = (lastLogin: string | null): string => {
    if (!lastLogin) return "Never"
    return new Date(lastLogin).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Database Users</h1>
        </div>
        <div className="h-96 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Loading users from database...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Database Users</h1>
        </div>
        <div className="h-96 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Database Users</h1>
          <p className="text-muted-foreground">Users loaded from Neon PostgreSQL database</p>
        </div>
        <Button variant="default">
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-500 ml-auto">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Bid Role</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  {searchQuery ? "No users match your search" : "No users found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user, index) => (
                <TableRow key={user.id} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50`}>
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getPrimaryRole(user)}</TableCell>
                  <TableCell>{getPrimaryBidRole(user)}</TableCell>
                  <TableCell className="max-w-[200px]">
                    <div className="truncate" title={getOrganizationNames(user)}>
                      {getOrganizationNames(user)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        user.status === "Active"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : user.status === "Inactive"
                            ? "bg-gray-100 text-gray-800 border-gray-200"
                            : "bg-yellow-100 text-yellow-800 border-yellow-200"
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatLastLogin(user.lastLogin)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Database Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Total Users:</span>
            <span className="font-medium ml-2">{users.length}</span>
          </div>
          <div>
            <span className="text-blue-700">Active:</span>
            <span className="font-medium ml-2">{users.filter((u) => u.status === "Active").length}</span>
          </div>
          <div>
            <span className="text-blue-700">Demo Accounts:</span>
            <span className="font-medium ml-2">{users.filter((u) => u.demoAccount).length}</span>
          </div>
          <div>
            <span className="text-blue-700">Bid Managers:</span>
            <span className="font-medium ml-2">{users.filter((u) => u.managedBids.length > 0).length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
